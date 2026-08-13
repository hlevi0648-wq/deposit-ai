import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { sendApprovalEmail } from '@/lib/email';

// Webhook receiver for external systems (payroll, HRIS, NACHA processors)
// Authenticates via Bearer token in Authorization header
export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    if (!token || token !== process.env.WEBHOOK_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { event, formId, status, data } = body;

    if (!event || !formId) {
      return NextResponse.json({ error: 'Missing event or formId' }, { status: 400 });
    }

    // Audit log the webhook receipt
    await supabaseAdmin.from('audit_log').insert({
      form_id: formId,
      action: 'updated',
      actor_id: `webhook:${event}`,
      metadata: { source: 'webhook', event, payload: data },
    });

    switch (event) {
      case 'form.status_update': {
        if (!status) return NextResponse.json({ error: 'Missing status' }, { status: 400 });

        const validStatuses = ['draft', 'pending', 'approved', 'rejected'];
        if (!validStatuses.includes(status)) {
          return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
        }

        const { error } = await supabaseAdmin
          .from('forms')
          .update({ status, submitted_at: status === 'approved' ? new Date().toISOString() : null })
          .eq('id', formId);

        if (error) return NextResponse.json({ error: 'Failed to update form' }, { status: 500 });

        // Send approval email if status changed to approved
        if (status === 'approved') {
          const { data: form } = await supabaseAdmin
            .from('forms')
            .select('employee_email, employee_name')
            .eq('id', formId)
            .single();

          if (form) {
            await sendApprovalEmail(form.employee_email, form.employee_name, formId).catch(() => {});
          }
        }

        return NextResponse.json({ success: true, message: `Status updated to ${status}` });
      }

      case 'form.export_requested': {
        // External system requested export — log it
        return NextResponse.json({
          success: true,
          message: 'Export request logged',
          exportUrl: `/api/forms/export?formId=${formId}`,
        });
      }

      case 'form.audit_append': {
        // Append custom audit metadata
        const { error } = await supabaseAdmin.from('audit_log').insert({
          form_id: formId,
          action: 'updated',
          actor_id: `webhook:${event}`,
          metadata: data || {},
        });

        if (error) return NextResponse.json({ error: 'Failed to append audit' }, { status: 500 });
        return NextResponse.json({ success: true, message: 'Audit entry appended' });
      }

      default:
        return NextResponse.json({ error: `Unknown event: ${event}` }, { status: 400 });
    }
  } catch (err) {
    console.error('Webhook error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
