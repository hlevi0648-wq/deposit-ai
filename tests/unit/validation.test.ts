import { validateRoutingNumber, validateNACHACompliance } from '../validation';

describe('validateRoutingNumber', () => {
  it('validates a correct ABA routing number', () => {
    // 026009593 — Bank of America (valid checksum)
    expect(validateRoutingNumber('026009593')).toBe(true);
  });

  it('validates another known good routing number', () => {
    // 121000358 — Wells Fargo (valid)
    expect(validateRoutingNumber('121000358')).toBe(true);
  });

  it('rejects invalid checksum', () => {
    expect(validateRoutingNumber('026009590')).toBe(false);
  });

  it('rejects non-9-digit input', () => {
    expect(validateRoutingNumber('123')).toBe(false);
    expect(validateRoutingNumber('1234567890')).toBe(false);
  });

  it('rejects non-numeric input', () => {
    expect(validateRoutingNumber('abcdefghi')).toBe(false);
  });
});

describe('validateNACHACompliance', () => {
  const validForm = {
    employeeName: 'John Doe',
    employeeEmail: 'john@example.com',
    routingNumber: '026009593',
    accountNumber: '1234567890',
    accountType: 'checking',
    employerName: 'Acme Corp',
    payFrequency: 'biweekly',
    depositType: 'full',
  };

  it('passes for a valid form', () => {
    expect(validateNACHACompliance(validForm)).toEqual([]);
  });

  it('flags account number exceeding 17 digits', () => {
    expect(
      validateNACHACompliance({ ...validForm, accountNumber: '1'.repeat(18) })
    ).toContain('Account number exceeds 17 digits (NACHA limit)');
  });

  it('flags missing employee name', () => {
    expect(
      validateNACHACompliance({ ...validForm, employeeName: '' })
    ).toContain('Employee name is required');
  });
});
