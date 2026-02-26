import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/dbConfig/dbConfig";
import Recipe from "@/models/recipeModel";
import User from "@/models/userModel";
import { getUserFromToken } from "@/lib/auth";

connect();

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromToken(request);
    
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized - Please login" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { recipeName, ingredients, steps, vibe, totalCalories, recipeText } = body;

    if (!recipeName || !recipeText) {
      return NextResponse.json(
        { error: "Recipe name and text are required" },
        { status: 400 }
      );
    }

    // Create new recipe
    const newRecipe = new Recipe({
      authorId: user._id,
      recipeName,
      ingredients: ingredients || [],
      steps: steps || recipeText,
      vibe: vibe || "Safe",
      totalCalories: totalCalories || 0,
      recipeText,
    });

    await newRecipe.save();

    // Add recipe reference to user
    await User.findByIdAndUpdate(user._id, {
      $push: { recipes: newRecipe._id },
    });

    return NextResponse.json({
      message: "Recipe saved successfully",
      recipe: newRecipe,
    });
  } catch (error: unknown) {
    console.error("Error saving recipe:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to save recipe" },
      { status: 500 }
    );
  }
}
