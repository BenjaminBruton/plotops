import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

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

export async function GET() {
  try {
    // Check what tables exist
    const { data: tables, error: tablesError } = await supabaseAdmin
      .from('information_schema.tables')
      .select('table_schema, table_name')
      .in('table_schema', ['public', 'plotops']);
    
    if (tablesError) {
      console.error('Tables error:', tablesError);
    }

    // Try to query scenes from public schema
    const { data: publicScenes, error: publicError } = await supabaseAdmin
      .from('scenes')
      .select('*')
      .limit(1);

    return NextResponse.json({
      tables: tables || [],
      publicScenes: {
        data: publicScenes,
        error: publicError
      }
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
