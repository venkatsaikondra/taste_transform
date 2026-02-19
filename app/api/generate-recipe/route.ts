import { getHf } from "@/lib/huggingface";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { ingredients, vibe } = body;

    if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
      return NextResponse.json({ error: 'No ingredients provided' }, { status: 400 });
    }

    const hf = getHf();

    // Define the conversation once
    const recipeMessages = [
      { 
        role: "system", 
        content: `You are Foodzilla, a professional AI chef. Mode: ${vibe || 'Experimental'}. Create a creative recipe with a name, bulleted ingredients, and steps.` 
      },
      { 
        role: "user", 
        content: `Ingredients: ${ingredients.join(', ')}` 
      }
    ];

    let response;
    try {
      // Primary attempt with Llama 3
      response = await hf.chatCompletion({
        model: "meta-llama/Meta-Llama-3-8B-Instruct",
        messages: recipeMessages,
        max_tokens: 600,
        temperature: 0.7,
      });
    } catch (firstError) {
      console.log("Primary model busy, switching to fallback...");
      // Fallback attempt with Zephyr (very reliable serverless model)
      response = await hf.chatCompletion({
        model: "HuggingFaceH4/zephyr-7b-beta",
        messages: recipeMessages,
        max_tokens: 600,
        temperature: 0.7,
      });
    }

    const recipeOutput = response.choices[0].message.content;
    return NextResponse.json({ recipe: recipeOutput });

  } catch (err: any) {
    console.error('Error in generate-recipe route:', err.message);
    return NextResponse.json({ 
      error: 'AI Chef is busy dreaming. Ensure your HF_API_KEY is valid and try again.' 
    }, { status: 500 });
  }
}