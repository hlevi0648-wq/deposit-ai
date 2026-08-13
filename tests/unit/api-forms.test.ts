import { POST } from '../../src/app/api/forms/route';
import { NextRequest } from 'next/server';

// Mock Clerk auth
jest.mock('@clerk/nextjs', () => ({
  auth: () => ({ userId: 'test-user-123' }),
}));

// Mock Supabase
const mockInsert = jest.fn();
const mockSelect = jest.fn();
const mockSingle = jest.fn();
const mockEq = jest.fn();
const mockOrder = jest.fn();
const mockLimit = jest.fn();

jest.mock('../../src/lib/supabase', () => ({
  supabaseAdmin: {
    from: jest.fn((table) => ({
      insert: mockInsert,
      select: mockSelect,
      eq: mockEq,
      order: mockOrder,
      limit: mockLimit,
    })),
  },
}));

// Mock email/twilio
jest.mock('../../src/lib/email', () => ({
  sendFormSubmissionEmail: jest.fn().mockResolvedValue({}),
  sendAdminNotification: jest.fn().mockResolvedValue({}),
}));

jest.mock('../../src/lib/twilio', () => ({
  sendFormSubmissionSMS: jest.fn().mockResolvedValue({}),
}));

describe('POST /api/forms', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockInsert.mockReturnValue({ select: () => ({ single: mockSingle }) });
    mockSingle.mockResolvedValue({ data: { id: 'form-123' }, error: null });
  });

  it('rejects unauthenticated requests', async () => {
    jest.doMock('@clerk/nextjs', () => ({ auth: () => ({ userId: null }) }));
    const req = new NextRequest('http://localhost/api/forms', {
      method: 'POST',
      body: JSON.stringify({}),
    });
    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it('rejects invalid routing number', async () => {
    const req = new NextRequest('http://localhost/api/forms', {
      method: 'POST',
      body: JSON.stringify({
        employeeName: 'John',
        employeeEmail: 'john@test.com',
        routingNumber: '000000000',
        accountNumber: '1234',
        accountType: 'checking',
        employerName: 'Acme',
        payFrequency: 'biweekly',
        depositType: 'full',
      }),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toContain('Invalid routing number');
  });

  it('creates a valid form', async () => {
    const req = new NextRequest('http://localhost/api/forms', {
      method: 'POST',
      body: JSON.stringify({
        employeeName: 'John Doe',
        employeeEmail: 'john@test.com',
        routingNumber: '026009593',
        accountNumber: '1234567890',
        accountType: 'checking',
        employerName: 'Acme Corp',
        payFrequency: 'biweekly',
        depositType: 'full',
      }),
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.formId).toBe('form-123');
  });
});
