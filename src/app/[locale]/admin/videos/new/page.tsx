'use client';

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter, Link } from '@/i18n/navigation';
import { ArrowLeft, Plus } from 'lucide-react';
import { TRACK_LEVEL_CONFIG } from '@/lib/constants';

export default function NewVideoPage() {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    title: '', titleFr: '', description: '', descriptionFr: '',
    url: '', thumbnail: '', level: '', track: '', chapter: '', chapterFr: '', duration: 0,
  });

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (!stored) { router.push('/auth/login'); return; }
    const userData = JSON.parse(stored);
    if (userData.role !== 'admin') router.push('/dashboard');
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/videos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...form, chapter: form.chapterFr, duration: Number(form.duration) }),
      });
      if (!res.ok) throw new Error('Failed');
      router.push('/admin/videos');
    } catch (err: any) { setError(err.message); setLoading(false); }
  };

  const selectedTrack = TRACK_LEVEL_CONFIG.find((tr) => tr.track === form.track);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link href="/admin/videos" className="inline-flex items-center gap-1 text-primary-600 hover:text-primary-700 mb-4 text-sm">
            <ArrowLeft size={16} /> {t('common.back')}
          </Link>
          <h1 className="text-2xl font-bold text-gray-800">{t('common.videos')} - {t('common.add')}</h1>
        </div>
      </div>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm p-8 space-y-6">
          {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Track</label>
              <select name="track" value={form.track} onChange={handleChange} className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary-500 outline-none" required>
                <option value="">-- Select --</option>
                {TRACK_LEVEL_CONFIG.map((tr) => (
                  <option key={tr.track} value={tr.track}>{tr.trackNameAr} / {tr.trackNameFr}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Level</label>
              <select name="level" value={form.level} onChange={handleChange} className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary-500 outline-none" required>
                <option value="">-- Select --</option>
                {selectedTrack?.levels.map((lev) => (
                  <option key={lev.id} value={lev.id}>{lev.code} - {lev.nameAr}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Title (AR)</label>
              <input name="title" value={form.title} onChange={handleChange} className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary-500 outline-none" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Title (FR)</label>
              <input name="titleFr" value={form.titleFr} onChange={handleChange} className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary-500 outline-none" required />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Chapitre</label>
            <input name="chapterFr" value={form.chapterFr} onChange={handleChange} className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary-500 outline-none" placeholder="Ex: Chapitre 1" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Video URL (YouTube)</label>
            <input name="url" value={form.url} onChange={handleChange} className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary-500 outline-none" placeholder="https://youtube.com/watch?v=..." required />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Description (AR)</label>
              <textarea name="description" value={form.description} onChange={handleChange} rows={3} className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Description (FR)</label>
              <textarea name="descriptionFr" value={form.descriptionFr} onChange={handleChange} rows={3} className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary-500 outline-none" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Duration (minutes)</label>
            <input type="number" name="duration" value={form.duration} onChange={handleChange} className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary-500 outline-none" min="0" />
          </div>

          <button type="submit" disabled={loading} className="w-full bg-primary-600 text-white py-3 rounded-xl font-semibold hover:bg-primary-700 transition-all disabled:opacity-50">
            {loading ? t('common.loading') : t('common.save')}
          </button>
        </form>
      </div>
    </div>
  );
}
