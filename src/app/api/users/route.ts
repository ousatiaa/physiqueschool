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
    try {
      const { data: raw } = await getSupabase().from('users').select('*');
      rawCount = (raw ?? []).length;
    } catch (e: any) {
      rawCount = -2;
    }

    console.log(
      '[/api/users] configured=', isSupabaseConfigured,
      'url=', process.env.NEXT_PUBLIC_SUPABASE_URL,
      'hasService=', Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
      'findCount=', allUsers.length,
      'rawCount=', rawCount,
      'emails=', allUsers.map((u: any) => u.email).join('|')
    );

    const safe = allUsers.map(({ password, ...rest }) => rest);
    return NextResponse.json(safe);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
