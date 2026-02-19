import { hf } from "@/lib/huggingface";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { ingredients } = await req.json();

  const prompt = `
You are a professional chef.

Using ONLY these ingredients:
${ingredients}

Generate:
1. Recipe name
2. Short description
3. Ingredients list
4. Step-by-step instructions

Add disclaimer:
"⚠️ AI-generated recipe. Verify cooking steps and food safety."
`;

  const response = await hf.textGeneration({
    model: "mistralai/Mistral-7B-Instruct-v0.2",
    inputs: prompt,
    parameters: {
      max_new_tokens: 400,
      temperature: 0.7,
      top_p: 0.9,
    },
  });

  return NextResponse.json({
    recipe: response.generated_text,
  });
}