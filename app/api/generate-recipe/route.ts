import { getHf } from "@/lib/huggingface";
import { NextResponse } from "next/server";

interface RecipeRequestBody {
  ingredients?: string[];
  vibe?: string;
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as RecipeRequestBody;
    const { ingredients, vibe } = body;

    if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
      return NextResponse.json({ error: 'No ingredients provided' }, { status: 400 });
    }

    const hf = getHf();

    const recipeMessages = [
      {
        role: 'system',
        content: `You are Foodzilla, a professional AI chef. Mode: ${vibe || 'Experimental'}. Create a creative recipe with a name, bulleted ingredients, and steps.`,
      },
      {
        role: 'user',
        content: `Ingredients: ${ingredients.join(', ')}`,
      },
    ];

    let response;
    try {
      response = await hf.chatCompletion({
        model: 'meta-llama/Meta-Llama-3-8B-Instruct',
        messages: recipeMessages,
        max_tokens: 600,
        temperature: 0.7,
      });
    } catch {
      console.log('Primary model busy, switching to fallback...');
      response = await hf.chatCompletion({
        model: 'HuggingFaceH4/zephyr-7b-beta',
        messages: recipeMessages,
        max_tokens: 600,
        temperature: 0.7,
      });
    }

    const recipeOutput = response.choices?.[0]?.message?.content ?? '';
    return NextResponse.json({ recipe: recipeOutput });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unexpected server error';
    console.error('Error in generate-recipe route:', message);
    return NextResponse.json({
      error: 'AI Chef is busy dreaming. Ensure your HF_API_KEY is valid and try again.',
    }, { status: 500 });
  }
}