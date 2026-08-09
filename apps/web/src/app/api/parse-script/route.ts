import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { createClient } from '@supabase/supabase-js';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Use service role client for server-side operations (bypasses RLS)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

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
  console.log('📝 Parse script API called');
  
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const projectId = formData.get('projectId');

    console.log('📦 Received file:', file instanceof File ? file.name : 'NO FILE');
    console.log('🎬 Project ID:', projectId);

    if (!file || !(file instanceof File)) {
      console.error('❌ No file provided');
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!projectId || typeof projectId !== 'string') {
      console.error('❌ No project ID provided');
      return NextResponse.json({ error: 'No project ID provided' }, { status: 400 });
    }

    // Read file content
    console.log('📖 Reading file content...');
    const text = await file.text();
    console.log(`📄 File read successfully: ${text.length} characters`);

    // Use Gemini 1.5 Pro - most capable model for maximum accuracy
    // Perfect for longer scripts with 2M token context window
    console.log('🤖 Initializing Gemini 1.5 Pro (premium model for max accuracy)...');
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-pro-latest",
      generationConfig: {
        temperature: 0.1, // Low temperature for consistent, accurate parsing
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 8192, // Allow longer outputs for large scripts
      },
    });
    console.log('✅ Model initialized with premium configuration');

    console.log('📝 Creating prompt...');
    const prompt = `You are an expert screenplay parser. Parse ALL scenes from the provided screenplay and extract scene information in structured JSON format.

CRITICAL: You MUST parse EVERY SINGLE SCENE in the entire screenplay. Do not stop early. Parse from the first scene to the very last scene.

For each scene, identify:
- scene_number: The scene number (e.g., "1", "2", "3A") 
- scene_name: Optional descriptive name
- location_name: The location (e.g., "BANK LOBBY", "COFFEE SHOP")
- scene_type: "int" (interior), "ext" (exterior), or "int_ext" (both)
- time_of_day: "day", "night", "dawn", "dusk", or "magic_hour"
- page_count: Estimated page count (optional, use 1 if unknown)
- description: Very brief 1-sentence description
- characters: Array of character names (max 5 most important)
- props: Array of notable props (max 3)
- complexity_rating: 1-5 rating (1=simple, 5=complex)
- script_notes: Any special production notes (optional)

IMPORTANT INSTRUCTIONS:
1. Parse EVERY scene from start to finish
2. Keep descriptions brief (one sentence max)
3. Return ONLY valid JSON with a "scenes" array
4. No markdown formatting, no code blocks
5. If you reach output limits, prioritize including ALL scenes over detailed descriptions

Return format:
{"scenes": [{"scene_number": "1", "location_name": "...", ...}, ...]}

Screenplay to parse:

${text}`;

    console.log('🚀 Sending request to Gemini API... (this may take a while for large scripts)');
    const result = await model.generateContent(prompt);
    console.log('✅ Gemini API responded!');
    
    const response = result.response;
    let resultText = response.text();
    console.log(`📊 Response length: ${resultText?.length || 0} characters`);
    
    if (!resultText) {
      throw new Error('No response from Gemini');
    }

    // Strip markdown code blocks if present
    resultText = resultText.trim();
    if (resultText.startsWith('```json')) {
      resultText = resultText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      console.log('🔧 Stripped markdown code blocks from response');
    } else if (resultText.startsWith('```')) {
      resultText = resultText.replace(/^```\s*/, '').replace(/\s*```$/, '');
      console.log('🔧 Stripped markdown code blocks from response');
    }

    console.log('📋 Parsing JSON...');
    console.log('🔍 First 500 chars of cleaned response:', resultText.substring(0, 500));
    const parsed = JSON.parse(resultText);
    const scenes: ParsedScene[] = parsed.scenes || [];
    console.log(`✅ Parsed ${scenes.length} scenes from response`);
    
    if (scenes.length === 0) {
      console.warn('⚠️  No scenes were parsed! Gemini may not have understood the file format.');
      console.warn('💡 PDF files need special parsing. The raw PDF text contains formatting codes.');
    }

    // Delete existing scenes for this project before creating new ones
    console.log('🗑️  Deleting existing scenes for project...');
    const { error: deleteError } = await supabaseAdmin
      .from('scenes')
      .delete()
      .eq('project_id', projectId);

    if (deleteError) {
      console.error('❌ Error deleting existing scenes:', deleteError);
      // Continue anyway - might be first upload
    } else {
      console.log('✅ Existing scenes deleted');
    }

    // Create scenes in database using admin client (bypasses RLS)
    console.log(`💾 Creating ${scenes.length} scenes in database...`);
    const createdScenes = [];
    const characterMap = new Map<string, string>(); // Map character name to ID
    
    for (const scene of scenes) {
      try {
        // Calculate estimated duration based on page count and dialogue presence
        // With dialogue: 1 min/page, Without dialogue: 45 sec/page
        let estimatedDuration = 0;
        if (scene.page_count) {
          const hasDialogue = scene.characters && scene.characters.length > 0;
          estimatedDuration = Math.round(scene.page_count * (hasDialogue ? 60 : 45) / 60); // Convert to minutes
        }

        // Create the scene
        const { data: sceneData, error: sceneError } = await supabaseAdmin
          .from('scenes')
          .insert([{
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
            estimated_duration: estimatedDuration || undefined,
          }])
          .select()
          .single();

        if (sceneError) throw sceneError;
        createdScenes.push(sceneData);

        // Process characters for this scene
        if (scene.characters && scene.characters.length > 0) {
          console.log(`👤 Processing ${scene.characters.length} characters for scene ${scene.scene_number}:`, scene.characters);
          
          for (const characterName of scene.characters) {
            try {
              let characterId = characterMap.get(characterName);
              
              // Create character if it doesn't exist
              if (!characterId) {
                console.log(`🔍 Checking if character "${characterName}" exists...`);
                const { data: existingChar, error: findError } = await supabaseAdmin
                  .from('characters')
                  .select('id')
                  .eq('project_id', projectId)
                  .eq('name', characterName)
                  .maybeSingle();
                
                if (findError) {
                  console.error(`Error finding character ${characterName}:`, findError);
                }
                
                if (existingChar) {
                  console.log(`✅ Found existing character "${characterName}":`, existingChar.id);
                  characterId = existingChar.id;
                } else {
                  console.log(`➕ Creating new character "${characterName}"`);
                  const { data: newChar, error: charError } = await supabaseAdmin
                    .from('characters')
                    .insert([{
                      project_id: projectId,
                      name: characterName,
                    }])
                    .select('id')
                    .single();
                  
                  if (charError) {
                    console.error(`❌ Failed to create character ${characterName}:`, charError);
                    continue;
                  }
                  console.log(`✅ Created character "${characterName}":`, newChar.id);
                  characterId = newChar.id;
                }
                
                // Only add to map if we successfully got an ID
                if (characterId) {
                  characterMap.set(characterName, characterId);
                }
              }
              
              // Link character to scene (only if we have a valid character ID)
              if (characterId) {
                console.log(`🔗 Linking character "${characterName}" to scene ${scene.scene_number}`);
                const { error: linkError } = await supabaseAdmin
                  .from('scene_characters')
                  .insert([{
                    scene_id: sceneData.id,
                    character_id: characterId,
                  }]);
                
                if (linkError) {
                  console.error(`❌ Failed to link character ${characterName} to scene:`, linkError);
                } else {
                  console.log(`✅ Linked character "${characterName}" to scene ${scene.scene_number}`);
                }
              }
            } catch (charErr) {
              console.error(`❌ Error processing character ${characterName}:`, charErr);
            }
          }
        }
      } catch (error) {
        console.error(`Failed to create scene ${scene.scene_number}:`, error);
      }
    }
    
    console.log(`✅ Created ${characterMap.size} unique characters`);

    return NextResponse.json({
      success: true,
      scenesCreated: createdScenes.length,
      totalScenesParsed: scenes.length,
      scenes: createdScenes,
      scriptLength: text.length,
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
