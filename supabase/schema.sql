-- DepositAI Database Schema
-- Run in Supabase SQL Editor

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Employers
CREATE TABLE IF NOT EXISTS employers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_user_id TEXT NOT NULL UNIQUE,
  company_name TEXT NOT NULL,
  ein TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Employees (PII — encrypted at app level)
CREATE TABLE IF NOT EXISTS employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_id UUID NOT NULL REFERENCES employers(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Forms
CREATE TABLE IF NOT EXISTS forms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_id UUID NOT NULL REFERENCES employers(id) ON DELETE CASCADE,
  employee_id UUID REFERENCES employees(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','pending','approved','rejected')),
  employee_name TEXT NOT NULL,
  employee_email TEXT NOT NULL,
  bank_name TEXT,
  routing_number TEXT NOT NULL,
  account_number_encrypted TEXT NOT NULL,
  account_type TEXT NOT NULL CHECK (account_type IN ('checking','savings')),
  employer_name TEXT NOT NULL,
  employer_id_text TEXT,
  pay_frequency TEXT NOT NULL CHECK (pay_frequency IN ('weekly','biweekly','semimonthly','monthly')),
  deposit_amount TEXT,
  deposit_type TEXT NOT NULL CHECK (deposit_type IN ('full','percent','fixed')),
  form_version INT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  submitted_at TIMESTAMPTZ
);

-- Audit log (immutable)
CREATE TABLE IF NOT EXISTS audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id UUID REFERENCES forms(id) ON DELETE CASCADE,
  employer_id UUID REFERENCES employers(id) ON DELETE CASCADE,
  action TEXT NOT NULL CHECK (action IN ('created','updated','submitted','approved','rejected','exported','deleted')),
  actor_id TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_forms_employer ON forms(employer_id);
CREATE INDEX idx_forms_status ON forms(status);
CREATE INDEX idx_employees_employer ON employees(employer_id);
CREATE INDEX idx_audit_form ON audit_log(form_id);

-- RLS
ALTER TABLE employers ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Employers see own" ON employers FOR ALL USING (auth.jwt() ->> 'sub' = clerk_user_id);

-- Updated trigger
CREATE OR REPLACE FUNCTION update_updated_at() RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER forms_updated BEFORE UPDATE ON forms FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER employees_updated BEFORE UPDATE ON employees FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER employers_updated BEFORE UPDATE ON employers FOR EACH ROW EXECUTE FUNCTION update_updated_at();
