'use client';

import { useState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter, Link } from '@/i18n/navigation';
import { ArrowLeft, Plus, Upload, FileText, X } from 'lucide-react';
import { TRACK_LEVEL_CONFIG } from '@/lib/constants';
import MarkdownEditor from '@/components/ui/MarkdownEditor';

export default function NewHomeworkPage() {
  const t = useTranslations();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [uploadingFile, setUploadingFile] = useState(false);
  const [form, setForm] = useState({
    title: '', titleFr: '', description: '', descriptionFr: '',
    level: '', track: '', fileUrl: '', deadline: '', chapter: '', chapterFr: '',
  });

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (!stored) { router.push('/auth/login'); return; }
    const userData = JSON.parse(stored);
    if (userData.role !== 'admin') router.push('/dashboard');
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingFile(true);
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
      setForm((prev) => ({ ...prev, fileUrl: data.url }));
    } catch { setError(t('auth.error')); }
    finally { setUploadingFile(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/homework', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('Failed');
      router.push('/admin/homework');
    } catch (err: any) { setError(err.message); setLoading(false); }
  };

  const selectedTrack = TRACK_LEVEL_CONFIG.find((tr) => tr.track === form.track);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link href="/admin/homework" className="inline-flex items-center gap-1 text-primary-600 hover:text-primary-700 mb-4 text-sm">
            <ArrowLeft size={16} /> {t('common.back')}
          </Link>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Plus size={24} className="text-primary-600" />
            {t('common.homework')} - {t('common.add')}
          </h1>
        </div>
      </div>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>}

          <div className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
            <h3 className="font-bold text-gray-800 text-lg">Classement</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            <h3 className="font-bold text-gray-800 text-lg">Description du devoir</h3>
            <MarkdownEditor
              value={form.descriptionFr}
              onChange={(val) => setForm((prev) => ({ ...prev, descriptionFr: val, description: val }))}
              placeholder="# Devoir n°1&#10;&#10;## Consignes&#10;&#10;- Exercice 1 ...&#10;- Exercice 2 ..."
              rows={8}
            />
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
            <h3 className="font-bold text-gray-800 text-lg">Fichier & Date limite</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Fichier (PDF)</label>
                {form.fileUrl ? (
                  <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl p-3">
                    <FileText size={20} className="text-green-600" />
                    <a href={form.fileUrl} target="_blank" rel="noopener" className="text-green-700 font-medium hover:underline flex-1 text-sm">Voir le fichier</a>
                    <button type="button" onClick={() => setForm((prev) => ({ ...prev, fileUrl: '' }))} className="p-1 rounded-lg hover:bg-green-100"><X size={16} className="text-green-600" /></button>
                  </div>
                ) : (
                  <div>
                    <input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx" onChange={handleFileUpload} className="hidden" />
                    <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploadingFile}
                      className="flex items-center gap-2 px-5 py-2.5 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 hover:border-primary-400 hover:text-primary-600 transition-colors text-sm disabled:opacity-50">
                      <Upload size={18} />
                      {uploadingFile ? 'Chargement...' : 'Joindre un fichier'}
                    </button>
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Date limite</label>
                <input type="datetime-local" name="deadline" value={form.deadline} onChange={handleChange} className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary-500 outline-none" required />
              </div>
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full bg-primary-600 text-white py-3 rounded-xl font-semibold hover:bg-primary-700 transition-all disabled:opacity-50">
            {loading ? t('common.loading') : t('common.save')}
          </button>
        </form>
      </div>
    </div>
  );
}
