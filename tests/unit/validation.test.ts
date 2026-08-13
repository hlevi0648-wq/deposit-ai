import { validateRoutingNumber, validateNACHACompliance } from '../../src/lib/validation';

describe('validateRoutingNumber', () => {
  it('validates a correct ABA routing number', () => {
    // 026009593 — Bank of America (valid checksum)
    expect(validateRoutingNumber('026009593')).toBe(true);
  });

  it('rejects an invalid routing number (bad checksum)', () => {
    expect(validateRoutingNumber('026009594')).toBe(false);
  });

  it('rejects non-9-digit strings', () => {
    expect(validateRoutingNumber('123')).toBe(false);
    expect(validateRoutingNumber('1234567890')).toBe(false);
    expect(validateRoutingNumber('abcdefghi')).toBe(false);
  });
});

describe('validateNACHACompliance', () => {
  it('passes a compliant form', () => {
    const result = validateNACHACompliance({
      employeeName: 'John Doe',
      employeeEmail: 'john@example.com',
      routingNumber: '026009593',
      accountNumber: '1234',
      accountType: 'checking',
      employerName: 'Acme Corp',
      payFrequency: 'biweekly',
      depositType: 'full',
    });
    expect(result).toEqual([]);
  });

  it('flags missing required fields', () => {
    const result = validateNACHACompliance({
      employeeName: '',
      employeeEmail: 'bad',
      routingNumber: '000',
      accountNumber: '',
      accountType: 'checking',
      employerName: '',
      payFrequency: 'biweekly',
      depositType: 'full',
    });
    expect(result.length).toBeGreaterThan(0);
  });
});
