import { NextResponse } from 'next/server';

export const maxDuration = 60; 
export const runtime = 'nodejs';

const HF_API_URL = 'https://api-inference.huggingface.co/models';
const BLIP_MODEL = 'Salesforce/blip-image-captioning-large';
const LLM_MODEL = 'mistralai/Mistral-7B-Instruct-v0.3';

export async function POST(req: Request) {
  try {
    const { image } = await req.json();
    const apiKey = process.env.HUGGINGFACE_API_KEY || process.env.HF_API_KEY;

    if (!image) return NextResponse.json({ error: "No image provided" }, { status: 400 });

    const base64Data = image.split(',')[1] || image;
    const buffer = Buffer.from(base64Data, 'base64');

    // --- STAGE 1: BLIP (Binary Upload) ---
    console.log("--- STAGE 1: BLIP SCANNING ---");
    const blipRes = await fetch(`${HF_API_URL}/${BLIP_MODEL}`, {
      method: 'POST',
      headers: { 
        Authorization: `Bearer ${apiKey}`,
        'x-wait-for-model': 'true' 
      },
      body: buffer,
    });

    const blipData = await blipRes.json();
    if (!blipRes.ok) throw new Error(blipData.error || "BLIP_FAILED");

    const caption = Array.isArray(blipData) ? blipData[0]?.generated_text : blipData?.generated_text;
    if (!caption) throw new Error("COULD_NOT_DESCRIBE_IMAGE");

    // --- STAGE 2: MISTRAL (JSON Upload) ---
    console.log(`--- STAGE 2: DECONSTRUCTING (${caption}) ---`);
    const prompt = `<s>[INST] Dish: "${caption}". Respond ONLY with raw JSON: {"dishName": "name", "ingredients": ["ing1", "ing2"]} [/INST]`;
    
    const mistralRes = await fetch(`${HF_API_URL}/${LLM_MODEL}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'x-wait-for-model': 'true'
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: { max_new_tokens: 200, temperature: 0.1 }
      }),
    });

    const mistralData = await mistralRes.json();
    const rawText = Array.isArray(mistralData) ? mistralData[0]?.generated_text : mistralData?.generated_text;
    const jsonMatch = rawText?.match(/\{[\s\S]*\}/);
    
    if (!jsonMatch) throw new Error("AI_DECONSTRUCTION_FAILED");

    return NextResponse.json(JSON.parse(jsonMatch[0]));

  } catch (error: any) {
    console.error("API_ERROR_LOG:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}