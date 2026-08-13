import { parseCSV } from '../../src/app/api/forms/import/route';

describe('CSV Parser', () => {
  it('parses a valid CSV', () => {
    const csv = `employeeName,employeeEmail,routingNumber,accountNumber,accountType,employerName,payFrequency,depositType\nJohn Doe,john@test.com,026009593,1234567890,checking,Acme,biweekly,full`;
    const rows = parseCSV(csv);
    expect(rows).toHaveLength(1);
    expect(rows[0].employeeName).toBe('John Doe');
  });

  it('throws on missing required columns', () => {
    const csv = `employeeName,employeeEmail\nJohn,john@test.com`;
    expect(() => parseCSV(csv)).toThrow('Missing required columns');
  });

  it('throws on empty CSV', () => {
    expect(() => parseCSV('')).toThrow('at least one data row');
  });
});
