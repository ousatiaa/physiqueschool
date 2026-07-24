'use client';

import { useState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter, Link } from '@/i18n/navigation';
import { useParams } from 'next/navigation';
import { ArrowLeft, Save, Upload, FileText, X, Loader2 } from 'lucide-react';
import { TRACK_LEVEL_CONFIG } from '@/lib/constants';
import MarkdownEditor from '@/components/ui/MarkdownEditor';

export default function EditExercisePage() {
  const t = useTranslations();
  const router = useRouter();
  const params = useParams();
  const pdfInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [form, setForm] = useState({
    title: '', titleFr: '', description: '', descriptionFr: '',
    content: '', contentFr: '', solution: '', solutionFr: '',
    level: '', track: '', chapter: '', chapterFr: '', difficulty: 'medium',
    pdfUrl: '',
  });

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (!stored) { router.push('/auth/login'); return; }
    const userData = JSON.parse(stored);
    if (userData.role !== 'admin') { router.push('/dashboard'); return; }

    fetch(`/api/exercises/${params.id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) { setError(data.error); setLoading(false); return; }
        setForm({
          title: data.title || '', titleFr: data.titleFr || '',
          description: data.description || '', descriptionFr: data.descriptionFr || '',
          content: data.content || '', contentFr: data.contentFr || '',
          solution: data.solution || '', solutionFr: data.solutionFr || '',
          level: data.level || '', track: data.track || '',
          chapter: data.chapter || '', chapterFr: data.chapterFr || '',
          difficulty: data.difficulty || 'medium', pdfUrl: data.pdfUrl || '',
        });
        setLoading(false);
      })
      .catch(() => { setError('Erreur'); setLoading(false); });
  }, [params.id, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/exercises/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      if (!res.ok) { const data = await res.json(); throw new Error(data.error || 'Failed'); }
      router.push('/exercises');
    } catch (err: any) { setError(err.message); setSaving(false); }
  };

  const selectedTrack = TRACK_LEVEL_CONFIG.find((tr) => tr.track === form.track);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 size={32} className="animate-spin text-primary-500" /></div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link href="/admin/exercises" className="inline-flex items-center gap-1 text-primary-600 hover:text-primary-700 mb-4 text-sm">
            <ArrowLeft size={16} /> {t('common.back')}
          </Link>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Save size={24} className="text-primary-600" /> Modifier l&apos;exercice
          </h1>
        </div>
      </div>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>}

          <div className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
            <h3 className="font-bold text-gray-800 text-lg">Classement</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Filière</label>
                <select name="track" value={form.track} onChange={handleChange} className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary-500 outline-none" required>
                  <option value="">-- Choisir --</option>
                  {TRACK_LEVEL_CONFIG.map((tr) => (<option key={tr.track} value={tr.track}>{tr.trackNameFr}</option>))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Niveau</label>
                <select name="level" value={form.level} onChange={handleChange} className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary-500 outline-none" required>
                  <option value="">-- Choisir --</option>
                  {selectedTrack?.levels.map((lev) => (<option key={lev.id} value={lev.id}>{lev.code} - {lev.nameFr}</option>))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Difficulté</label>
                <select name="difficulty" value={form.difficulty} onChange={handleChange} className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary-500 outline-none">
                  <option value="easy">Facile</option>
                  <option value="medium">Moyen</option>
                  <option value="hard">Difficile</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
            <h3 className="font-bold text-gray-800 text-lg">Titre et Chapitre</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Titre</label>
                <input name="titleFr" value={form.titleFr} onChange={handleChange} className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary-500 outline-none" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Chapitre</label>
                <input name="chapterFr" value={form.chapterFr} onChange={handleChange} className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary-500 outline-none" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
            <h3 className="font-bold text-gray-800 text-lg">Contenu</h3>
            <MarkdownEditor value={form.contentFr} onChange={(val) => setForm((prev) => ({ ...prev, contentFr: val, content: val }))} rows={10} />
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
            <h3 className="font-bold text-gray-800 text-lg">Solution</h3>
            <MarkdownEditor value={form.solutionFr} onChange={(val) => setForm((prev) => ({ ...prev, solutionFr: val, solution: val }))} rows={8} />
          </div>

          <button type="submit" disabled={saving} className="w-full bg-primary-600 text-white py-3 rounded-xl font-semibold hover:bg-primary-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
            {saving ? <><Loader2 size={18} className="animate-spin" /> Enregistrement...</> : <><Save size={18} /> Enregistrer</>}
          </button>
        </form>
      </div>
    </div>
  );
}
