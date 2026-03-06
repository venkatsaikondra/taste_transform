import { NextResponse } from 'next/server';
import { connect } from '@/dbConfig/dbConfig';
import Recipe from '@/models/recipeModel';
import Comment from '@/models/commentModel';

export async function GET(request: Request) {
  try {
    await connect();

    const { searchParams } = new URL(request.url);
    const search  = searchParams.get('search') || '';
    const vibe    = searchParams.get('vibe') || '';
    const sort    = searchParams.get('sort') || 'newest';
    const limit   = Math.min(parseInt(searchParams.get('limit') || '20'), 50);
    const page    = Math.max(parseInt(searchParams.get('page') || '1'), 1);

    const filter: Record<string, unknown> = { isPublic: true };
    if (search) {
      filter.$or = [
        { recipeName: { $regex: search, $options: 'i' } },
        { 'ingredients.name': { $regex: search, $options: 'i' } },
      ];
    }
    if (vibe && vibe !== 'all') filter.vibe = vibe;

    const sortMap: Record<string, Record<string, 1 | -1>> = {
      newest:        { createdAt: -1 },
      popular:       { likesCount: -1, createdAt: -1 },
      calories_low:  { totalCalories: 1 },
      calories_high: { totalCalories: -1 },
    };
    const sortQuery = (sortMap[sort] ?? sortMap.newest) as any;

    const [rawRecipes, total] = await Promise.all([
      Recipe.find(filter).sort(sortQuery).skip((page - 1) * limit).limit(limit).lean(),
      Recipe.countDocuments(filter),
    ]);

    const recipeIds = rawRecipes.map((r: any) => r._id);
    const allComments = await Comment.find({ recipeId: { $in: recipeIds } })
      .sort({ createdAt: 1 })
      .lean();

    const commentsByRecipe: Record<string, any[]> = {};
    for (const c of allComments) {
      const key = String(c.recipeId);
      if (!commentsByRecipe[key]) commentsByRecipe[key] = [];
      commentsByRecipe[key].push(c);
    }

    const recipes = rawRecipes.map((r: any) => ({
      ...r,
      // ← MAP steps → instructions so the frontend PostCard can read it
      instructions: r.steps || r.recipeText || '',
      likesCount: r.likesCount || (Array.isArray(r.likes) ? r.likes.length : 0),
      comments: commentsByRecipe[String(r._id)] || [],
      commentCount: (commentsByRecipe[String(r._id)] || []).length,
    }));

    return NextResponse.json({ recipes, total, page, limit });
  } catch (error) {
    console.error('[community GET]', error);
    return NextResponse.json({ error: 'Failed to fetch feed' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connect();
    const body = await request.json();
    const { action, recipeId, userId } = body;

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }

    if (action === 'like') {
      if (!recipeId) return NextResponse.json({ error: 'Missing recipeId' }, { status: 400 });

      const recipe = await Recipe.findById(recipeId);
      if (!recipe) return NextResponse.json({ error: 'Recipe not found' }, { status: 404 });

      const alreadyLiked = recipe.likes?.map(String).includes(String(userId));
      if (alreadyLiked) {
        recipe.likes = recipe.likes.filter((id: any) => String(id) !== String(userId));
      } else {
        recipe.likes = [...(recipe.likes || []), userId];
      }
      recipe.likesCount = recipe.likes.length;
      await recipe.save();

      return NextResponse.json({ liked: !alreadyLiked, likesCount: recipe.likesCount });
    }

    if (action === 'fork') {
      if (!recipeId) return NextResponse.json({ error: 'Missing recipeId' }, { status: 400 });

      const original = await Recipe.findById(recipeId).lean() as any;
      if (!original) return NextResponse.json({ error: 'Recipe not found' }, { status: 404 });

      const forked = await Recipe.create({
        ...original,
        _id: undefined,
        recipeName: `${original.recipeName} (fork)`,
        authorId: userId,
        isPublic: false,
        likes: [],
        likesCount: 0,
        parentRecipeId: recipeId,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      return NextResponse.json({ forked: true, newRecipeId: forked._id });
    }

    if (action === 'comment') {
      const { text } = body;
      if (!recipeId || !text) {
        return NextResponse.json({ error: 'Missing recipeId or text' }, { status: 400 });
      }
      const recipe = await Recipe.findById(recipeId);
      if (!recipe) return NextResponse.json({ error: 'Recipe not found' }, { status: 404 });

      const comment = await Comment.create({ recipeId, authorId: String(userId), text });
      return NextResponse.json({ comment });
    }

    if (action === 'publish') {
      const { recipeName, vibe, instructions } = body;
      if (!recipeName) {
        return NextResponse.json({ error: 'Missing recipeName' }, { status: 400 });
      }

      const newRecipe = new Recipe({
        authorId: String(userId),
        recipeName,
        vibe: vibe || 'cozy',
        // ← schema field is `steps`, not `instructions`
        steps: instructions || '',
        recipeText: instructions || '',
        ingredients: [],
        totalCalories: 0,
        likes: [],
        likesCount: 0,
        isPublic: true,
      });

      await newRecipe.save();

      // ← explicitly map steps → instructions in the response
      return NextResponse.json({
        recipe: {
          _id: newRecipe._id,
          authorId: newRecipe.authorId,
          recipeName: newRecipe.recipeName,
          vibe: newRecipe.vibe,
          instructions: instructions || '',   // ← the key fix
          ingredients: [],
          totalCalories: 0,
          likes: [],
          likesCount: 0,
          isPublic: true,
          comments: [],
          commentCount: 0,
          createdAt: newRecipe.createdAt,
        },
      });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    console.error('[community POST]', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}