'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter, Link } from '@/i18n/navigation';
import { BookOpen, Clock, ChevronRight, Search, ArrowLeft } from 'lucide-react';

interface User {
  level: string;
  track: string;
}

interface Lesson {
  _id: string;
  title: string;
  titleFr: string;
  chapter: string;
  chapterFr: string;
  chapterNumber: number;
  duration: number;
  level: string;
}

export default function LessonsPage() {
  const t = useTranslations();
  const router = useRouter();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (!stored) {
      router.push('/auth/login');
      return;
    }
    const userData = JSON.parse(stored);
    setUser(userData);

    const isAdmin = userData.role === 'admin';
    const params = isAdmin ? '' : `?level=${userData.level}&track=${userData.track}`;
    fetch(`/api/lessons${params}`)
      .then((r) => r.json())
      .then((data) => {
        setLessons(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [router]);

  const filteredLessons = lessons.filter((lesson) => {
    const title = lesson.titleFr;
    return title.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const groupedByChapter = filteredLessons.reduce((acc, lesson) => {
    const chapter = lesson.chapterFr;
    if (!acc[chapter]) acc[chapter] = [];
    acc[chapter].push(lesson);
    return acc;
  }, {} as Record<string, Lesson[]>);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link href="/dashboard" className="inline-flex items-center gap-1 text-primary-600 hover:text-primary-700 font-medium text-sm mb-4">
            <ArrowLeft size={16} />
            {t('dashboard.backToDashboard')}
          </Link>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <BookOpen size={28} className="text-primary-600" />
            {t('lessons.title')}
          </h1>
          <div className="mt-4 relative max-w-md">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder={t('common.search')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="text-center py-12 text-gray-500">{t('common.loading')}</div>
        ) : Object.keys(groupedByChapter).length === 0 ? (
          <div className="text-center py-12">
            <BookOpen size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">{t('common.noContent')}</p>
          </div>
        ) : (
          Object.entries(groupedByChapter).map(([chapter, chapterLessons]) => (
            <div key={chapter} className="mb-8">
              <h2 className="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2">
                <span className="bg-primary-100 text-primary-700 px-3 py-1 rounded-lg text-sm">
                  {t('lessons.chapter')} {chapterLessons[0].chapterNumber}
                </span>
                {chapter}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {chapterLessons.map((lesson) => (
                  <Link
                    key={lesson._id}
                    href={`/lessons/${lesson._id}`}
                    className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all p-5 border border-gray-100 group"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800 group-hover:text-primary-600 transition-colors">
                          {lesson.titleFr}
                        </h3>
                        {lesson.duration > 0 && (
                          <div className="flex items-center gap-1 mt-2 text-sm text-gray-500">
                            <Clock size={14} />
                            {lesson.duration} {t('lessons.minutes')}
                          </div>
                        )}
                      </div>
                      <ChevronRight size={18} className="text-gray-400 group-hover:text-primary-500 mt-1" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
