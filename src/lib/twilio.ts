import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID || '';
const authToken = process.env.TWILIO_AUTH_TOKEN || '';
const fromNumber = process.env.TWILIO_PHONE_NUMBER || '';

export const twilioClient = accountSid && authToken
  ? twilio(accountSid, authToken)
  : null;

export async function sendSMS(to: string, body: string) {
  if (!twilioClient) {
    console.warn('Twilio not configured — SMS skipped');
    return null;
  }

  // Strip non-digits, ensure country code
  const cleaned = to.replace(/\D/g, '');
  const formatted = cleaned.startsWith('1') ? `+${cleaned}` : `+1${cleaned}`;

  const message = await twilioClient.messages.create({
    body: `DepositAI: ${body}`,
    from: fromNumber,
    to: formatted,
  });

  return message.sid;
}

export async function sendFormSubmissionSMS(to: string, employeeName: string, employerName: string) {
  return sendSMS(
    to,
    `Hi ${employeeName}, your direct deposit form with ${employerName} has been received and is pending review. Track at depositai.vercel.app/dashboard`
  );
}

export async function sendApprovalSMS(to: string, employeeName: string) {
  return sendSMS(
    to,
    `Hi ${employeeName}, your direct deposit form has been APPROVED. Deposits begin next pay cycle. — DepositAI`
  );
}
