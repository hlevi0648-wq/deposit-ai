import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
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

    // Exchange public token for access token
    const exchangeRes = await fetch('https://' + (process.env.PLAID_ENV || 'sandbox') + '.plaid.com/item/public_token/exchange', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: process.env.PLAID_CLIENT_ID,
        secret: process.env.PLAID_SECRET,
        public_token: publicToken,
      }),
    });

    if (!exchangeRes.ok) {
      const err = await exchangeRes.json();
      return NextResponse.json(
        { error: 'Plaid token exchange failed', details: err },
        { status: 400 }
      );
    }

    const { access_token, item_id } = await exchangeRes.json();

    // Get account data (auth + accounts)
    const authRes = await fetch('https://' + (process.env.PLAID_ENV || 'sandbox') + '.plaid.com/auth/get', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: process.env.PLAID_CLIENT_ID,
        secret: process.env.PLAID_SECRET,
        access_token,
      }),
    });

    if (!authRes.ok) {
      return NextResponse.json(
        { error: 'Failed to retrieve account data from Plaid' },
        { status: 500 }
      );
    }

    const authData = await authRes.json();
    const account = authData.accounts?.[0];
    const numbers = authData.numbers?.ach?.[0];

    if (!account || !numbers) {
      return NextResponse.json(
        { error: 'No ACH-capable account found' },
        { status: 400 }
      );
    }

    // Update form with verified bank data
    const { error: updateError } = await supabaseAdmin
      .from('forms')
      .update({
        bank_name: account.name,
        routing_number: numbers.routing,
        account_number_encrypted: numbers.account,
        account_type: account.subtype === 'savings' ? 'savings' : 'checking',
      })
      .eq('id', formId);

    if (updateError) {
      return NextResponse.json({ error: 'Failed to update form' }, { status: 500 });
    }

    // Audit log
    await supabaseAdmin.from('audit_log').insert({
      form_id: formId,
      action: 'updated',
      actor_id: userId,
      metadata: {
        source: 'plaid',
        item_id,
        bank_verified: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Bank account verified via Plaid',
      data: {
        bankName: account.name,
        accountType: account.subtype,
        routing: numbers.routing,
        accountLast4: numbers.account.slice(-4),
      },
    });
  } catch (err) {
    console.error('Plaid verification error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Generate link token for frontend Plaid Link
export async function GET() {
  const { userId } = auth();
    if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const res = await fetch('https://' + (process.env.PLAID_ENV || 'sandbox') + '.plaid.com/link/token/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
      client_id: process.env.PLAID_CLIENT_ID,
      secret: process.env.PLAID_SECRET,
      user: { client_user_id: userId },
      client_name: 'DepositAI',
      products: ['auth'],
      country_codes: ['US'],
      language: 'en',
    }),
  });

  if (!res.ok) {
    return NextResponse.json({ error: 'Failed to create Plaid link token' }, { status: 500 });
  }

  const data = await res.json();
  return NextResponse.json({ linkToken: data.link_token });
}
