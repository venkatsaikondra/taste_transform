import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/dbConfig/dbConfig';
import Recipe from '@/models/recipeModel';

// GET /api/community?search=&vibe=&sort=newest|popular&limit=20&page=1
export async function GET(request: Request) {
  try {
    await connectToDatabase();

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
    const sortMap: Record<string, Record<string, number>> = {
      newest:  { createdAt: -1 },
      popular: { likesCount: -1, createdAt: -1 },
      calories_low: { totalCalories: 1 },
      calories_high: { totalCalories: -1 },
    };
    const sortQuery = sortMap[sort] ?? sortMap.newest;

    const [recipes, total] = await Promise.all([
      Recipe.find(filter)
        .sort(sortQuery)
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Recipe.countDocuments(filter),
    ]);

    return NextResponse.json({ recipes, total, page, limit });
  } catch (error) {
    console.error('[community GET]', error);
    return NextResponse.json({ error: 'Failed to fetch feed' }, { status: 500 });
  }
}

// POST /api/community  — body: { action: 'like'|'fork', recipeId, userId }
export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const body = await request.json();
    const { action, recipeId, userId } = body;

    if (!recipeId || !userId) {
      return NextResponse.json({ error: 'Missing recipeId or userId' }, { status: 400 });
    }

    if (action === 'like') {
      const recipe = await Recipe.findById(recipeId);
      if (!recipe) return NextResponse.json({ error: 'Recipe not found' }, { status: 404 });

      const alreadyLiked = recipe.likes?.includes(userId);
      if (alreadyLiked) {
        recipe.likes = recipe.likes.filter((id: string) => id !== userId);
      } else {
        recipe.likes = [...(recipe.likes || []), userId];
      }
      recipe.likesCount = recipe.likes.length;
      await recipe.save();

      return NextResponse.json({
        liked: !alreadyLiked,
        likesCount: recipe.likesCount,
      });
    }

    if (action === 'fork') {
      const original = await Recipe.findById(recipeId).lean() as any;
      if (!original) return NextResponse.json({ error: 'Recipe not found' }, { status: 404 });

      const forked = await Recipe.create({
        ...original,
        _id: undefined,
        recipeName: `${original.recipeName} (fork)`,
        author: userId,
        isPublic: false,
        likes: [],
        likesCount: 0,
        forkedFrom: recipeId,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      return NextResponse.json({ forked: true, newRecipeId: forked._id });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    console.error('[community POST]', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}