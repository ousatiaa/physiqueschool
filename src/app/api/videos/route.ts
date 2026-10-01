import { NextRequest, NextResponse } from 'next/server';
import { videos } from '@/lib/collections';
import { verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const level = searchParams.get('level');
    const track = searchParams.get('track');
    const chapter = searchParams.get('chapter');

    const filter: Record<string, string> = {};
    if (level) filter.level = level;
    if (track) filter.track = track;
    if (chapter) filter.chapter = chapter;

    let data = await videos.find(filter);

    if (level && track) {
      data = data.filter((v) => v.published !== false);
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Videos GET error:', error);
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
    const video = await videos.create(body);
    return NextResponse.json(video, { status: 201 });
  } catch (error) {
    console.error('Videos POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
