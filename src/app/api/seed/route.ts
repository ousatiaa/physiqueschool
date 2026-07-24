import { NextRequest, NextResponse } from 'next/server';
import { seedAdmin } from '@/lib/seed';

export async function GET() {
  try {
    const result = await seedAdmin();
    return NextResponse.json(result);
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json({ error: 'Failed to seed' }, { status: 500 });
  }
}
