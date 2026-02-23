import mongoose from "mongoose";

const recipeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    recipeName: {
      type: String,
      required: [true, "Recipe name is required"],
      trim: true,
    },
    ingredients: [
      {
        name: String,
        emoji: String,
        quantity: Number,
      },
    ],
    steps: {
      type: String,
      required: true,
    },
    vibe: {
      type: String,
      enum: ["Safe", "Experimental", "Chaos"],
      default: "Safe",
    },
    totalCalories: {
      type: Number,
      default: 0,
    },
    recipeText: {
      type: String,
      required: true,
    },
    videos: [
      {
        videoId: String,
        title: String,
        thumbnail: String,
      },
    ],
    isFavorite: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Prevent model overwrite in dev (Next.js hot reload)
const Recipe = mongoose.models.Recipe || mongoose.model("Recipe", recipeSchema);

export default Recipe;
