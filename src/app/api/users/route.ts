import { NextRequest, NextResponse } from 'next/server';
import { users } from '@/lib/collections';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';
import { verifyToken } from '@/lib/auth';
export const dynamic = 'force-dynamic';
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value || request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const allUsers = await users.find({});

    let rawCount = -1;
    let raw2Count = -1;
    try {
      const { data: raw } = await getSupabase().from('users').select('*').limit(1000).order('createdAt');
      rawCount = (raw ?? []).length;
      const { data: raw2, error: raw2Err } = await getSupabase().from('users').select('email, _id');
      raw2Count = raw2Err ? -1 : (raw2 ?? []).length;
    } catch (e: any) {
      rawCount = -2;
    }

    console.log(
      '[/api/users] configured=', isSupabaseConfigured,
      'url=', process.env.NEXT_PUBLIC_SUPABASE_URL,
      'svcTail=', (process.env.SUPABASE_SERVICE_ROLE_KEY || '').slice(-12),
      'anon4=', (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '').slice(0, 7),
      'hasService=', Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
      'findCount=', allUsers.length,
      'rawCount=', rawCount,
      'raw2Count=', raw2Count,
      'emails=', allUsers.map((u: any) => u.email).join('|')
    );

    const safe = allUsers.map(({ password, ...rest }) => rest);
    return NextResponse.json(safe);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
