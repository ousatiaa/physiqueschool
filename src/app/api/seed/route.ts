import { NextRequest, NextResponse } from 'next/server';
import { seedAdmin } from '@/lib/seed';

export async function GET() {
  try {
    const result = await seedAdmin();
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Seed error:', error);
    return NextResponse.json({
      error: 'Failed to seed',
      detail: error?.message?.split('\n')[0],
      stack: error?.stack?.split('\n').slice(0, 6).join(' | '),
    }, { status: 500 });
  }
}
