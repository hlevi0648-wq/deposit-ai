import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase';
import { generateDirectDepositPDF } from '@/lib/pdf';

export async function GET(req: NextRequest) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const formId = searchParams.get('formId');

    if (!formId) {
      return NextResponse.json({ error: 'formId required' }, { status: 400 });
    }

    const { data: form, error } = await supabaseAdmin
      .from('forms')
      .select('*')
      .eq('id', formId)
      .single();

    if (error || !form) {
      return NextResponse.json({ error: 'Form not found' }, { status: 404 });
    }

    const pdfBuffer = await generateDirectDepositPDF({
      employeeName: form.employee_name,
      employeeEmail: form.employee_email,
      bankName: form.bank_name || '',
      routingNumber: form.routing_number,
      accountNumber: `••••${form.account_number_encrypted.slice(-4)}`,
      accountType: form.account_type,
      employerName: form.employer_name,
      employerId: form.employer_id_text || '',
      payFrequency: form.pay_frequency,
      depositAmount: form.deposit_amount || '',
      depositType: form.deposit_type,
      formId: form.id,
      status: form.status,
      createdAt: form.created_at,
    });

    // Audit log
    await supabaseAdmin.from('audit_log').insert({
      form_id: formId,
      action: 'exported',
      actor_id: userId,
      metadata: { format: 'pdf' },
    });

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="direct-deposit-${form.employee_name.replace(/\s/g, '-')}.pdf"`,
      },
    });
  } catch (err) {
    console.error('PDF export error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
