import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
const HF_API_URL = 'https://api-inference.huggingface.co/models';
const BLIP_MODEL = 'Salesforce/blip-image-captioning-large';
const LLM_MODEL = 'mistralai/Mistral-7B-Instruct-v0.3';

async function queryHF(model: string, body: any, isBinary = false) {
  const response = await fetch(`${HF_API_URL}/${model}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
      'Content-Type': isBinary ? 'image/jpeg' : 'application/json',
    },
    body: body,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || `HF Error: ${response.status}`);
  }
  return response.json();
}

export async function POST(req: Request) {
  try {
    const { image } = await req.json();
    const base64Data = image.split(',')[1];
    const buffer = Buffer.from(base64Data, 'base64');

    // Step 1: BLIP Captioning
    const blipData = await queryHF(BLIP_MODEL, buffer, true);
    const caption = blipData[0]?.generated_text;

    if (!caption) throw new Error("Could not describe image.");

    // Step 2: Mistral Extraction
    const prompt = `<s>[INST] Dish: "${caption}". Return JSON: {"dishName": "name", "ingredients": ["ing1", "ing2"]} [/INST]`;
    const mistralData = await queryHF(LLM_MODEL, JSON.stringify({
      inputs: prompt,
      parameters: { max_new_tokens: 200, temperature: 0.1 }
    }));

    const rawText = mistralData[0]?.generated_text || '';
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("AI failed to format ingredients.");

    return NextResponse.json(JSON.parse(jsonMatch[0]));
  } catch (error: any) {
    console.error("API_ERROR:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}