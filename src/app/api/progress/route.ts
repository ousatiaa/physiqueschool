import { NextRequest, NextResponse } from 'next/server';
import { progress, lessons, exercises, homework, videos } from '@/lib/collections';
import { verifyToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value || request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const decoded = verifyToken(token);
    if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { userId, contentType, contentId, action } = body;

    const existing = await progress.find({ userId, contentType, contentId, action });
    if (existing.length > 0) {
      return NextResponse.json({ message: 'Already tracked' });
    }

    const record = await progress.create({
      userId,
      contentType,
      contentId,
      action,
      completedAt: new Date().toISOString(),
    });

    return NextResponse.json(record, { status: 201 });
  } catch (error) {
    console.error('Progress POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const adminToken = request.cookies.get('auth-token')?.value || request.headers.get('authorization')?.replace('Bearer ', '');

    if (userId) {
      const userProgress = await progress.find({ userId });

      const totalLessons = (await lessons.find({})).length;
      const totalExercises = (await exercises.find({})).length;
      const totalHomework = (await homework.find({})).length;
      const totalVideos = (await videos.find({})).length;

      const viewedLessons = userProgress.filter((p) => p.contentType === 'lesson' && p.action === 'viewed').length;
      const solvedExercises = userProgress.filter((p) => p.contentType === 'exercise' && p.action === 'solved').length;
      const viewedVideos = userProgress.filter((p) => p.contentType === 'video' && p.action === 'viewed').length;
      const completedHomework = userProgress.filter((p) => p.contentType === 'homework' && p.action === 'completed').length;

      return NextResponse.json({
        viewedLessons,
        totalLessons,
        solvedExercises,
        totalExercises,
        viewedVideos,
        totalVideos,
        completedHomework,
        totalHomework,
        recentActivity: userProgress.sort((a: any, b: any) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()).slice(0, 20),
      });
    }

    if (adminToken) {
      const decoded = verifyToken(adminToken);
      if (decoded && decoded.role === 'admin') {
        const allProgress = await progress.find({});
        return NextResponse.json(allProgress);
      }
    }

    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  } catch (error) {
    console.error('Progress GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
