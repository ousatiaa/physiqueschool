import { NextRequest, NextResponse } from 'next/server';
import { users } from '@/lib/collections';
import { hashPassword } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, newPassword } = body;

    if (!email || !newPassword) {
      return NextResponse.json({ error: 'Email and new password are required' }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: 'Le mot de passe doit contenir au moins 6 caractères' }, { status: 400 });
    }

    const found = await users.find({ email });
    if (found.length === 0) {
      return NextResponse.json({ error: 'Aucun compte trouvé avec cet email' }, { status: 404 });
    }

    const hashedPassword = await hashPassword(newPassword);
    const user = await users.update(found[0]._id!, { password: hashedPassword });

    if (!user) {
      return NextResponse.json({ error: 'Une erreur est survenue' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Mot de passe réinitialisé avec succès' });
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
