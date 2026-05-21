import { NextRequest, NextResponse } from 'next/server';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

const PAGE_WIDTH = 595;
const PAGE_HEIGHT = 842;
const MARGIN = 50;
const LINE_HEIGHT = 16;

function wrapText(text: string, font: any, size: number, maxWidth: number) {
  const normalized = text.replace(/\s+/g, ' ').trim();
  if (!normalized) return [];

  const words = normalized.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  for (const rawWord of words) {
    const word = rawWord.replace(/\r|\n/g, '');
    if (!word) continue;

    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const testWidth = font.widthOfTextAtSize(testLine, size);
    if (testWidth > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }

  if (currentLine) lines.push(currentLine);
  return lines;
}

function sanitizeLine(text: string) {
  return text
    .replace(/\*\*/g, '')
    .replace(/\*\s*/g, '')
    .replace(/^\s*[-•*]\s*/g, '')
    .replace(/^\s*(ingredients|instructions|steps|nutrition|notes|tips)[:\-]?\s*/i, '')
    .trim();
}

function normalizeTextLines(text: string) {
  return text
    .split(/\r?\n/)
    .map(line => sanitizeLine(line))
    .filter(Boolean);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      recipeName = 'Untitled Recipe',
      ingredients = [],
      instructions = [],
      nutritionInfo = [],
      cookingTime = '',
      recipeImageUrl,
      recipeText = '',
      totalCalories,
      fallbackText = [],
    } = body as {
      recipeName?: string;
      ingredients?: string[];
      instructions?: string[];
      nutritionInfo?: string[];
      cookingTime?: string;
      recipeImageUrl?: string | null;
      recipeText?: string;
      totalCalories?: number;
      fallbackText?: string[];
    };

    const pdfDoc = await PDFDocument.create();
    const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    let page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    let cursorY = PAGE_HEIGHT - MARGIN;

    const addPage = () => {
      page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
      cursorY = PAGE_HEIGHT - MARGIN;
    };

    const addText = (text: string, options: { font: any; size: number; color?: any; x?: number }) => {
      const lines = wrapText(text, options.font, options.size, PAGE_WIDTH - MARGIN * 2);
      for (const line of lines) {
        if (cursorY - LINE_HEIGHT < MARGIN) addPage();
        page.drawText(line, {
          x: options.x ?? MARGIN,
          y: cursorY,
          font: options.font,
          size: options.size,
          color: options.color ?? rgb(0.13, 0.14, 0.16),
        });
        cursorY -= LINE_HEIGHT;
      }
      cursorY -= 8;
    };

    page.drawText(recipeName, {
      x: MARGIN,
      y: cursorY,
      font: helveticaBold,
      size: 26,
      color: rgb(0.06, 0.1, 0.18),
    });

    cursorY -= 38;

    if (cookingTime || totalCalories) {
      const details = [cookingTime ? `Cooking time: ${cookingTime}` : null, totalCalories ? `Calories: ${totalCalories}` : null]
        .filter(Boolean)
        .join(' • ');
      if (details) {
        addText(details, { font: helvetica, size: 11, color: rgb(0.35, 0.35, 0.35) });
      }
    }

    if (recipeImageUrl) {
      try {
        const imageResponse = await fetch(recipeImageUrl);
        if (imageResponse.ok) {
          const imageBytes = await imageResponse.arrayBuffer();
          const isPng = recipeImageUrl.match(/\.png$/i);
          const embeddedImage = isPng
            ? await pdfDoc.embedPng(imageBytes)
            : await pdfDoc.embedJpg(imageBytes);
          const imageDims = embeddedImage.scaleToFit(PAGE_WIDTH - MARGIN * 2, 220);
          if (cursorY - imageDims.height < MARGIN) addPage();
          page.drawImage(embeddedImage, {
            x: MARGIN,
            y: cursorY - imageDims.height,
            width: imageDims.width,
            height: imageDims.height,
          });
          cursorY -= imageDims.height + 16;
        }
      } catch (error) {
        console.warn('PDF image embedding failed:', error);
      }
    }

    const drawSection = (title: string, lines: string[]) => {
      if (!lines?.length) return;
      addText(title, { font: helveticaBold, size: 14, color: rgb(0.1, 0.15, 0.25) });
      for (const [index, line] of lines.entries()) {
        if (cursorY - LINE_HEIGHT < MARGIN) addPage();
        const prefix = title === 'Instructions' ? `${index + 1}. ` : '• ';
        const wrapped = wrapText(`${prefix}${line}`, helvetica, 11, PAGE_WIDTH - MARGIN * 2);
        for (const wrappedLine of wrapped) {
          if (cursorY - LINE_HEIGHT < MARGIN) addPage();
          page.drawText(wrappedLine, {
            x: MARGIN,
            y: cursorY,
            font: helvetica,
            size: 11,
            color: rgb(0.12, 0.12, 0.13),
          });
          cursorY -= LINE_HEIGHT;
        }
        cursorY -= 4;
      }
      cursorY -= 8;
    };

    const sanitizedIngredients = ingredients.map(sanitizeLine).filter(Boolean);
    const sanitizedInstructions = instructions.map(line => sanitizeLine(line.replace(/^\d+[\.)]?\s*/, ''))).filter(Boolean);
    const sanitizedNutrition = nutritionInfo.map(sanitizeLine).filter(Boolean);
    const detailsLines = (Array.isArray(fallbackText) && fallbackText.length > 0)
      ? fallbackText.map(sanitizeLine).filter(Boolean)
      : normalizeTextLines(recipeText);

    drawSection('Ingredients', sanitizedIngredients);
    drawSection('Instructions', sanitizedInstructions);
    drawSection('Nutrition Info', sanitizedNutrition);

    if (!sanitizedIngredients.length && !sanitizedInstructions.length && !sanitizedNutrition.length && detailsLines.length) {
      addText('Recipe Details', { font: helveticaBold, size: 14, color: rgb(0.1, 0.15, 0.25) });
      for (const line of detailsLines) {
        addText(line, { font: helvetica, size: 11, color: rgb(0.12, 0.12, 0.13) });
      }
    } else if (detailsLines.length) {
      addText('Notes', { font: helveticaBold, size: 14, color: rgb(0.1, 0.15, 0.25) });
      for (const line of detailsLines) {
        addText(line, { font: helvetica, size: 11, color: rgb(0.12, 0.12, 0.13) });
      }
    }

    addText('Generated by Taste Transformer', {
      font: helvetica,
      size: 10,
      color: rgb(0.4, 0.45, 0.52),
    });

    const pdfBytes = await pdfDoc.save();
    const safeFilename = recipeName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') || 'recipe';

    const pdfBuffer = Buffer.from(pdfBytes);
    return new Response(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${safeFilename}.pdf"`,
      },
    });
  } catch (error: unknown) {
    console.error('PDF route error:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'PDF generation failed' }, { status: 500 });
  }
}
