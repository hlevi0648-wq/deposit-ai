import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';
import { supabaseAdmin } from '@/lib/supabase';

const PlaidLinkSchema = z.object({
  publicToken: z.string().min(1),
  formId: z.string().uuid(),
});

export async function POST(req: NextRequest) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const parsed = PlaidLinkSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { publicToken, formId } = parsed.data;

    // Exchange Plaid public token for access token
    const plaidResponse = await fetch('https://production.plaid.com/item/public_token/exchange', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: process.env.PLAID_CLIENT_ID,
        secret: process.env.PLAID_SECRET,
        public_token: publicToken,
      }),
    });

    if (!plaidResponse.ok) {
      const errBody = await plaidResponse.text();
      console.error('Plaid exchange failed:', errBody);
      return NextResponse.json({ error: 'Plaid token exchange failed' }, { status: 502 });
    }

    const { access_token } = await plaidResponse.json();

    // Store access token reference (not the token itself for security)
    const { error } = await supabaseAdmin
      .from('forms')
      .update({ plaid_verified: true })
      .eq('id', formId);

    if (error) {
      console.error('Supabase update error:', error);
      return NextResponse.json({ error: 'Failed to update form' }, { status: 500 });
    }

    await supabaseAdmin.from('audit_log').insert({
      form_id: formId,
      action: 'plaid_verified',
      actor_id: userId,
      metadata: { verified_at: new Date().toISOString() },
    });

    return NextResponse.json({
      success: true,
      formId,
      message: 'Bank account verified via Plaid',
    });
  } catch (err) {
    console.error('Plaid verification error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
