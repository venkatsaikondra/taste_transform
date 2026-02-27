import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/dbConfig/dbConfig";
import Recipe from "@/models/recipeModel";

// This endpoint mirrors the older `/api/community` implementation so that
// any frontend code still pointing at `/api/recipes/publish` continues to
// behave correctly. It exposes a paged, searchable feed of public recipes
// and supports simple actions like liking and forking.

export async function GET(request: NextRequest) {
  try {
    await connect();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const vibe = searchParams.get("vibe") || "";
    const sort = searchParams.get("sort") || "newest";
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 50);
    const page = Math.max(parseInt(searchParams.get("page") || "1"), 1);

    // Build filter for only public recipes
    const filter: Record<string, unknown> = { isPublic: true };
    if (search) {
      filter.$or = [
        { recipeName: { $regex: search, $options: "i" } },
        { "ingredients.name": { $regex: search, $options: "i" } },
      ];
    }
    if (vibe && vibe !== "all") {
      filter.vibe = vibe;
    }

    const sortMap: Record<string, Record<string, 1 | -1>> = {
      newest: { createdAt: -1 },
      popular: { likesCount: -1, createdAt: -1 },
      calories_low: { totalCalories: 1 },
      calories_high: { totalCalories: -1 },
    };
    const sortQuery = (sortMap[sort] ?? sortMap.newest) as any;

    const [rawRecipes, total] = await Promise.all([
      Recipe.find(filter)
        .sort(sortQuery)
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Recipe.countDocuments(filter),
    ]);

    const recipes = rawRecipes.map((r: any) => ({
      ...r,
      likesCount: r.likesCount || (Array.isArray(r.likes) ? r.likes.length : 0),
    }));

    return NextResponse.json({ recipes, total, page, limit });
  } catch (error: unknown) {
    console.error("[publish GET]", error);
    return NextResponse.json({ error: "Failed to fetch feed" }, { status: 500 });
  }
}

// POST supports a couple of simple actions for the feed: like/unlike and fork
export async function POST(request: NextRequest) {
  try {
    await connect();
    const body = await request.json();
    const { action, recipeId, userId } = body as {
      action: string;
      recipeId?: string;
      userId?: string;
    };

    if (!recipeId || !userId) {
      return NextResponse.json(
        { error: "Missing recipeId or userId" },
        { status: 400 }
      );
    }

    if (action === "like") {
      const recipe = await Recipe.findById(recipeId);
      if (!recipe)
        return NextResponse.json({ error: "Recipe not found" }, { status: 404 });

      const alreadyLiked = recipe.likes
        ?.map(String)
        .includes(String(userId));
      if (alreadyLiked) {
        recipe.likes = recipe.likes.filter(
          (id: any) => String(id) !== String(userId)
        );
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

    if (action === "fork") {
      const original = (await Recipe.findById(recipeId).lean()) as any;
      if (!original)
        return NextResponse.json({ error: "Recipe not found" }, { status: 404 });

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

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error: unknown) {
    console.error("[publish POST]", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
