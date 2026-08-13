import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import { supabaseAdmin } from '@/lib/supabase';
import { validateRoutingNumber, validateNACHACompliance } from '@/lib/validation';
import { sendFormSubmissionEmail, sendAdminNotification } from '@/lib/email';
import { sendFormSubmissionSMS } from '@/lib/twilio';

const FormSchema = z.object({
  employeeName: z.string().min(1),
  employeeEmail: z.string().email(),
  employeePhone: z.string().optional(),
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

export async function POST(req: NextRequest) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const parsed = FormSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const data = parsed.data;

    if (!validateRoutingNumber(data.routingNumber)) {
      return NextResponse.json(
        { error: 'Invalid routing number — failed ABA checksum' },
        { status: 400 }
      );
    }

    const nachaErrors = validateNACHACompliance(data);
    if (nachaErrors.length > 0) {
      return NextResponse.json(
        { error: 'NACHA compliance issues', details: nachaErrors },
        { status: 400 }
      );
    }

    const { data: form, error } = await supabaseAdmin
      .from('forms')
      .insert({
        employee_name: data.employeeName,
        employee_email: data.employeeEmail,
        bank_name: data.bankName,
        routing_number: data.routingNumber,
        account_number_encrypted: data.accountNumber,
        account_type: data.accountType,
        employer_name: data.employerName,
        employer_id_text: data.employerId,
        pay_frequency: data.payFrequency,
        deposit_amount: data.depositAmount,
        deposit_type: data.depositType,
        status: 'pending',
      })
      .select('id')
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: 'Failed to save form' }, { status: 500 });
    }

    await supabaseAdmin.from('audit_log').insert({
      form_id: form.id,
      action: 'created',
      actor_id: userId,
      metadata: { employer_name: data.employerName },
    });

    await sendFormSubmissionEmail(data.employeeEmail, {
      employeeName: data.employeeName,
      employerName: data.employerName,
      formId: form.id,
      payFrequency: data.payFrequency,
      depositType: data.depositType,
    }).catch((err) => console.error('Employee email failed:', err));

    await sendAdminNotification({
      employeeName: data.employeeName,
      employerName: data.employerName,
      formId: form.id,
      status: 'pending',
    }).catch((err) => console.error('Admin email failed:', err));

    if (data.employeePhone) {
      await sendFormSubmissionSMS(data.employeePhone, data.employeeName, data.employerName).catch((err) =>
        console.error('SMS failed:', err)
      );
    }

    return NextResponse.json({
      success: true,
      formId: form.id,
      message: 'Form validated, saved, audit-logged, emails + SMS sent',
      data: { ...data, accountNumber: `••••${data.accountNumber.slice(-4)}` },
    });
  } catch (err) {
    console.error('Form submission error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET() {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data, error } = await supabaseAdmin
    .from('forms')
    .select('id, employee_name, employer_name, status, created_at, submitted_at')
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch forms' }, { status: 500 });
  }

  return NextResponse.json({ forms: data || [] });
}
