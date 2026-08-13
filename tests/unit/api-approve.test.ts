import { POST } from '../../src/app/api/forms/approve/route';
import { NextRequest } from 'next/server';

jest.mock('@clerk/nextjs', () => ({
  auth: () => ({ userId: 'admin-123' }),
}));

const mockSingle = jest.fn();
const mockEq = jest.fn();
const mockUpdate = jest.fn();
const mockInsert = jest.fn();

jest.mock('../../src/lib/supabase', () => ({
  supabaseAdmin: {
    from: jest.fn((table) => ({
      select: () => ({ eq: mockEq }),
      update: mockUpdate,
      insert: mockInsert,
    })),
  },
}));

jest.mock('../../src/lib/email', () => ({
  sendApprovalEmail: jest.fn().mockResolvedValue({}),
}));

jest.mock('../../src/lib/twilio', () => ({
  sendApprovalSMS: jest.fn().mockResolvedValue({}),
}));

describe('POST /api/forms/approve', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockEq.mockReturnValue({ single: mockSingle });
    mockUpdate.mockReturnValue({ eq: mockEq });
    mockInsert.mockResolvedValue({ error: null });
  });

  it('approves a pending form', async () => {
    mockSingle.mockResolvedValue({
      data: { id: 'form-1', status: 'pending', employee_email: 'e@t.com', employee_name: 'Jane' },
      error: null,
    });

    const req = new NextRequest('http://localhost/api/forms/approve', {
      method: 'POST',
      body: JSON.stringify({ formId: '12345678-1234-1234-1234-123456789012', action: 'approve' }),
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.status).toBe('approved');
  });

  it('rejects approving an already-approved form', async () => {
    mockSingle.mockResolvedValue({
      data: { id: 'form-1', status: 'approved' },
      error: null,
    });

    const req = new NextRequest('http://localhost/api/forms/approve', {
      method: 'POST',
      body: JSON.stringify({ formId: '12345678-1234-1234-1234-123456789012', action: 'approve' }),
    });
    const res = await POST(req);
    expect(res.status).toBe(409);
  });
});
