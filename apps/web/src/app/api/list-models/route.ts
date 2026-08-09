import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function GET() {
  try {
    const models = await genAI.listModels();
    
    return NextResponse.json({
      models: models.map(m => ({
        name: m.name,
        displayName: m.displayName,
        description: m.description,
        supportedMethods: m.supportedGenerationMethods,
      }))
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: 'Failed to list models',
        message: error.message,
      },
      { status: 500 }
    );
  }
}
