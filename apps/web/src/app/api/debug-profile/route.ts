import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export async function GET() {
  try {
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Not authenticated', userError });
    }

    // Try to get profile
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*, organizations(*)')
      .eq('id', user.id)
      .single();

    return NextResponse.json({
      userId: user.id,
      userEmail: user.email,
      profile,
      profileError: profileError?.message,
      rawProfile: await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single()
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
