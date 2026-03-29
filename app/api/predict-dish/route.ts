import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { image, mimeType } = await req.json();

    if (!image || typeof image !== 'string') {
      return NextResponse.json({ error: 'No image data was provided' }, { status: 400 });
    }

    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Google API key is not configured' }, { status: 500 });
    }

    const contentType = typeof mimeType === 'string' && mimeType ? mimeType : 'image/jpeg';
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: "Analyze this cooked dish. Identify the name of the dish and list the most likely ingredients used to cook it. Return only a JSON object with keys dishName and ingredients.",
              },
              {
                inline_data: {
                  mime_type: contentType,
                  data: image.split(',')[1],
                },
              },
            ],
          },
        ],
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      const message = data?.error?.message || data?.error || 'Google API request failed';
      return NextResponse.json({ error: message }, { status: response.status || 500 });
    }

    const rawContent = data?.candidates?.[0]?.content;
    let textParts = '';

    if (Array.isArray(rawContent)) {
      textParts = rawContent
        .map((part: any) => (typeof part.text === 'string' ? part.text : ''))
        .filter(Boolean)
        .join('\n');
    } else if (typeof rawContent === 'string') {
      textParts = rawContent;
    }

    if (!textParts) {
      return NextResponse.json({ error: 'No text output received from vision model' }, { status: 500 });
    }

    const cleaned = textParts.replace(/```json|```/g, '').trim();
    let cleanJson: any;

    try {
      cleanJson = JSON.parse(cleaned);
    } catch {
      const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        return NextResponse.json({ error: 'Could not parse vision model JSON output' }, { status: 500 });
      }
      cleanJson = JSON.parse(jsonMatch[0]);
    }

    const dishName = typeof cleanJson.dishName === 'string'
      ? cleanJson.dishName
      : typeof cleanJson.dish === 'string'
      ? cleanJson.dish
      : undefined;

    const ingredients = Array.isArray(cleanJson.ingredients)
      ? cleanJson.ingredients.map(String)
      : typeof cleanJson.ingredients === 'string'
      ? cleanJson.ingredients.split(',').map((item: string) => item.trim()).filter(Boolean)
      : [];

    if (!dishName) {
      return NextResponse.json({ error: 'Vision model did not return a dish name' }, { status: 500 });
    }

    return NextResponse.json({ dishName, ingredients });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Deconstruction failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}