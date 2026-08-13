import { z } from 'zod';

export const DirectDepositFormSchema = z.object({
  employeeName: z.string().min(1, 'Employee name required'),
  employeeEmail: z.string().email('Valid email required'),
  bankName: z.string().optional(),
  routingNumber: z.string().length(9, 'Routing number must be 9 digits').regex(/^\d{9}$/, 'Digits only'),
  accountNumber: z.string().min(4, 'Min 4 digits'),
  accountType: z.enum(['checking', 'savings']),
  employerName: z.string().min(1, 'Employer name required'),
  employerId: z.string().optional(),
  payFrequency: z.enum(['weekly', 'biweekly', 'semimonthly', 'monthly']),
  depositAmount: z.string().optional(),
  depositType: z.enum(['full', 'percent', 'fixed']),
});

export type DirectDepositForm = z.infer<typeof DirectDepositFormSchema>;

// ABA routing number checksum validation
export function validateRoutingNumber(routing: string): boolean {
  if (routing.length !== 9) return false;
  const d = routing.split('').map(Number);
  const sum =
    3 * (d[0] + d[3] + d[6]) +
    7 * (d[1] + d[4] + d[7]) +
    1 * (d[2] + d[5] + d[8]);
  return sum % 10 === 0;
}

// NACHA field validation
export function validateNACHACompliance(form: DirectDepositForm): string[] {
  const errors: string[] = [];
  if (form.employeeName.length > 22) errors.push('Employee name exceeds NACHA 22-char limit');
  if (form.accountNumber.length > 17) errors.push('Account number exceeds NACHA 17-char limit');
  if (!['checking', 'savings'].includes(form.accountType)) errors.push('Invalid account type for NACHA');
  return errors;
}
