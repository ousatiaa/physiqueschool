'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { ClipboardList, Search, Calendar, Download, Clock } from 'lucide-react';

interface User {
  level: string;
  track: string;
}

interface Homework {
  _id: string;
  title: string;
  titleFr: string;
  description: string;
  descriptionFr: string;
  fileUrl: string;
  deadline: string;
  chapter: string;
  chapterFr: string;
}

export default function HomeworkPage() {
  const t = useTranslations();
  const router = useRouter();
  const [homework, setHomework] = useState<Homework[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (!stored) {
      router.push('/auth/login');
      return;
    }
    const userData = JSON.parse(stored);

    const isAdmin = userData.role === 'admin';
    const params = isAdmin ? '' : `?level=${userData.level}&track=${userData.track}`;
    fetch(`/api/homework${params}`)
      .then((r) => r.json())
      .then((data) => {
        setHomework(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [router]);

  const filteredHomework = homework.filter((hw) => {
    const title = hw.titleFr;
    return title.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const isOverdue = (deadline: string) => new Date(deadline) < new Date();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <ClipboardList size={28} className="text-yellow-500" />
            {t('homework.title')}
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
        ) : filteredHomework.length === 0 ? (
          <div className="text-center py-12">
            <ClipboardList size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">{t('common.noContent')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredHomework.map((hw) => {
              const overdue = isOverdue(hw.deadline);
              return (
                <div key={hw._id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-100 overflow-hidden">
                  <div className={`h-2 ${overdue ? 'bg-red-500' : 'bg-yellow-500'}`} />
                  <div className="p-5">
                    <h3 className="font-semibold text-gray-800 mb-2">
                      {hw.titleFr}
                    </h3>

                    {hw.descriptionFr && (
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {hw.descriptionFr}
                      </p>
                    )}

                    {hw.chapterFr && (
                      <p className="text-xs text-gray-500 mb-3">
                        {t('lessons.chapter')}: {hw.chapterFr}
                      </p>
                    )}

                    <div className="flex items-center gap-4 mt-4">
                      <div className={`flex items-center gap-1 text-xs ${overdue ? 'text-red-600' : 'text-gray-500'}`}>
                        <Calendar size={14} />
                        {t('homework.deadline')}: {new Date(hw.deadline).toLocaleDateString('fr-FR')}
                      </div>
                    </div>

                    {hw.fileUrl && (
                      <a
                        href={hw.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => {
                          const stored = localStorage.getItem('user');
                          const token = localStorage.getItem('token');
                          if (stored && token) {
                            const userData = JSON.parse(stored);
                            if (userData.role !== 'admin') {
                              fetch('/api/progress', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                                body: JSON.stringify({ userId: userData.id, contentType: 'homework', contentId: hw._id, action: 'completed' }),
                              }).catch(() => {});
                            }
                          }
                        }}
                        className="mt-4 flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium text-sm"
                      >
                        <Download size={16} />
                        {t('homework.download')}
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
