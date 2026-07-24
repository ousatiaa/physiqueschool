import { NextRequest, NextResponse } from 'next/server';
import { lessons } from '@/lib/collections';
import { verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const level = searchParams.get('level');
    const track = searchParams.get('track');

    const filter: Record<string, string> = {};
    if (level) filter.level = level;
    if (track) filter.track = track;

    let data = await lessons.find(filter);

    if (level && track) {
      data = data.filter((l) => l.published !== false);
    }

    data.sort((a, b) => (a.chapterNumber || 0) - (b.chapterNumber || 0));
    return NextResponse.json(data);
  } catch (error) {
    console.error('Lessons GET error:', error);
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
    const lesson = await lessons.create(body);
    return NextResponse.json(lesson, { status: 201 });
  } catch (error) {
    console.error('Lessons POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
