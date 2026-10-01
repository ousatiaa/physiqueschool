'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter, Link } from '@/i18n/navigation';
import { ArrowLeft, Clock, BookOpen, FileText, Edit, Trash2 } from 'lucide-react';
import MarkdownRenderer from '@/components/ui/MarkdownRenderer';

interface Lesson {
  _id: string;
  title: string;
  titleFr: string;
  chapter: string;
  chapterFr: string;
  chapterNumber: number;
  content: string;
  contentFr: string;
  duration: number;
  pdfUrl?: string;
}

export default function LessonDetailPage({ params }: { params: { id: string } }) {
  const t = useTranslations();
  const router = useRouter();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userId, setUserId] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (!stored) {
      router.push('/auth/login');
      return;
    }
    const userData = JSON.parse(stored);
    setIsAdmin(userData.role === 'admin');
    setUserId(userData.id);

    fetch(`/api/lessons/${params.id}`)
      .then((r) => r.json())
      .then((data) => {
        setLesson(data);
        setLoading(false);
        if (userData.role !== 'admin') {
          fetch('/api/progress', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
            body: JSON.stringify({ userId: userData.id, contentType: 'lesson', contentId: params.id, action: 'viewed' }),
          }).catch(() => {});
        }
      })
      .catch(() => setLoading(false));
  }, [params.id, router]);

  if (loading) return <div className="min-h-screen flex items-center justify-center">{t('common.loading')}</div>;
  if (!lesson) return <div className="min-h-screen flex items-center justify-center text-gray-500">{t('common.noContent')}</div>;

  const goBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
    } else {
      router.push('/lessons');
    }
  };

  const content = lesson.contentFr;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <button onClick={goBack} className="inline-flex items-center gap-1 text-primary-600 hover:text-primary-700 mb-4 text-sm">
            <ArrowLeft size={16} />
            {t('common.back')}
          </button>
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            <BookOpen size={16} />
            <span>{t('lessons.chapter')} {lesson.chapterNumber}: {lesson.chapterFr}</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">
            {lesson.titleFr}
          </h1>
          <div className="flex items-center gap-4 mt-2">
            {lesson.duration > 0 && (
              <div className="flex items-center gap-1 text-sm text-gray-500">
                <Clock size={14} />
                {lesson.duration} {t('lessons.minutes')}
              </div>
            )}
            {lesson.pdfUrl && (
              <a
                href={lesson.pdfUrl}
                target="_blank"
                rel="noopener"
                className="flex items-center gap-1 text-sm text-red-600 hover:text-red-700 font-medium"
              >
                <FileText size={14} />
                Télécharger PDF
              </a>
            )}
            {isAdmin && (
              <div className="flex items-center gap-2">
                <Link
                  href={`/admin/lessons/${params.id}/edit`}
                  className="flex items-center gap-1 text-sm bg-primary-50 text-primary-700 hover:bg-primary-100 px-3 py-1.5 rounded-lg font-medium transition-colors"
                >
                  <Edit size={14} />
                  Modifier
                </Link>
                <button
                  onClick={async () => {
                    if (!confirm('Supprimer ce cours ?')) return;
                    const token = localStorage.getItem('token');
                    await fetch(`/api/lessons/${params.id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
                    router.push('/lessons');
                  }}
                  className="flex items-center gap-1 text-sm bg-red-50 text-red-700 hover:bg-red-100 px-3 py-1.5 rounded-lg font-medium transition-colors"
                >
                  <Trash2 size={14} />
                  Supprimer
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-sm p-8">
          {content ? (
            <MarkdownRenderer content={content} disableCopy={!isAdmin} />
          ) : (
            <p className="text-gray-400 italic">Aucun contenu disponible</p>
          )}
        </div>
      </div>
    </div>
  );
}
