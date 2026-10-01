'use client';

import { useEffect, useState } from 'react';
import { useRouter } from '@/i18n/navigation';
import { useParams } from 'next/navigation';
import { getLevelConfig } from '@/lib/constants';
import LevelExplorer from '@/components/dashboard/LevelExplorer';

interface User {
  id: string;
  email: string;
  fullName: string;
  track: string;
  level: string;
  role: string;
}

export default function LevelPage() {
  const router = useRouter();
  const params = useParams();
  const [user, setUser] = useState<User | null>(null);

  const level = Array.isArray(params.level) ? params.level[0] : params.level;

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (!stored) {
      router.push('/auth/login');
      return;
    }
    try {
      setUser(JSON.parse(stored));
    } catch {
      localStorage.removeItem('user');
      router.push('/auth/login');
    }
  }, [router]);

  if (!user) return null;
  if (!level) return null;

  const levelConfig = getLevelConfig(level as any);
  const track = levelConfig ? levelConfig.track : user.track;
  const isAdmin = user.role === 'admin';

  return (
    <LevelExplorer
      level={level}
      track={track}
      isAdmin={isAdmin}
      userId={isAdmin ? null : user.level === level ? user.id : null}
      backHref="/dashboard"
    />
  );
}
