import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/dbConfig/dbConfig";
import Recipe from "@/models/recipeModel";
import User from "@/models/userModel";
import { getUserFromToken } from "@/lib/auth";

connect();

// Updated Signature: context is now a Promise
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUserFromToken(request);
    
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized - Please login" },
        { status: 401 }
      );
    }

    const recipeId = params.id;

    const recipe = await Recipe.findOne({ _id: recipeId, userId: user._id });

    if (!recipe) {
      return NextResponse.json({ error: "Recipe not found" }, { status: 404 });
    }

    await Recipe.findByIdAndDelete(recipeId);

    await User.findByIdAndUpdate(user._id, {
      $pull: { recipes: recipeId },
    });

    return NextResponse.json({ message: "Recipe deleted successfully" });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to delete" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUserFromToken(request);
    
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized - Please login" },
        { status: 401 }
      );
    }

    const recipeId = params.id;
    const body = await request.json();

    const recipe = await Recipe.findOne({ _id: recipeId, userId: user._id });

    if (!recipe) {
      return NextResponse.json({ error: "Recipe not found" }, { status: 404 });
    }

    const updatedRecipe = await Recipe.findByIdAndUpdate(
      recipeId,
      { $set: body },
      { new: true }
    );

    return NextResponse.json({
      message: "Recipe updated successfully",
      recipe: updatedRecipe,
    });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update" },
      { status: 500 }
    );
  }
}