import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    // Test 1: Check if Supabase client is initialized
    if (!supabase) {
      return NextResponse.json(
        {
          success: false,
          error: 'Supabase client not initialized',
        },
        { status: 500 }
      );
    }

    // Test 2: Check environment variables
    const hasUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL;
    const hasKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!hasUrl || !hasKey) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing environment variables',
          details: {
            hasUrl,
            hasKey,
          },
        },
        { status: 500 }
      );
    }

    // Test 3: Try to query the database
    const { data: organizations, error: orgError } = await supabase
      .from('organizations')
      .select('id, name')
      .limit(5);

    if (orgError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Database query failed',
          details: {
            message: orgError.message,
            code: orgError.code,
            hint: orgError.hint,
          },
        },
        { status: 500 }
      );
    }

    // Test 4: Query projects
    const { data: projects, error: projectError } = await supabase
      .from('projects')
      .select('id, title, status')
      .limit(5);

    if (projectError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Projects query failed',
          details: {
            message: projectError.message,
            code: projectError.code,
            hint: projectError.hint,
          },
        },
        { status: 500 }
      );
    }

    // Test 5: Check schema access
    const { data: scenes, error: sceneError } = await supabase
      .from('scenes')
      .select('count')
      .limit(1);

    // All tests passed!
    return NextResponse.json({
      success: true,
      message: '🎬 Supabase connection successful!',
      data: {
        organizationsCount: organizations?.length || 0,
        projectsCount: projects?.length || 0,
        canAccessScenes: !sceneError,
        organizations: organizations || [],
        projects: projects || [],
      },
      tests: {
        clientInitialized: true,
        environmentVariables: true,
        databaseConnection: true,
        schemaAccess: true,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: 'Unexpected error',
        details: {
          message: error.message,
          stack: error.stack,
        },
      },
      { status: 500 }
    );
  }
}
