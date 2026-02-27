import mongoose from "mongoose";

const recipeSchema = new mongoose.Schema(
  {
    // reference to the user who created/generated the recipe
    // store as string (allows mock IDs during development)
    authorId: {
      type: String,
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
    // visibility flag, only public recipes appear in the community feed
    isPublic: {
      type: Boolean,
      default: false,
    },
    // users who liked the recipe (stored as strings to support mock IDs)
    likes: [
      {
        type: String,
      },
    ],
    // convenience counter, kept in sync in application logic
    likesCount: {
      type: Number,
      default: 0,
    },
    // if this recipe was forked/cloned from another one
    parentRecipeId: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

// Prevent model overwrite in dev (Next.js hot reload)
const Recipe = mongoose.models.Recipe || mongoose.model("Recipe", recipeSchema);

export default Recipe;
