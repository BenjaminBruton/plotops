import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

export async function GET() {
  const modelsToTest = [
    'claude-3-5-sonnet-20241022',
    'claude-3-5-sonnet-20240620',
    'claude-3-5-sonnet-latest',
    'claude-3-opus-20240229',
    'claude-3-sonnet-20240229',
    'claude-3-haiku-20240307',
  ];

  const results = [];

  for (const model of modelsToTest) {
    try {
      const message = await anthropic.messages.create({
        model,
        max_tokens: 50,
        messages: [{
          role: 'user',
          content: 'Say hello'
        }]
      });
      
      results.push({
        model,
        status: 'SUCCESS ✅',
        response: message.content[0]
      });
    } catch (error: any) {
      results.push({
        model,
        status: 'FAILED ❌',
        error: error.message
      });
    }
  }

  return NextResponse.json({
    apiKeyConfigured: !!process.env.ANTHROPIC_API_KEY,
    results
  });
}
