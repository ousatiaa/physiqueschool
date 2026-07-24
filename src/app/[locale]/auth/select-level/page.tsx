'use client';

import { useEffect } from 'react';
import { useRouter } from '@/i18n/navigation';

export default function SelectLevelPage() {
  const router = useRouter();

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      router.push('/auth/register');
      return;
    }

    const user = JSON.parse(userStr);
    if (user.track && user.level) {
      router.push('/dashboard');
    } else {
      router.push('/auth/register');
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 flex items-center justify-center p-4">
      <div className="text-white text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent mx-auto mb-4"></div>
        <p>...</p>
      </div>
    </div>
  );
}
