'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter, Link } from '@/i18n/navigation';
import { ArrowLeft, Plus, Trash2, Edit, Eye, EyeOff } from 'lucide-react';

export default function AdminLessonsPage() {
  const t = useTranslations();
  const router = useRouter();
  const [lessons, setLessons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTrack, setFilterTrack] = useState('');
  const [filterLevel, setFilterLevel] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (!stored) { router.push('/auth/login'); return; }
    const userData = JSON.parse(stored);
    if (userData.role !== 'admin') { router.push('/dashboard'); return; }

    fetch('/api/lessons')
      .then((r) => r.json())
      .then((data) => { setLessons(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [router]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure?')) return;
    const token = localStorage.getItem('token');
    await fetch(`/api/lessons/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    setLessons(lessons.filter((l) => l._id !== id));
  };

  const togglePublish = async (id: string, current: boolean) => {
    const token = localStorage.getItem('token');
    await fetch(`/api/lessons/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ published: !current }),
    });
    setLessons(lessons.map((l) => l._id === id ? { ...l, published: !current } : l));
  };

  const filtered = lessons.filter((lesson) => {
    const matchSearch = !searchTerm || (lesson.titleFr && lesson.titleFr.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchTrack = !filterTrack || lesson.track === filterTrack;
    const matchLevel = !filterLevel || lesson.level === filterLevel;
    return matchSearch && matchTrack && matchLevel;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link href="/admin" className="inline-flex items-center gap-1 text-primary-600 hover:text-primary-700 mb-4 text-sm">
            <ArrowLeft size={16} />
            {t('common.back')}
          </Link>
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-800">{t('common.lessons')}</h1>
            <Link href="/admin/lessons/new" className="bg-primary-600 text-white px-4 py-2 rounded-xl font-medium hover:bg-primary-700 transition-colors flex items-center gap-2">
              <Plus size={18} />
              {t('common.add')}
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6 flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            placeholder="Rechercher une leçon..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary-500 outline-none"
          />
          <select value={filterTrack} onChange={(e) => setFilterTrack(e.target.value)} className="border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary-500 outline-none">
            <option value="">Toutes les filières</option>
            <option value="idadi">Collège</option>
            <option value="tawahili">Lycée</option>
          </select>
          <select value={filterLevel} onChange={(e) => setFilterLevel(e.target.value)} className="border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary-500 outline-none">
            <option value="">Tous les niveaux</option>
            <option value="1ac">1AC</option>
            <option value="2ac">2AC</option>
            <option value="3ac">3AC</option>
            <option value="tcsf">TCSF</option>
            <option value="1bacsef">1BAC SEF</option>
            <option value="1bacsmf">1BAC SMF</option>
            <option value="2bacspf">2BAC SPF</option>
            <option value="2bacsvtf">2BAC SVTF</option>
            <option value="2bacsmf">2BAC SMF</option>
          </select>
        </div>
        {loading ? (
          <div className="text-center py-12 text-gray-500">{t('common.loading')}</div>
        ) : lessons.length === 0 ? (
          <div className="text-center py-12 text-gray-500">{t('common.noContent')}</div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-start px-6 py-3 text-sm font-medium text-gray-500">Title</th>
                  <th className="text-start px-6 py-3 text-sm font-medium text-gray-500">Chapter</th>
                  <th className="text-start px-6 py-3 text-sm font-medium text-gray-500">Level</th>
                  <th className="text-start px-6 py-3 text-sm font-medium text-gray-500">Status</th>
                  <th className="text-end px-6 py-3 text-sm font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.map((lesson) => (
                  <tr key={lesson._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm">{lesson.titleFr}</td>
                    <td className="px-6 py-4 text-sm">{lesson.chapterFr}</td>
                    <td className="px-6 py-4 text-sm">{lesson.level}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${lesson.published !== false ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {lesson.published !== false ? <><Eye size={12} /> Publié</> : <><EyeOff size={12} /> Brouillon</>}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-end">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => togglePublish(lesson._id, lesson.published !== false)}
                          className={`p-1 rounded transition-colors ${lesson.published !== false ? 'text-green-500 hover:text-green-700' : 'text-gray-400 hover:text-gray-600'}`}
                          title={lesson.published !== false ? 'Dépublier' : 'Publier'}
                        >
                          {lesson.published !== false ? <Eye size={16} /> : <EyeOff size={16} />}
                        </button>
                        <Link href={`/admin/lessons/${lesson._id}/edit`} className="text-primary-500 hover:text-primary-700 p-1" title="Modifier">
                          <Edit size={16} />
                        </Link>
                        <button onClick={() => handleDelete(lesson._id)} className="text-red-500 hover:text-red-700 p-1" title="Supprimer">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
