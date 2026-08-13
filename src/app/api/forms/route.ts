import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const FormSchema = z.object({
  employeeName: z.string().min(1),
  employeeEmail: z.string().email(),
  bankName: z.string().optional(),
  routingNumber: z.string().length(9).regex(/^\d{9}$/),
  accountNumber: z.string().min(4),
  accountType: z.enum(['checking', 'savings']),
  employerName: z.string().min(1),
  employerId: z.string().optional(),
  payFrequency: z.enum(['weekly', 'biweekly', 'semimonthly', 'monthly']),
  depositAmount: z.string().optional(),
  depositType: z.enum(['full', 'percent', 'fixed']),
});

// ABA routing number checksum
function validateRoutingChecksum(routing: string): boolean {
  if (routing.length !== 9) return false;
  const d = routing.split('').map(Number);
  const sum = 3 * (d[0] + d[3] + d[6]) + 7 * (d[1] + d[4] + d[7]) + 1 * (d[2] + d[5] + d[8]);
  return sum % 10 === 0;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = FormSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // Validate routing number checksum
    if (!validateRoutingChecksum(data.routingNumber)) {
      return NextResponse.json(
        { error: 'Invalid routing number — failed ABA checksum' },
        { status: 400 }
      );
    }

    // TODO: Save to Supabase
    // TODO: Log to audit trail
    // TODO: Generate PDF

    return NextResponse.json({
      success: true,
      formId: `form_${Date.now()}`,
      message: 'Form validated and saved',
      data: {
        ...data,
        accountNumber: `••••${data.accountNumber.slice(-4)}`,
      },
    });
  } catch (err) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  // TODO: Fetch from Supabase
  return NextResponse.json({ forms: [] });
}
