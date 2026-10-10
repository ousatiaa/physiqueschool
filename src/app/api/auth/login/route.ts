import { NextRequest, NextResponse } from 'next/server';
import { users } from '@/lib/collections';
import { verifyPassword, generateToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const foundUsers = await users.find({ email });
    if (foundUsers.length === 0) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const user = foundUsers[0];
    const isPasswordValid = await verifyPassword(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    if (user.role === 'student' && user.approved !== true) {
      return NextResponse.json(
        { error: 'Account awaiting admin approval. Please contact your administrator.' },
        { status: 403 }
      );
    }

    const token = generateToken({
      userId: user._id!,
      email: user.email,
      role: user.role,
      track: user.track,
      level: user.level,
    });

    const response = NextResponse.json({
      user: {
        id: user._id,
        email: user.email,
        fullName: user.fullName,
        track: user.track,
        level: user.level,
        role: user.role,
      },
      token,
    });

    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
