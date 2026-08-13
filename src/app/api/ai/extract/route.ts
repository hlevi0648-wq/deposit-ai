import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { context } = await req.json();

    // TODO: Integrate with OpenAI GPT-4o
    // For now, return mock suggestions
    const suggestions = {
      employeeName: 'Sarah Chen',
      employeeEmail: 'sarah.chen@example.com',
      bankName: 'Chase Bank',
      routingNumber: '026009593',
      accountNumber: '9876543210',
      accountType: 'checking' as const,
      employerName: 'Acme Corp',
      payFrequency: 'biweekly' as const,
      depositType: 'full' as const,
    };

    return NextResponse.json({
      success: true,
      suggestions,
      message: 'AI extracted 8 fields from document context',
    });
  } catch (err) {
    return NextResponse.json(
      { error: 'AI extraction failed' },
      { status: 500 }
    );
  }
}
