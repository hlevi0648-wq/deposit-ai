import { NextRequest, NextResponse } from 'next/server';
import { extractFormFromContext } from '@/lib/openai';

export async function POST(req: NextRequest) {
  try {
    const { context, documentText } = await req.json();
    const input = documentText || context || '';

    if (!input || input.trim().length < 3) {
      return NextResponse.json(
        { error: 'No context or document text provided' },
        { status: 400 }
      );
    }

    const suggestions = await extractFormFromContext(input);
    const fieldCount = Object.keys(suggestions).length;

    return NextResponse.json({
      success: true,
      suggestions,
      message: `AI extracted ${fieldCount} field${fieldCount === 1 ? '' : 's'}`,
    });
  } catch (err) {
    console.error('AI extraction error:', err);
    return NextResponse.json(
      { error: 'AI extraction failed — check OPENAI_API_KEY and try again' },
      { status: 500 }
    );
  }
}
