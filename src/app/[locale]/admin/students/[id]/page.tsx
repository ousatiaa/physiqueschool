'use client';

import { useEffect, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Users, BookOpen, FileText, Video, ClipboardList, Clock, CheckCircle, Trash2, X, Lock } from 'lucide-react';
import { getLevelConfig } from '@/lib/constants';

interface Student {
  _id: string;
  email: string;
  fullName: string;
  track: string;
  level: string;
  role: string;
  createdAt: string;
}

interface ProgressData {
  viewedLessons: number;
  totalLessons: number;
  solvedExercises: number;
  totalExercises: number;
  viewedVideos: number;
  totalVideos: number;
  completedHomework: number;
  totalHomework: number;
  recentActivity: any[];
}

export default function StudentDetailPage() {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const params = useParams();
  const [student, setStudent] = useState<Student | null>(null);
  const [progress, setProgress] = useState<ProgressData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [resetMsg, setResetMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (!stored) { router.push('/auth/login'); return; }
    const userData = JSON.parse(stored);
    if (userData.role !== 'admin') { router.push('/dashboard'); return; }

    const token = localStorage.getItem('token');
    Promise.all([
      fetch(`/api/users/${params.id}`, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
      fetch(`/api/progress?userId=${params.id}`, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
    ]).then(([studentData, progressData]) => {
      setStudent(studentData);
      setProgress(progressData);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [params.id, router]);

  if (loading) return <div className="min-h-screen flex items-center justify-center">{t('common.loading')}</div>;
  if (!student) return <div className="min-h-screen flex items-center justify-center text-gray-500">Élève non trouvé</div>;

  const handleDelete = async () => {
    setDeleting(true);
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`/api/users/${student._id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        router.push('/admin/students');
      }
    } catch {}
    setDeleting(false);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetMsg(null);
    setResetting(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: student.email, newPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        setResetMsg({ type: 'success', text: 'Mot de passe réinitialisé avec succès' });
        setNewPassword('');
      } else {
        setResetMsg({ type: 'error', text: data.error || 'Une erreur est survenue' });
      }
    } catch {
      setResetMsg({ type: 'error', text: 'Une erreur est survenue' });
    }
    setResetting(false);
  };

  const levelConfig = getLevelConfig(student.level as any);
  const totalItems = (progress?.totalLessons || 0) + (progress?.totalExercises || 0) + (progress?.totalHomework || 0) + (progress?.totalVideos || 0);
  const doneItems = (progress?.viewedLessons || 0) + (progress?.solvedExercises || 0) + (progress?.completedHomework || 0) + (progress?.viewedVideos || 0);
  const percent = totalItems > 0 ? Math.round((doneItems / totalItems) * 100) : 0;

  const statCards = [
    { label: 'Leçons vues', done: progress?.viewedLessons || 0, total: progress?.totalLessons || 0, icon: <BookOpen size={24} />, color: 'bg-blue-500' },
    { label: 'Exercices résolus', done: progress?.solvedExercises || 0, total: progress?.totalExercises || 0, icon: <FileText size={24} />, color: 'bg-green-500' },
    { label: 'Vidéos vues', done: progress?.viewedVideos || 0, total: progress?.totalVideos || 0, icon: <Video size={24} />, color: 'bg-red-500' },
    { label: 'Devoirs rendus', done: progress?.completedHomework || 0, total: progress?.totalHomework || 0, icon: <ClipboardList size={24} />, color: 'bg-yellow-500' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link href="/admin/students" className="inline-flex items-center gap-1 text-white/70 hover:text-white mb-4 text-sm">
            <ArrowLeft size={16} /> Retour à la liste
          </Link>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-2xl font-bold shrink-0">
              {student.fullName.charAt(0)}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold">{student.fullName}</h1>
              <p className="text-white/70">{student.email}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">{levelConfig ? levelConfig.nameFr : student.level}</span>
                <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">{student.track === 'idadi' ? 'Collège' : 'Lycée'}</span>
              </div>
            </div>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="bg-red-500/80 hover:bg-red-500 text-white px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-medium transition-colors shrink-0"
            >
              <Trash2 size={16} />
              Supprimer
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 pb-12">
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-gray-800">Progression globale</h2>
            <span className="text-2xl font-bold text-primary-600">{percent}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4">
            <div className={`h-4 rounded-full transition-all ${percent >= 70 ? 'bg-green-500' : percent >= 40 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${percent}%` }} />
          </div>
          <p className="text-sm text-gray-500 mt-2">{doneItems} / {totalItems} activités complétées</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {statCards.map((card) => (
            <div key={card.label} className="bg-white rounded-xl shadow-sm p-5">
              <div className={`inline-flex p-2 rounded-lg ${card.color} text-white mb-3`}>{card.icon}</div>
              <h3 className="text-sm text-gray-500">{card.label}</h3>
              <p className="text-xl font-bold text-gray-800">{card.done}/{card.total}</p>
              <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                <div className={`h-1.5 rounded-full ${card.color}`} style={{ width: `${card.total > 0 ? (card.done / card.total) * 100 : 0}%` }} />
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Clock size={20} />
            Activité récente
          </h2>
          {progress?.recentActivity && progress.recentActivity.length > 0 ? (
            <div className="space-y-3">
              {progress.recentActivity.map((activity: any, i: number) => (
                <div key={i} className="flex items-center gap-3 py-2 border-b last:border-0">
                  <CheckCircle size={16} className="text-green-500" />
                  <div className="flex-1">
                    <span className="text-sm text-gray-700">
                      {activity.contentType === 'lesson' && 'Leçon consultée'}
                      {activity.contentType === 'exercise' && 'Exercice résolu'}
                      {activity.contentType === 'video' && 'Vidéo regardée'}
                      {activity.contentType === 'homework' && 'Devoir complété'}
                    </span>
                  </div>
                  <span className="text-xs text-gray-400">
                    {new Date(activity.completedAt).toLocaleDateString('fr-FR')} {new Date(activity.completedAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-center py-6">Aucune activité récente</p>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6 mt-6">
          <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Lock size={20} />
            Réinitialiser le mot de passe
          </h2>
          <form onSubmit={handleResetPassword} className="flex flex-col sm:flex-row gap-3 items-start sm:items-end">
            <div className="flex-1 w-full">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Nouveau mot de passe
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                placeholder="••••••••"
                minLength={6}
                required
              />
            </div>
            <button
              type="submit"
              disabled={resetting}
              className="px-5 py-2.5 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50 shrink-0"
            >
              {resetting ? t('common.loading') : 'Réinitialiser'}
            </button>
          </form>
          {resetMsg && (
            <div className={`mt-3 px-4 py-3 rounded-lg text-sm ${resetMsg.type === 'success' ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-700'}`}>
              {resetMsg.text}
            </div>
          )}
        </div>
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800">Confirmer la suppression</h3>
              <button onClick={() => setShowDeleteConfirm(false)} className="p-1 hover:bg-gray-100 rounded-lg"><X size={20} /></button>
            </div>
            <div className="flex items-center gap-3 bg-red-50 rounded-xl p-4 mb-4">
              <Trash2 size={24} className="text-red-500 shrink-0" />
              <p className="text-sm text-red-700">
                Voulez-vous vraiment supprimer le compte de <strong>{student.fullName}</strong> ({student.email}) ?
                <br />Cette action est irréversible.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-2.5 border border-gray-300 rounded-xl font-medium hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 py-2.5 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {deleting ? 'Suppression...' : 'Supprimer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
