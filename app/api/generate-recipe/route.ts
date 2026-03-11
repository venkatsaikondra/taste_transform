import { createHfClient, parseHfApiKeys } from "@/lib/huggingface";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { ingredients, vibe } = body;

    if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
      return NextResponse.json({ error: 'No ingredients provided' }, { status: 400 });
    }

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

    const parseErrorMsg = (err: any) => String(err?.message || err || '').toLowerCase();
    const isAuthError = (msg: string) => /\b(invalid username|invalid password|401|unauthorized|bad credentials)\b/i.test(msg);

    const keys = parseHfApiKeys();
    if (keys.length === 0) {
      return NextResponse.json({
        error: 'HF_API_KEY not set. Add `HF_API_KEY=your_token` to .env.local in project root.',
      }, { status: 500 });
    }

    let response: any = null;
    let lastError: any = null;

    for (const key of keys) {
      let client;
      try {
        client = createHfClient(key);

        try {
          response = await client.chatCompletion({
            model: "meta-llama/Meta-Llama-3-8B-Instruct",
            messages: recipeMessages,
            max_tokens: 600,
            temperature: 0.7,
          });
        } catch (firstError) {
          const msg = parseErrorMsg(firstError);
          if (isAuthError(msg)) {
            lastError = firstError;
            console.warn('Hugging Face auth failed for key, continuing to next key:', msg);
            continue;
          }

          try {
            response = await client.chatCompletion({
              model: "HuggingFaceH4/zephyr-7b-beta",
              messages: recipeMessages,
              max_tokens: 600,
              temperature: 0.7,
            });
          } catch (fallbackError) {
            const fbMsg = parseErrorMsg(fallbackError);
            if (isAuthError(fbMsg)) {
              lastError = fallbackError;
              console.warn('Hugging Face auth failed for key (fallback) continuing to next key:', fbMsg);
              continue;
            }
            lastError = fallbackError;
            console.warn('Fallback failed for key, trying next key if any:', fbMsg);
            continue;
          }
        }

        if (response) break; // success
      } catch (setupErr) {
        lastError = setupErr;
        continue;
      }
    }

    if (!response) {
      const lastMsg = parseErrorMsg(lastError);
      if (isAuthError(lastMsg)) {
        return NextResponse.json({
          error: 'Hugging Face auth failed: check HF_API_KEY values in .env.local and use a non-expired key.',
        }, { status: 401 });
      }
      return NextResponse.json({
        error: 'AI Chef is busy. Try again in a moment or check your network/API configuration.',
      }, { status: 503 });
    }

    const recipeOutput = response.choices?.[0]?.message?.content;
    if (!recipeOutput) {
      return NextResponse.json({ error: 'AI Chef returned no recipe text.' }, { status: 502 });
    }

    return NextResponse.json({ recipe: recipeOutput });

  } catch (err: any) {
    console.error('Error in generate-recipe route:', err?.message || err);

    if (/\b(invalid username|invalid password|401|unauthorized|bad credentials)\b/i.test(err?.message || '')) {
      return NextResponse.json({
        error: 'Hugging Face auth failed: check HF_API_KEY in your .env.local and that it is a valid token.',
      }, { status: 401 });
    }

    if (/HF_API_KEY is not defined/.test(err?.message || '')) {
      return NextResponse.json({
        error: 'HF_API_KEY not set. Add `HF_API_KEY=your_token` to .env.local in project root.',
      }, { status: 500 });
    }

    return NextResponse.json({
      error: 'AI Chef is busy dreaming. Ensure your HF_API_KEY is valid and try again.',
    }, { status: 500 });
  }
}