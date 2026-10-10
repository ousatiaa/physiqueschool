import { NextRequest, NextResponse } from 'next/server';
import { users } from '@/lib/collections';
import { hashPassword } from '@/lib/auth';
import { isAutoApproved } from '@/lib/whitelist';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, fullName, track, level } = body;

    if (!email || !password || !fullName || !track || !level) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    const existingUser = await users.find({ email });
    if (existingUser.length > 0) {
      return NextResponse.json({ error: 'Email already exists' }, { status: 409 });
    }

    const approved = await isAutoApproved(fullName, level);

    const hashedPassword = await hashPassword(password);
    const user = await users.create({
      email,
      password: hashedPassword,
      fullName,
      track,
      level,
      role: 'student',
      approved,
    });

    return NextResponse.json(
      {
        message: approved
          ? 'Registration successful. Your account is activated.'
          : 'Registration submitted. Your account is awaiting admin approval.',
        user: {
          id: user._id,
          email: user.email,
          fullName: user.fullName,
          track: user.track,
          level: user.level,
          role: user.role,
          approved,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}