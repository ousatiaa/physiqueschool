import { users } from '@/lib/collections';
import bcrypt from 'bcryptjs';

export async function seedAdmin() {
  const admins = await users.find({ role: 'admin' });
  const existingAdmin = admins[0];
  if (existingAdmin) {
    return { message: 'Admin already exists' };
  }

  const hashedPassword = await bcrypt.hash('admin123', 12);
  const admin = await users.create({
    email: 'admin@physiqueschool.com',
    password: hashedPassword,
    fullName: 'Admin',
    track: 'idadi',
    level: '1ac',
    role: 'admin',
  });

  return {
    message: 'Admin created successfully',
    credentials: {
      email: 'admin@physiqueschool.com',
      password: 'admin123',
    },
  };
}
