import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';
import { supabaseAdmin } from '@/lib/supabase';
import { sendApprovalEmail } from '@/lib/email';
import { sendApprovalSMS } from '@/lib/twilio';

const ApproveSchema = z.object({
  formId: z.string().uuid(),
  action: z.enum(['approve', 'reject']),
  note: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const parsed = ApproveSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { formId, action, note } = parsed.data;
    const newStatus = action === 'approve' ? 'approved' : 'rejected';

    const { data: form, error: fetchError } = await supabaseAdmin
      .from('forms')
      .select('id, employee_name, employee_email, status, employer_name')
      .eq('id', formId)
      .single();

    if (fetchError || !form) {
      return NextResponse.json({ error: 'Form not found' }, { status: 404 });
    }

    if (form.status !== 'pending') {
      return NextResponse.json(
        { error: `Form is already ${form.status} — cannot ${action}` },
        { status: 409 }
      );
    }

    const { error: updateError } = await supabaseAdmin
      .from('forms')
      .update({
        status: newStatus,
        submitted_at: new Date().toISOString(),
      })
      .eq('id', formId);

    if (updateError) {
      console.error('Update error:', updateError);
      return NextResponse.json({ error: 'Failed to update form' }, { status: 500 });
    }

    await supabaseAdmin.from('audit_log').insert({
      form_id: formId,
      action: action === 'approve' ? 'approved' : 'rejected',
      actor_id: userId,
      metadata: { note, previous_status: form.status },
    });

    if (action === 'approve') {
      await sendApprovalEmail(form.employee_email, form.employee_name, formId).catch((err) =>
        console.error('Approval email failed:', err)
      );
    }

    return NextResponse.json({
      success: true,
      formId,
      status: newStatus,
      message: `Form ${newStatus}${note ? ` — ${note}` : ''}`,
    });
  } catch (err) {
    console.error('Approval error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
