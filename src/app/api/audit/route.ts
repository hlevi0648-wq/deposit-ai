import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  try {
    const { userId } = auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const formId = searchParams.get('formId');
    const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 200);

    let query = supabaseAdmin
      .from('audit_log')
      .select('id, form_id, action, actor_id, metadata, created_at')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (formId) query = query.eq('form_id', formId);

    const { data, error } = await query;

    if (error) return NextResponse.json({ error: 'Failed to fetch audit log' }, { status: 500 });

    return NextResponse.json({ entries: data || [] });
  } catch (err) {
    console.error('Audit log error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
