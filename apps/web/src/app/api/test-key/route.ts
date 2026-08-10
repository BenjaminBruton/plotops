import { NextResponse } from 'next/server';

export async function GET() {
  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;
  
  return NextResponse.json({
    anthropic: {
      configured: !!anthropicKey,
      length: anthropicKey?.length || 0,
      prefix: anthropicKey?.substring(0, 10) || 'NOT SET'
    },
    openai: {
      configured: !!openaiKey,
      length: openaiKey?.length || 0,
      prefix: openaiKey?.substring(0, 10) || 'NOT SET'
    }
  });
}
