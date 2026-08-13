import OpenAI from 'openai';

if (!process.env.OPENAI_API_KEY) {
  console.warn('OPENAI_API_KEY not set — AI extraction will fail');
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'placeholder',
});

const extractFormFunction: OpenAI.Chat.Completions.ChatCompletionTool = {
  type: 'function',
  function: {
    name: 'extract_direct_deposit_form',
    description: 'Extract direct deposit form fields from document text, OCR output, or user-provided context. Only include fields you are confident about.',
    parameters: {
      type: 'object',
      properties: {
        employeeName: { type: 'string', description: 'Full legal name of the employee' },
        employeeEmail: { type: 'string', description: 'Employee email address' },
        bankName: { type: 'string', description: 'Name of the bank or financial institution' },
        routingNumber: { type: 'string', description: '9-digit ABA routing number' },
        accountNumber: { type: 'string', description: 'Bank account number (digits only)' },
        accountType: { type: 'string', enum: ['checking', 'savings'], description: 'Account type' },
        employerName: { type: 'string', description: 'Employer company name' },
        employerId: { type: 'string', description: 'Employer EIN or identifier' },
        payFrequency: { type: 'string', enum: ['weekly', 'biweekly', 'semimonthly', 'monthly'], description: 'Pay frequency' },
        depositType: { type: 'string', enum: ['full', 'percent', 'fixed'], description: 'Deposit type' },
      },
      required: [],
    },
  },
};

export async function extractFormFromContext(input: string): Promise<Record<string, unknown>> {
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content:
          'You are a payroll assistant that extracts direct deposit form information from documents (void checks, W-4s, offer letters, OCR text). Extract all available fields accurately. If a field is not present, omit it. Never guess or fabricate data.',
      },
      { role: 'user', content: input },
    ],
    tools: [extractFormFunction],
    tool_choice: { type: 'function', function: { name: 'extract_direct_deposit_form' } },
    temperature: 0.1,
  });

  const toolCall = completion.choices[0]?.message?.tool_calls?.[0];
  if (toolCall?.type === 'function') {
    return JSON.parse(toolCall.function.arguments);
  }

  throw new Error('AI extraction failed — no function call returned');
}
