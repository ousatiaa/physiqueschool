import { NextRequest, NextResponse } from 'next/server';
import { homework } from '@/lib/collections';
import { verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const level = searchParams.get('level');
    const track = searchParams.get('track');

    const filter: Record<string, string> = {};
    if (level) filter.level = level;
    if (track) filter.track = track;

    let data = await homework.find(filter);

    if (level && track) {
      data = data.filter((h) => h.published !== false);
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Homework GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value || request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    if (body.published === undefined) body.published = false;
    const hw = await homework.create(body);
    return NextResponse.json(hw, { status: 201 });
  } catch (error) {
    console.error('Homework POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
