import { NextResponse } from 'next/server';

const HF_API_URL = 'https://api-inference.huggingface.co/models';
const BLIP_MODEL = 'Salesforce/blip-image-captioning-large';
const LLM_MODEL = 'mistralai/Mistral-7B-Instruct-v0.3';

async function queryBlip(imageBase64: string, mimeType: string): Promise<string> {
  const apiKey = process.env.HUGGINGFACE_API_KEY;

  // Convert base64 to binary blob
  const byteCharacters = atob(imageBase64);
  const byteNumbers = new Uint8Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const imageBlob = new Blob([byteNumbers], { type: mimeType });

  const response = await fetch(`${HF_API_URL}/${BLIP_MODEL}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      // Send raw binary — BLIP expects image bytes, not JSON
      'Content-Type': mimeType,
    },
    body: imageBlob,
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err?.error || `BLIP model request failed: ${response.status}`);
  }

  const data = await response.json();

  // BLIP returns: [{ generated_text: "a plate of ..." }]
  const caption: string =
    Array.isArray(data) && data[0]?.generated_text
      ? data[0].generated_text
      : typeof data?.generated_text === 'string'
      ? data.generated_text
      : '';

  if (!caption) throw new Error('BLIP returned no caption');
  return caption;
}

async function queryMistral(caption: string): Promise<{ dishName: string; ingredients: string[] }> {
  const apiKey = process.env.HUGGINGFACE_API_KEY;

  const prompt = `<s>[INST] You are a culinary expert. Based on the following image caption of a cooked dish, identify the dish name and list the most likely ingredients used to cook it.

Caption: "${caption}"

Respond ONLY with a valid JSON object with exactly two keys:
- "dishName": a string with the name of the dish
- "ingredients": an array of ingredient strings

No explanation, no markdown, no extra text. Just the raw JSON object. [/INST]`;

  const response = await fetch(`${HF_API_URL}/${LLM_MODEL}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      inputs: prompt,
      parameters: {
        max_new_tokens: 300,
        temperature: 0.3,
        return_full_text: false, // Only return generated tokens, not the prompt
      },
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err?.error || `Mistral model request failed: ${response.status}`);
  }

  const data = await response.json();

  // Mistral returns: [{ generated_text: "{ ... }" }]
  const rawText: string =
    Array.isArray(data) && data[0]?.generated_text
      ? data[0].generated_text
      : typeof data?.generated_text === 'string'
      ? data.generated_text
      : '';

  if (!rawText) throw new Error('Mistral returned no output');

  const cleaned = rawText.replace(/```json|```/g, '').trim();

  let parsed: any;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('Could not parse Mistral JSON output');
    parsed = JSON.parse(jsonMatch[0]);
  }

  const dishName =
    typeof parsed.dishName === 'string'
      ? parsed.dishName
      : typeof parsed.dish === 'string'
      ? parsed.dish
      : undefined;

  const ingredients = Array.isArray(parsed.ingredients)
    ? parsed.ingredients.map(String)
    : typeof parsed.ingredients === 'string'
    ? parsed.ingredients.split(',').map((i: string) => i.trim()).filter(Boolean)
    : [];

  if (!dishName) throw new Error('Mistral did not return a dish name');

  return { dishName, ingredients };
}

export async function POST(req: Request) {
  try {
    const { image, mimeType } = await req.json();

    if (!image || typeof image !== 'string') {
      return NextResponse.json({ error: 'No image data was provided' }, { status: 400 });
    }

    if (!process.env.HUGGINGFACE_API_KEY) {
      return NextResponse.json({ error: 'Hugging Face API key is not configured' }, { status: 500 });
    }

    const contentType = typeof mimeType === 'string' && mimeType ? mimeType : 'image/jpeg';

    // Strip the data URL prefix if present (e.g. "data:image/jpeg;base64,...")
    const base64Data = image.includes(',') ? image.split(',')[1] : image;

    // Step 1: Get image caption from BLIP
    const caption = await queryBlip(base64Data, contentType);

    // Step 2: Extract structured dish info from caption using Mistral
    const { dishName, ingredients } = await queryMistral(caption);

    return NextResponse.json({ dishName, ingredients });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Deconstruction failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
