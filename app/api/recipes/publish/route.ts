import { NextResponse } from 'next/server';
import { connect } from '@/dbConfig/dbConfig';
import Recipe from '@/models/recipeModel';
import Comment from '@/models/commentModel';

type RecipeDoc = {
  _id?: unknown;
  likes?: unknown[];
  likesCount?: number;
};

type PublishBody = {
  action?: string;
  recipeId?: string;
  userId?: string;
  text?: string;
  recipeName?: string;
  vibe?: string;
  instructions?: string;
};

// GET /api/community?search=&vibe=&sort=newest|popular&limit=20&page=1
export async function GET(request: Request) {
  try {
    await connect();

    const { searchParams } = new URL(request.url);
    const search  = searchParams.get('search') || '';
    const vibe    = searchParams.get('vibe') || '';
    const sort    = searchParams.get('sort') || 'newest';
    const limit   = Math.min(parseInt(searchParams.get('limit') || '20'), 50);
    const page    = Math.max(parseInt(searchParams.get('page') || '1'), 1);

    // Build filter
    const filter: Record<string, unknown> = { isPublic: true };
    if (search) {
      filter.$or = [
        { recipeName: { $regex: search, $options: 'i' } },
        { 'ingredients.name': { $regex: search, $options: 'i' } },
      ];
    }
    if (vibe && vibe !== 'all') filter.vibe = vibe;

    // Sort strategy
    const sortMap: Record<string, Record<string, 1 | -1>> = {
      newest:       { createdAt: -1 },
      popular:      { likesCount: -1, createdAt: -1 },
      calories_low: { totalCalories: 1 },
      calories_high:{ totalCalories: -1 },
    };
    const sortQuery = sortMap[sort] ?? sortMap.newest;

    const [rawRecipes, total] = await Promise.all([
      Recipe.find(filter)
        .sort(sortQuery)
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Recipe.countDocuments(filter),
    ]);

    const recipeIds = rawRecipes.map((r) => String((r as RecipeDoc)._id));
    const allComments = await Comment.find({ recipeId: { $in: recipeIds } })
      .sort({ createdAt: 1 })
      .lean();

    const commentsByRecipe: Record<string, unknown[]> = {};
    for (const c of allComments) {
      const key = String((c as { recipeId?: unknown }).recipeId);
      if (!commentsByRecipe[key]) commentsByRecipe[key] = [];
      commentsByRecipe[key].push(c);
    }

    const recipes = rawRecipes.map((recipe) => {
      const r = recipe as RecipeDoc;
      const allLikes = Array.isArray(r.likes) ? r.likes : [];
      return {
        ...recipe,
        likesCount: r.likesCount || allLikes.length,
        comments: commentsByRecipe[String(r._id)] || [],
        commentCount: (commentsByRecipe[String(r._id)] || []).length,
      };
    });

    return NextResponse.json({ recipes, total, page, limit });
  } catch (error) {
    console.error('[community GET]', error);
    return NextResponse.json({ error: 'Failed to fetch feed' }, { status: 500 });
  }
}

// POST /api/community — body: { action: 'like'|'fork'|'comment'|'publish', ... }
export async function POST(request: Request) {
  try {
    await connect();
    const body = (await request.json()) as PublishBody;
    const action = String(body.action || '');
    const recipeId = String(body.recipeId || '');
    const userId = String(body.userId || '');

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }

    // ── Like ────────────────────────────────────────────────────────────────
    if (action === 'like') {
      if (!recipeId) return NextResponse.json({ error: 'Missing recipeId' }, { status: 400 });

      const recipe = await Recipe.findById(recipeId);
      if (!recipe) return NextResponse.json({ error: 'Recipe not found' }, { status: 404 });

      const likesList = Array.isArray(recipe.likes) ? recipe.likes : [];
      const alreadyLiked = likesList.map(String).includes(String(userId));
      recipe.likes = alreadyLiked
        ? likesList.filter((id: unknown) => String(id) !== String(userId))
        : [...likesList, userId];
      recipe.likesCount = recipe.likes.length;
      await recipe.save();

      return NextResponse.json({ liked: !alreadyLiked, likesCount: recipe.likesCount });
    }

    // ── Fork ─────────────────────────────────────────────────────────────────
    if (action === 'fork') {
      if (!recipeId) return NextResponse.json({ error: 'Missing recipeId' }, { status: 400 });

      const original = (await Recipe.findById(recipeId).lean()) as Record<string, unknown> | null;
      if (!original) return NextResponse.json({ error: 'Recipe not found' }, { status: 404 });

      const forked = await Recipe.create({
        ...original,
        _id:            undefined,
        recipeName:     `${original.recipeName} (fork)`,
        authorId:       userId,
        isPublic:       false,
        likes:          [],
        likesCount:     0,
        parentRecipeId: recipeId,
        createdAt:      new Date(),
        updatedAt:      new Date(),
      });

      return NextResponse.json({ forked: true, newRecipeId: forked._id });
    }

    // ── Comment ───────────────────────────────────────────────────────────────
    if (action === 'comment') {
      const text = String(body.text || '').trim();
      if (!recipeId || !text) {
        return NextResponse.json({ error: 'Missing recipeId or text' }, { status: 400 });
      }

      const recipe = await Recipe.findById(recipeId);
      if (!recipe) return NextResponse.json({ error: 'Recipe not found' }, { status: 404 });

      const comment = await Comment.create({
        recipeId,
        authorId: String(userId),
        text:     text.trim(),
        likes:    [],
        createdAt: new Date(),
      });

      return NextResponse.json({ comment });
    }

    // ── Publish (post to community feed) ─────────────────────────────────────
    if (action === 'publish') {
      const recipeName = String(body.recipeName || '').trim();
      const vibe = String(body.vibe || 'cozy');
      const instructions = String(body.instructions || '');
      if (!recipeName) {
        return NextResponse.json({ error: 'Missing recipeName' }, { status: 400 });
      }

      const recipe = await Recipe.create({
        authorId:     String(userId),
        recipeName,
        vibe,
        instructions,
        ingredients:  [],
        steps:        instructions,
        recipeText:   instructions,
        totalCalories: 0,
        isPublic:     true,
        likes:        [],
        likesCount:   0,
        createdAt:    new Date(),
        updatedAt:    new Date(),
      });

      return NextResponse.json({ recipe });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    console.error('[community POST]', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}