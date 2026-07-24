'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter, Link } from '@/i18n/navigation';
import { getLevelConfig, type LevelType } from '@/lib/constants';
import { BookOpen, Video, FileText, ClipboardList, ArrowLeft, Atom } from 'lucide-react';

interface User {
  id: string;
  email: string;
  fullName: string;
  track: string;
  level: string;
  role: string;
}

interface Stats {
  lessons: number;
  videos: number;
  exercises: number;
  homework: number;
}

export default function DashboardPage() {
  const t = useTranslations();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<Stats>({ lessons: 0, videos: 0, exercises: 0, homework: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (!stored) {
      router.push('/auth/login');
      return;
    }
    const userData = JSON.parse(stored);
    setUser(userData);

    const isAdmin = userData.role === 'admin';
    const levelParam = isAdmin ? '' : `level=${userData.level}&`;
    const trackParam = isAdmin ? '' : `track=${userData.track}`;

    const fetchStats = async () => {
      try {
        const [lessons, videos, exercises, homework] = await Promise.all([
          fetch(`/api/lessons?${levelParam}${trackParam}`).then((r) => r.json()),
          fetch(`/api/videos?${levelParam}${trackParam}`).then((r) => r.json()),
          fetch(`/api/exercises?${levelParam}${trackParam}`).then((r) => r.json()),
          fetch(`/api/homework?${levelParam}${trackParam}`).then((r) => r.json()),
        ]);

        setStats({
          lessons: Array.isArray(lessons) ? lessons.length : 0,
          videos: Array.isArray(videos) ? videos.length : 0,
          exercises: Array.isArray(exercises) ? exercises.length : 0,
          homework: Array.isArray(homework) ? homework.length : 0,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [router]);

  if (!user) return null;

  const levelConfig = getLevelConfig(user.level as LevelType);
  const levelName = levelConfig ? levelConfig.nameFr : user.level;
  const trackName = levelConfig
    ? levelConfig.trackNameFr
    : user.track;

  const statCards = [
    { key: 'lessons', label: t('dashboard.totalLessons'), value: stats.lessons, icon: <BookOpen size={28} />, color: 'bg-blue-500', href: '/lessons' },
    { key: 'videos', label: t('dashboard.totalVideos'), value: stats.videos, icon: <Video size={28} />, color: 'bg-red-500', href: '/videos' },
    { key: 'exercises', label: t('dashboard.totalExercises'), value: stats.exercises, icon: <FileText size={28} />, color: 'bg-green-500', href: '/exercises' },
    { key: 'homework', label: t('dashboard.totalHomework'), value: stats.homework, icon: <ClipboardList size={28} />, color: 'bg-yellow-500', href: '/homework' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-white/20 rounded-2xl p-3">
              <Atom size={36} />
            </div>
            <div>
              <h1 className="text-3xl font-bold">{t('dashboard.welcome')}</h1>
              <p className="text-white/80 mt-1">{t('dashboard.welcomeMessage')}</p>
            </div>
          </div>
          <div className="mt-6 flex flex-wrap gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl px-5 py-3">
              <span className="text-white/60 text-sm">{t('dashboard.myLevel')}</span>
              <p className="font-bold text-lg">{levelName}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl px-5 py-3">
              <span className="text-white/60 text-sm">{t('dashboard.myTrack')}</span>
              <p className="font-bold text-lg">{trackName}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 pb-12">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((card) => (
            <Link
              key={card.key}
              href={card.href}
              className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all p-6 group"
            >
              <div className={`inline-flex p-3 rounded-xl ${card.color} text-white mb-4 group-hover:scale-110 transition-transform`}>
                {card.icon}
              </div>
              <div className="text-3xl font-bold text-gray-800">
                {loading ? '...' : card.value}
              </div>
              <div className="text-sm text-gray-500 mt-1">{card.label}</div>
            </Link>
          ))}
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-bold text-gray-800 mb-6">{t('common.lessons')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { href: '/lessons', icon: <BookOpen size={32} />, color: 'from-blue-500 to-blue-600' },
              { href: '/videos', icon: <Video size={32} />, color: 'from-red-500 to-red-600' },
              { href: '/exercises', icon: <FileText size={32} />, color: 'from-green-500 to-green-600' },
              { href: '/homework', icon: <ClipboardList size={32} />, color: 'from-yellow-500 to-yellow-600' },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all overflow-hidden group"
              >
                <div className={`bg-gradient-to-r ${item.color} p-8 flex items-center justify-center text-white group-hover:scale-105 transition-transform`}>
                  {item.icon}
                </div>
                <div className="p-5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-gray-800">
                      {item.href === '/lessons' && t('common.lessons')}
                      {item.href === '/videos' && t('common.videos')}
                      {item.href === '/exercises' && t('common.exercises')}
                      {item.href === '/homework' && t('common.homework')}
                    </span>
                    <ArrowLeft size={18} className="text-gray-400 group-hover:text-primary-500 group-hover:-translate-x-1 transition-all" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
