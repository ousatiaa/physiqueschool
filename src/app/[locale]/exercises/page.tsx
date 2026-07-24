'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { FileText, Search, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';
import MarkdownRenderer from '@/components/ui/MarkdownRenderer';

interface User {
  level: string;
  track: string;
}

interface Exercise {
  _id: string;
  title: string;
  titleFr: string;
  description: string;
  descriptionFr: string;
  content: string;
  contentFr: string;
  solution: string;
  solutionFr: string;
  chapter: string;
  chapterFr: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

const difficultyColors = {
  easy: 'bg-green-100 text-green-700',
  medium: 'bg-yellow-100 text-yellow-700',
  hard: 'bg-red-100 text-red-700',
};

const difficultyLabels: Record<string, string> = {
  easy: 'Facile',
  medium: 'Moyen',
  hard: 'Difficile',
};

export default function ExercisesPage() {
  const t = useTranslations();
  const router = useRouter();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSolutions, setShowSolutions] = useState<Record<string, boolean>>({});
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (!stored) {
      router.push('/auth/login');
      return;
    }
    const userData = JSON.parse(stored);
    setIsAdmin(userData.role === 'admin');

    const isAdmin = userData.role === 'admin';
    const params = isAdmin ? '' : `?level=${userData.level}&track=${userData.track}`;
    fetch(`/api/exercises${params}`)
      .then((r) => r.json())
      .then((data) => {
        setExercises(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [router]);

  const toggleSolution = (id: string) => {
    setShowSolutions((prev) => ({ ...prev, [id]: !prev[id] }));
    if (!showSolutions[id]) {
      const stored = localStorage.getItem('user');
      const token = localStorage.getItem('token');
      if (stored && token) {
        const userData = JSON.parse(stored);
        if (userData.role !== 'admin') {
          fetch('/api/progress', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ userId: userData.id, contentType: 'exercise', contentId: id, action: 'solved' }),
          }).catch(() => {});
        }
      }
    }
  };

  const filteredExercises = exercises.filter((exercise) => {
    const title = exercise.titleFr;
    return title.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FileText size={28} className="text-green-500" />
            {t('exercises.title')}
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
        ) : filteredExercises.length === 0 ? (
          <div className="text-center py-12">
            <FileText size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">{t('common.noContent')}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredExercises.map((exercise) => (
              <div key={exercise._id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-semibold text-gray-800 text-lg">
                      {exercise.titleFr}
                    </h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${difficultyColors[exercise.difficulty]}`}>
                      {difficultyLabels[exercise.difficulty]}
                    </span>
                  </div>

                  {exercise.chapterFr && (
                    <p className="text-sm text-gray-500 mb-3">
                      {t('lessons.chapter')}: {exercise.chapterFr}
                    </p>
                  )}

                  <div className="bg-gray-50 rounded-xl p-5 mb-4">
                    <MarkdownRenderer content={exercise.contentFr} className="text-sm" disableCopy={!isAdmin} />
                  </div>

                  {exercise.solution && (
                    <div>
                      <button
                        onClick={() => toggleSolution(exercise._id)}
                        className="flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium text-sm"
                      >
                        {showSolutions[exercise._id] ? (
                          <>
                            <EyeOff size={16} />
                            {t('exercises.hideSolution')}
                          </>
                        ) : (
                          <>
                            <Eye size={16} />
                            {t('exercises.showSolution')}
                          </>
                        )}
                      </button>
                      {showSolutions[exercise._id] && (
                          <div className="mt-3 bg-green-50 border border-green-200 rounded-xl p-5">
                          <div className="flex items-center gap-2 text-green-700 font-medium mb-2">
                            <CheckCircle size={16} />
                            {t('exercises.solution')}
                          </div>
                          <MarkdownRenderer content={exercise.solutionFr} className="text-sm text-green-800" disableCopy={!isAdmin} />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
