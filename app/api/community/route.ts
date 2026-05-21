import { NextResponse } from 'next/server';
import { connect } from '@/dbConfig/dbConfig';
import Recipe from '@/models/recipeModel';
import Comment from '@/models/commentModel';
import User from '@/models/userModel';
import mongoose from 'mongoose';

type CommunityRequestBody = {
  action?: string;
  recipeId?: string;
  userId?: string;
  text?: string;
  recipeName?: string;
  vibe?: string;
  instructions?: string;
};

type LeanRecord = Record<string, unknown>;
const toStringOrEmpty = (value: unknown) => {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string') return value;
  return String(value);
};

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
    const sortQuery = sortMap[sort] || sortMap.newest;

    const [rawRecipes, total] = await Promise.all([
      Recipe.find(filter).sort(sortQuery).skip((page - 1) * limit).limit(limit).lean() as Promise<LeanRecord[]>,
      Recipe.countDocuments(filter),
    ]);

    const recipeIds = rawRecipes
      .map((recipe) => toStringOrEmpty(recipe._id))
      .filter((id) => id.length === 24);

    const allComments = recipeIds.length > 0
      ? await Comment.find({ recipeId: { $in: recipeIds } })
          .sort({ createdAt: 1 })
          .lean() as LeanRecord[]
      : [];

    const commentsByRecipe: Record<string, LeanRecord[]> = {};
    for (const comment of allComments) {
      const key = toStringOrEmpty(comment.recipeId);
      if (!commentsByRecipe[key]) commentsByRecipe[key] = [];
      commentsByRecipe[key].push(comment);
    }

    const authorIds = [...new Set(rawRecipes.map((recipe) => toStringOrEmpty(recipe.authorId)).filter(Boolean))];
    const validAuthorIds = authorIds.filter((id) => mongoose.Types.ObjectId.isValid(id));
    const userAuthors = await User.find({
      _id: { $in: validAuthorIds },
    }).lean() as LeanRecord[];
    const authorNameById = userAuthors.reduce<Record<string, string>>((acc, user) => {
      const id = toStringOrEmpty(user._id);
      acc[id] = toStringOrEmpty(user.username) || 'anonymous';
      return acc;
    }, {});

    const recipes = rawRecipes.map((recipe) => {
      const likes = recipe.likes;
      const likesCount = typeof recipe.likesCount === 'number'
        ? recipe.likesCount
        : Array.isArray(likes)
        ? likes.length
        : 0;

      return {
        ...recipe,
        authorName: authorNameById[toStringOrEmpty(recipe.authorId)] || toStringOrEmpty(recipe.authorId) || 'anonymous',
        instructions: toStringOrEmpty(recipe.steps) || toStringOrEmpty(recipe.recipeText),
        likesCount,
        comments: commentsByRecipe[toStringOrEmpty(recipe._id)] || [],
        commentCount: (commentsByRecipe[toStringOrEmpty(recipe._id)] || []).length,
      };
    });

    return NextResponse.json({ recipes, total, page, limit });
  } catch (error) {
    console.error('[community GET]', error);
    return NextResponse.json({ error: 'Failed to fetch feed' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connect();
    const body = (await request.json()) as CommunityRequestBody;
    const { action, recipeId, userId } = body;

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }

    if (action === 'like') {
      if (!recipeId) return NextResponse.json({ error: 'Missing recipeId' }, { status: 400 });

      const recipe = await Recipe.findById(recipeId);
      if (!recipe) return NextResponse.json({ error: 'Recipe not found' }, { status: 404 });

      const currentLikes = Array.isArray(recipe.likes) ? recipe.likes.map(String) : [];
      const alreadyLiked = currentLikes.includes(String(userId));
      recipe.likes = alreadyLiked
        ? currentLikes.filter((id: string) => id !== String(userId))
        : [...currentLikes, String(userId)];
      recipe.likesCount = (recipe.likes as string[]).length;
      await recipe.save();

      return NextResponse.json({ liked: !alreadyLiked, likesCount: recipe.likesCount });
    }

    if (action === 'fork') {
      if (!recipeId) return NextResponse.json({ error: 'Missing recipeId' }, { status: 400 });

      const original = await Recipe.findById(recipeId).lean() as LeanRecord | null;
      if (!original) return NextResponse.json({ error: 'Recipe not found' }, { status: 404 });

      const forked = await Recipe.create({
        ...original,
        _id: undefined,
        recipeName: `${toStringOrEmpty(original.recipeName)} (fork)`,
        authorId: String(userId),
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
      const text = toStringOrEmpty(body.text);
      if (!recipeId || !text) {
        return NextResponse.json({ error: 'Missing recipeId or text' }, { status: 400 });
      }
      const recipe = await Recipe.findById(recipeId);
      if (!recipe) return NextResponse.json({ error: 'Recipe not found' }, { status: 404 });

      const comment = await Comment.create({ recipeId, authorId: String(userId), text });
      return NextResponse.json({ comment });
    }

    if (action === 'publish') {
      const recipeName = toStringOrEmpty(body.recipeName);
      const vibe = toStringOrEmpty(body.vibe);
      const instructions = toStringOrEmpty(body.instructions);
      if (!recipeName) {
        return NextResponse.json({ error: 'Missing recipeName' }, { status: 400 });
      }

      const authorUser = await User.findById(String(userId)).select('username');
      const authorName = authorUser?.username || 'anonymous';

      const newRecipe = new Recipe({
        authorId: String(userId),
        recipeName,
        vibe: vibe || 'cozy',
        steps: instructions,
        recipeText: instructions,
        ingredients: [],
        totalCalories: 0,
        likes: [],
        likesCount: 0,
        isPublic: true,
      });

      await newRecipe.save();

      return NextResponse.json({
        recipe: {
          _id: newRecipe._id,
          authorId: newRecipe.authorId,
          authorName,
          recipeName: newRecipe.recipeName,
          vibe: newRecipe.vibe,
          instructions,
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