import { NextRequest, NextResponse } from 'next/server';
import { exercises } from '@/lib/collections';
import { verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const level = searchParams.get('level');
    const track = searchParams.get('track');
    const chapter = searchParams.get('chapter');
    const difficulty = searchParams.get('difficulty');

    const filter: Record<string, string> = {};
    if (level) filter.level = level;
    if (track) filter.track = track;
    if (chapter) filter.chapter = chapter;
    if (difficulty) filter.difficulty = difficulty;

    let data = await exercises.find(filter);

    if (level && track) {
      data = data.filter((e) => e.published !== false);
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Exercises GET error:', error);
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
    const exercise = await exercises.create(body);
    return NextResponse.json(exercise, { status: 201 });
  } catch (error) {
    console.error('Exercises POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
