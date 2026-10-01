import { NextRequest, NextResponse } from 'next/server';
import { users } from '@/lib/collections';
import { verifyPassword, hashPassword, verifyToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value || request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const body = await request.json();
    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: 'Tous les champs sont requis' }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: 'Le nouveau mot de passe doit contenir au moins 6 caractères' }, { status: 400 });
    }

    const user = await users.findById(decoded.userId);
    if (!user) {
      return NextResponse.json({ error: 'Compte introuvable' }, { status: 404 });
    }

    const isPasswordValid = await verifyPassword(currentPassword, user.password);
    if (!isPasswordValid) {
      return NextResponse.json({ error: 'Mot de passe actuel incorrect' }, { status: 401 });
    }

    const hashedPassword = await hashPassword(newPassword);
    const updated = await users.update(user._id!, { password: hashedPassword });

    if (!updated) {
      return NextResponse.json({ error: 'Une erreur est survenue' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Mot de passe modifié avec succès' });
  } catch (error) {
    console.error('Change password error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
