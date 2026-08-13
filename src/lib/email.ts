import { Resend } from 'resend';

const apiKey = process.env.RESEND_API_KEY || '';
const fromEmail = process.env.FROM_EMAIL || 'onboarding@depositai.dev';
const adminEmail = process.env.ADMIN_EMAIL || 'admin@depositai.dev';

export const resend = new Resend(apiKey);

interface FormSubmissionData {
  employeeName: string;
  employerName: string;
  formId: string;
  payFrequency: string;
  depositType: string;
}

export async function sendFormSubmissionEmail(to: string, data: FormSubmissionData) {
  const { data: result, error } = await resend.emails.send({
    from: `DepositAI <${fromEmail}>`,
    to,
    subject: 'Your Direct Deposit Form Has Been Received',
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
        <div style="background: linear-gradient(135deg, #0A2540 0%, #1A1A2E 100%); border-radius: 12px; padding: 32px; color: #E6E9F0;">
          <h1 style="color: #00D4AA; font-size: 24px; margin: 0 0 16px;">DepositAI</h1>
          <p style="font-size: 16px; line-height: 1.6;">Hi ${data.employeeName},</p>
          <p style="font-size: 16px; line-height: 1.6; color: #8B95A7;">
            Your direct deposit form has been received and is now <strong style="color: #00D4AA;">pending review</strong>.
          </p>
          <div style="background: rgba(255,255,255,0.05); border-radius: 8px; padding: 16px; margin: 24px 0;">
            <p style="margin: 0 0 8px; font-size: 14px;"><strong>Employer:</strong> ${data.employerName}</p>
            <p style="margin: 0 0 8px; font-size: 14px;"><strong>Pay Frequency:</strong> ${data.payFrequency}</p>
            <p style="margin: 0 0 8px; font-size: 14px;"><strong>Deposit Type:</strong> ${data.depositType}</p>
            <p style="margin: 0; font-size: 14px;"><strong>Form ID:</strong> <code style="background: rgba(0,212,170,0.1); color: #00D4AA; padding: 2px 6px; border-radius: 4px;">${data.formId}</code></p>
          </div>
          <p style="font-size: 14px; color: #8B95A7; margin-top: 24px;">
            You'll receive another email once your form is approved and processed.<br>
            If you didn't submit this form, please contact your HR department immediately.
          </p>
          <hr style="border: none; border-top: 1px solid rgba(255,255,255,0.1); margin: 32px 0;">
          <p style="font-size: 12px; color: #8B95A7;">© 2026 DepositAI · Secure · NACHA Compliant</p>
        </div>
      </div>
    `,
  });

  if (error) throw new Error(`Email send failed: ${error.message}`);
  return result;
}

interface AdminNotificationData {
  employeeName: string;
  employerName: string;
  formId: string;
  status: string;
}

export async function sendAdminNotification(data: AdminNotificationData) {
  const { data: result, error } = await resend.emails.send({
    from: `DepositAI <${fromEmail}>`,
    to: adminEmail,
    subject: `New Direct Deposit Form: ${data.employeeName}`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
        <div style="background: linear-gradient(135deg, #0A2540 0%, #1A1A2E 100%); border-radius: 12px; padding: 32px; color: #E6E9F0;">
          <h1 style="color: #00D4AA; font-size: 24px; margin: 0 0 16px;">New Form Submission</h1>
          <div style="background: rgba(255,255,255,0.05); border-radius: 8px; padding: 16px; margin: 24px 0;">
            <p style="margin: 0 0 8px; font-size: 14px;"><strong>Employee:</strong> ${data.employeeName}</p>
            <p style="margin: 0 0 8px; font-size: 14px;"><strong>Employer:</strong> ${data.employerName}</p>
            <p style="margin: 0 0 8px; font-size: 14px;"><strong>Status:</strong> <span style="color: #00D4AA;">${data.status}</span></p>
            <p style="margin: 0; font-size: 14px;"><strong>Form ID:</strong> <code style="background: rgba(0,212,170,0.1); color: #00D4AA; padding: 2px 6px; border-radius: 4px;">${data.formId}</code></p>
          </div>
          <a href="https://deposit-ai.vercel.app/dashboard" style="display: inline-block; background: #00D4AA; color: #0A2540; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">Review in Dashboard →</a>
        </div>
      </div>
    `,
  });

  if (error) throw new Error(`Admin email failed: ${error.message}`);
  return result;
}

export async function sendApprovalEmail(to: string, employeeName: string, formId: string) {
  const { data: result, error } = await resend.emails.send({
    from: `DepositAI <${fromEmail}>`,
    to,
    subject: 'Your Direct Deposit Form Has Been Approved',
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
        <div style="background: linear-gradient(135deg, #0A2540 0%, #1A1A2E 100%); border-radius: 12px; padding: 32px; color: #E6E9F0;">
          <h1 style="color: #00D4AA; font-size: 24px; margin: 0 0 16px;">✓ Approved</h1>
          <p style="font-size: 16px; line-height: 1.6;">Hi ${employeeName},</p>
          <p style="font-size: 16px; line-height: 1.6; color: #8B95A7;">
            Your direct deposit form has been <strong style="color: #00D4AA;">approved</strong> and is now being processed.
          </p>
          <p style="font-size: 14px; color: #8B95A7; margin-top: 24px;">
            Your deposits will begin on the next pay cycle.<br>
            Form ID: <code style="background: rgba(0,212,170,0.1); color: #00D4AA; padding: 2px 6px; border-radius: 4px;">${formId}</code>
          </p>
          <hr style="border: none; border-top: 1px solid rgba(255,255,255,0.1); margin: 32px 0;">
          <p style="font-size: 12px; color: #8B95A7;">© 2026 DepositAI · Secure · NACHA Compliant</p>
        </div>
      </div>
    `,
  });

  if (error) throw new Error(`Approval email failed: ${error.message}`);
  return result;
}
