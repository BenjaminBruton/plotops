import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { createScene } from '../../../lib/api/scenes';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface ParsedScene {
  scene_number: string;
  scene_name?: string;
  location_name: string;
  scene_type: 'int' | 'ext' | 'int_ext';
  time_of_day: 'day' | 'night' | 'dawn' | 'dusk' | 'magic_hour';
  page_count?: number;
  description: string;
  characters?: string[];
  props?: string[];
  complexity_rating: number;
  script_notes?: string;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const projectId = formData.get('projectId');

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!projectId || typeof projectId !== 'string') {
      return NextResponse.json({ error: 'No project ID provided' }, { status: 400 });
    }

    // Read file content
    const text = await file.text();

    // Parse script using GPT-4o-mini
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are an expert screenplay parser. Parse the provided screenplay and extract scene information in structured JSON format.

For each scene, identify:
- scene_number: The scene number (e.g., "1", "2", "3A")
- scene_name: Optional descriptive name
- location_name: The location (e.g., "BANK LOBBY", "COFFEE SHOP")
- scene_type: "int" (interior), "ext" (exterior), or "int_ext" (both)
- time_of_day: "day", "night", "dawn", "dusk", or "magic_hour"
- page_count: Estimated page count (optional, decimal allowed)
- description: Brief description of what happens in the scene
- characters: Array of character names appearing in the scene
- props: Array of notable props mentioned
- complexity_rating: 1-5 rating (1=simple, 5=very complex) based on:
  * Number of characters
  * Location complexity
  * Special effects or stunts
  * Production requirements
- script_notes: Any special production notes

Return ONLY valid JSON with a "scenes" array. No markdown formatting.`,
        },
        {
          role: 'user',
          content: `Parse this screenplay:\n\n${text}`,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3,
    });

    const result = completion.choices[0].message.content;
    if (!result) {
      throw new Error('No response from OpenAI');
    }

    const parsed = JSON.parse(result);
    const scenes: ParsedScene[] = parsed.scenes || [];

    // Create scenes in database
    const createdScenes = [];
    for (const scene of scenes) {
      try {
        const created = await createScene({
          project_id: projectId,
          scene_number: scene.scene_number,
          scene_name: scene.scene_name,
          location_name: scene.location_name,
          scene_type: scene.scene_type,
          time_of_day: scene.time_of_day,
          page_count: scene.page_count,
          description: scene.description,
          complexity_rating: scene.complexity_rating,
          script_notes: scene.script_notes,
        });
        createdScenes.push(created);
      } catch (error) {
        console.error(`Failed to create scene ${scene.scene_number}:`, error);
      }
    }

    return NextResponse.json({
      success: true,
      scenesCreated: createdScenes.length,
      totalScenesParsed: scenes.length,
      scenes: createdScenes,
    });
  } catch (error: any) {
    console.error('Script parsing error:', error);
    return NextResponse.json(
      {
        error: 'Failed to parse script',
        message: error.message,
      },
      { status: 500 }
    );
  }
}
