'use client';

import { useState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter, Link } from '@/i18n/navigation';
import { useParams } from 'next/navigation';
import { ArrowLeft, Save, Upload, FileText, X, Loader2 } from 'lucide-react';
import { TRACK_LEVEL_CONFIG } from '@/lib/constants';
import MarkdownEditor from '@/components/ui/MarkdownEditor';

export default function EditLessonPage() {
  const t = useTranslations();
  const router = useRouter();
  const params = useParams();
  const pdfInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [form, setForm] = useState({
    title: '', titleFr: '', chapter: '', chapterFr: '',
    chapterNumber: 1, content: '', contentFr: '',
    level: '', track: '', duration: 0, order: 0, pdfUrl: '',
  });

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (!stored) { router.push('/auth/login'); return; }
    const userData = JSON.parse(stored);
    if (userData.role !== 'admin') { router.push('/dashboard'); return; }

    fetch(`/api/lessons/${params.id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) { setError(data.error); setLoading(false); return; }
        setForm({
          title: data.title || '',
          titleFr: data.titleFr || '',
          chapter: data.chapter || '',
          chapterFr: data.chapterFr || '',
          chapterNumber: data.chapterNumber || 1,
          content: data.content || '',
          contentFr: data.contentFr || '',
          level: data.level || '',
          track: data.track || '',
          duration: data.duration || 0,
          order: data.order || 0,
          pdfUrl: data.pdfUrl || '',
        });
        setLoading(false);
      })
      .catch(() => { setError('Erreur de chargement'); setLoading(false); });
  }, [params.id, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingPdf(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const token = localStorage.getItem('token');
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      setForm((prev) => ({ ...prev, pdfUrl: data.url }));
    } catch { setError(t('auth.error')); }
    finally { setUploadingPdf(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/lessons/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          ...form,
          chapterNumber: Number(form.chapterNumber),
          duration: Number(form.duration),
          order: Number(form.order),
        }),
      });
      if (!res.ok) { const data = await res.json(); throw new Error(data.error || 'Failed'); }
      router.push(`/lessons/${params.id}`);
    } catch (err: any) { setError(err.message); setSaving(false); }
  };

  const selectedTrack = TRACK_LEVEL_CONFIG.find((tr) => tr.track === form.track);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-primary-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link href={`/lessons/${params.id}`} className="inline-flex items-center gap-1 text-primary-600 hover:text-primary-700 mb-4 text-sm">
            <ArrowLeft size={16} />
            {t('common.back')}
          </Link>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Save size={24} className="text-primary-600" />
            Modifier le cours
          </h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>
          )}

          <div className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
            <h3 className="font-bold text-gray-800 text-lg">Classement</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Filière</label>
                <select name="track" value={form.track} onChange={handleChange} className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary-500 outline-none" required>
                  <option value="">-- Choisir --</option>
                  {TRACK_LEVEL_CONFIG.map((tr) => (
                    <option key={tr.track} value={tr.track}>{tr.trackNameFr}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Niveau</label>
                <select name="level" value={form.level} onChange={handleChange} className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary-500 outline-none" required>
                  <option value="">-- Choisir --</option>
                  {selectedTrack?.levels.map((lev) => (
                    <option key={lev.id} value={lev.id}>{lev.code} - {lev.nameFr}</option>
                  ))}
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
                <input name="chapterFr" value={form.chapterFr} onChange={handleChange} className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary-500 outline-none" required />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">N° Chapitre</label>
                <input type="number" name="chapterNumber" value={form.chapterNumber} onChange={handleChange} className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary-500 outline-none" min="1" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Durée (min)</label>
                <input type="number" name="duration" value={form.duration} onChange={handleChange} className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary-500 outline-none" min="0" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Ordre</label>
                <input type="number" name="order" value={form.order} onChange={handleChange} className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary-500 outline-none" min="0" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
            <h3 className="font-bold text-gray-800 text-lg">Contenu du cours (Markdown)</h3>
            <MarkdownEditor
              value={form.contentFr}
              onChange={(val) => setForm((prev) => ({ ...prev, contentFr: val, content: val }))}
              placeholder="# Titre de la leçon..."
              rows={15}
            />
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
            <h3 className="font-bold text-gray-800 text-lg">PDF (Optionnel)</h3>
            {form.pdfUrl ? (
              <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl p-4">
                <FileText size={24} className="text-green-600" />
                <div className="flex-1">
                  <a href={form.pdfUrl} target="_blank" rel="noopener" className="text-green-700 font-medium hover:underline">
                    Voir le PDF actuel
                  </a>
                </div>
                <button type="button" onClick={() => setForm((prev) => ({ ...prev, pdfUrl: '' }))} className="p-1 rounded-lg hover:bg-green-100">
                  <X size={18} className="text-green-600" />
                </button>
              </div>
            ) : null}
            <div>
              <input ref={pdfInputRef} type="file" accept=".pdf" onChange={handlePdfUpload} className="hidden" />
              <button
                type="button"
                onClick={() => pdfInputRef.current?.click()}
                disabled={uploadingPdf}
                className="flex items-center gap-2 px-6 py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 hover:border-primary-400 hover:text-primary-600 transition-colors disabled:opacity-50"
              >
                <Upload size={20} />
                {uploadingPdf ? 'Chargement...' : form.pdfUrl ? 'Remplacer le PDF' : 'Choisir un fichier PDF'}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-primary-600 text-white py-3 rounded-xl font-semibold hover:bg-primary-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {saving ? <><Loader2 size={18} className="animate-spin" /> Enregistrement...</> : <><Save size={18} /> Enregistrer les modifications</>}
          </button>
        </form>
      </div>
    </div>
  );
}
