import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import { supabaseAdmin } from '@/lib/supabase';
import { validateRoutingNumber } from '@/lib/validation';
import { sendFormSubmissionEmail } from '@/lib/email';

interface CSVRow {
  employeeName: string;
  employeeEmail: string;
  employeePhone?: string;
  bankName?: string;
  routingNumber: string;
  accountNumber: string;
  accountType: 'checking' | 'savings';
  employerName: string;
  employerId?: string;
  payFrequency: 'weekly' | 'biweekly' | 'semimonthly' | 'monthly';
  depositAmount?: string;
  depositType: 'full' | 'percent' | 'fixed';
}

function parseCSV(text: string): CSVRow[] {
  const lines = text.trim().split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) throw new Error('CSV must have a header row and at least one data row');

  const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());
  const required = ['employeename', 'employeeemail', 'routingnumber', 'accountnumber', 'accounttype', 'employername', 'payfrequency', 'deposittype'];
  const missing = required.filter((r) => !headers.includes(r));
  if (missing.length > 0) throw new Error(`Missing required columns: ${missing.join(', ')}`);

  const rows: CSVRow[] = [];
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map((v) => v.trim());
    const row: Record<string, string> = {};
    headers.forEach((h, idx) => { row[h] = values[idx] || ''; });

    rows.push({
      employeeName: row.employeename,
      employeeEmail: row.employeeemail,
      employeePhone: row.employeephone || undefined,
      bankName: row.bankname || undefined,
      routingNumber: row.routingnumber,
      accountNumber: row.accountnumber,
      accountType: (row.accounttype === 'savings' ? 'savings' : 'checking') as 'checking' | 'savings',
      employerName: row.employername,
      employerId: row.employerid || undefined,
      payFrequency: row.payfrequency as CSVRow['payFrequency'],
      depositAmount: row.depositamount || undefined,
      depositType: row.deposittype as CSVRow['depositType'],
    });
  }
  return rows;
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    if (!file) return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });

    if (!file.name.endsWith('.csv')) return NextResponse.json({ error: 'File must be a CSV' }, { status: 400 });

    const text = await file.text();
    let rows: CSVRow[];
    try {
      rows = parseCSV(text);
    } catch (err) {
      return NextResponse.json({ error: (err as Error).message }, { status: 400 });
    }

    const results: { row: number; success: boolean; formId?: string; error?: string }[] = [];
    let successCount = 0;

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      try {
        if (!validateRoutingNumber(row.routingNumber)) {
          throw new Error('Invalid routing number (ABA checksum failed)');
        }

        const { data: form, error } = await supabaseAdmin
          .from('forms')
          .insert({
            employee_name: row.employeeName,
            employee_email: row.employeeEmail,
            bank_name: row.bankName,
            routing_number: row.routingNumber,
            account_number_encrypted: row.accountNumber,
            account_type: row.accountType,
            employer_name: row.employerName,
            employer_id_text: row.employerId,
            pay_frequency: row.payFrequency,
            deposit_amount: row.depositAmount,
            deposit_type: row.depositType,
            status: 'pending',
          })
          .select('id')
          .single();

        if (error) throw new Error('Database insert failed');

        await supabaseAdmin.from('audit_log').insert({
          form_id: form.id,
          action: 'created',
          actor_id: userId,
          metadata: { source: 'csv_import', row: i + 2 },
        });

        // Fire and forget email
        sendFormSubmissionEmail(row.employeeEmail, {
          employeeName: row.employeeName,
          employerName: row.employerName,
          formId: form.id,
          payFrequency: row.payFrequency,
          depositType: row.depositType,
        }).catch(() => {});

        results.push({ row: i + 2, success: true, formId: form.id });
        successCount++;
      } catch (err) {
        results.push({ row: i + 2, success: false, error: (err as Error).message });
      }
    }

    return NextResponse.json({
      success: true,
      total: rows.length,
      succeeded: successCount,
      failed: rows.length - successCount,
      results,
    });
  } catch (err) {
    console.error('CSV import error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
