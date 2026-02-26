import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/dbConfig/dbConfig";
import Recipe from "@/models/recipeModel";
import { getUserFromToken } from "@/lib/auth";

connect();

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromToken(request);
    
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized - Please login" },
        { status: 401 }
      );
    }

    // Fetch all recipes for this user, sorted by newest first
    const recipes = await Recipe.find({ authorId: user._id })
      .sort({ createdAt: -1 });

    return NextResponse.json({
      recipes,
      count: recipes.length,
    });
  } catch (error: any) {
    console.error("Error fetching recipes:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch recipes" },
      { status: 500 }
    );
  }
}
