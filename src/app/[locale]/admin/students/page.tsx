'use client';

import { useEffect, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter, Link } from '@/i18n/navigation';
import { ArrowLeft, Users, BookOpen, FileText, Video, ClipboardList, Eye, Trash2, X } from 'lucide-react';
import { getLevelConfig } from '@/lib/constants';

interface Student {
  _id: string;
  email: string;
  fullName: string;
  track: string;
  level: string;
  role: string;
  approved?: boolean;
  createdAt: string;
}

interface StudentProgress {
  userId: string;
  viewedLessons: number;
  totalLessons: number;
  solvedExercises: number;
  totalExercises: number;
  viewedVideos: number;
  totalVideos: number;
  completedHomework: number;
  totalHomework: number;
}

export default function AdminStudentsPage() {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const [students, setStudents] = useState<Student[]>([]);
  const [progressMap, setProgressMap] = useState<Record<string, StudentProgress>>({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLevel, setFilterLevel] = useState('');
  const [filterTrack, setFilterTrack] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<Student | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchStudents = () => {
    const token = localStorage.getItem('token');
    fetch('/api/users', { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => {
        if (r.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          router.push('/auth/login');
          throw new Error('Unauthorized');
        }
        return r.json();
      })
      .then((data) => {
        const allUsers = Array.isArray(data) ? data : [];
        setStudents(allUsers.filter((u: Student) => u.role === 'student'));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (!stored) { router.push('/auth/login'); return; }
    const userData = JSON.parse(stored);
    if (userData.role !== 'admin') { router.push('/dashboard'); return; }
    fetchStudents();
  }, [router]);

  useEffect(() => {
    if (students.length === 0) return;
    const token = localStorage.getItem('token');
    students.forEach((student) => {
      fetch(`/api/progress?userId=${student._id}`, { headers: { Authorization: `Bearer ${token}` } })
        .then((r) => r.json())
        .then((data) => {
          setProgressMap((prev) => ({ ...prev, [student._id]: data }));
        })
        .catch(() => {});
    });
  }, [students]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`/api/users/${deleteTarget._id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setStudents((prev) => prev.filter((s) => s._id !== deleteTarget._id));
        setDeleteTarget(null);
      }
    } catch {}
    setDeleting(false);
  };

  const filtered = students.filter((s) => {
    const matchSearch = s.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || s.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchLevel = !filterLevel || s.level === filterLevel;
    const matchTrack = !filterTrack || s.track === filterTrack;
    return matchSearch && matchLevel && matchTrack;
  });

  const pending = filtered.filter((s) => s.approved !== true);

  const handleApproval = async (id: string, approved: boolean) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`/api/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ approved }),
      });
      if (res.ok) {
        setStudents((prev) => prev.map((s) => (s._id === id ? { ...s, approved } : s)));
      }
    } catch {}
  };

  const getProgressPercent = (p?: StudentProgress) => {
    if (!p) return 0;
    const total = p.totalLessons + p.totalExercises + p.totalHomework + p.totalVideos;
    const done = p.viewedLessons + p.solvedExercises + p.completedHomework + p.viewedVideos;
    return total > 0 ? Math.round((done / total) * 100) : 0;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link href="/admin" className="inline-flex items-center gap-1 text-primary-600 hover:text-primary-700 mb-4 text-sm">
            <ArrowLeft size={16} /> {t('common.back')}
          </Link>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Users size={28} className="text-primary-600" />
            Suivi des élèves
          </h1>
          <p className="text-gray-500 text-sm mt-1">{filtered.length} élève(s)</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6 flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            placeholder="Rechercher un élève..."
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

        {pending.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-6">
            <h2 className="text-lg font-bold text-amber-800 flex items-center gap-2 mb-4">
              <X size={20} /> Demandes d'inscription en attente ({pending.length})
            </h2>
            <div className="space-y-3">
              {pending.map((s) => {
                const levelConfig = getLevelConfig(s.level as any);
                return (
                  <div key={s._id} className="bg-white rounded-xl border border-amber-200 p-4 flex items-center gap-4">
                    <div className="w-10 h-10 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center font-bold shrink-0">
                      {s.fullName.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-gray-800 truncate">{s.fullName}</div>
                      <div className="text-sm text-gray-500 truncate">
                        {s.email} · {levelConfig ? levelConfig.nameFr : s.level}
                      </div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={() => handleApproval(s._id, true)}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors"
                      >
                        Approuver
                      </button>
                      <button
                        onClick={() => setDeleteTarget(s)}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 transition-colors"
                      >
                        Refuser
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12 text-gray-500">{t('common.loading')}</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12">
            <Users size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">Aucun élève trouvé</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((student) => {
              const progress = progressMap[student._id];
              const percent = getProgressPercent(progress);
              const levelConfig = getLevelConfig(student.level as any);

              return (
                <div
                  key={student._id}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-all"
                >
                  <div className="flex items-center gap-4">
                    <Link href={`/admin/students/${student._id}`} className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="w-12 h-12 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center font-bold text-lg shrink-0">
                        {student.fullName.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-gray-800 truncate">{student.fullName}</h3>
                          <span className="text-xs bg-primary-50 text-primary-700 px-2 py-0.5 rounded-full">
                            {levelConfig ? levelConfig.nameFr : student.level}
                          </span>
                          {student.approved !== true && (
                            <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-semibold">
                              En attente
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 truncate">{student.email}</p>
                      </div>
                    </Link>
                    <div className="hidden md:flex items-center gap-6">
                      <div className="text-center">
                        <div className="flex items-center gap-1 text-sm text-gray-500"><BookOpen size={14} /> Leçons</div>
                        <p className="font-bold text-gray-800">{progress ? `${progress.viewedLessons}/${progress.totalLessons}` : '...'}</p>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center gap-1 text-sm text-gray-500"><FileText size={14} /> Exercices</div>
                        <p className="font-bold text-gray-800">{progress ? `${progress.solvedExercises}/${progress.totalExercises}` : '...'}</p>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center gap-1 text-sm text-gray-500"><Video size={14} /> Vidéos</div>
                        <p className="font-bold text-gray-800">{progress ? `${progress.viewedVideos}/${progress.totalVideos}` : '...'}</p>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center gap-1 text-sm text-gray-500"><ClipboardList size={14} /> Devoirs</div>
                        <p className="font-bold text-gray-800">{progress ? `${progress.completedHomework}/${progress.totalHomework}` : '...'}</p>
                      </div>
                      <div className="w-24">
                        <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                          <span>{percent}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div className={`h-2.5 rounded-full transition-all ${percent >= 70 ? 'bg-green-500' : percent >= 40 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${percent}%` }} />
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); setDeleteTarget(student); }}
                      className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors shrink-0"
                      title="Supprimer"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {deleteTarget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800">Confirmer la suppression</h3>
              <button onClick={() => setDeleteTarget(null)} className="p-1 hover:bg-gray-100 rounded-lg"><X size={20} /></button>
            </div>
            <div className="flex items-center gap-3 bg-red-50 rounded-xl p-4 mb-4">
              <Trash2 size={24} className="text-red-500 shrink-0" />
              <p className="text-sm text-red-700">
                Voulez-vous vraiment supprimer le compte de <strong>{deleteTarget.fullName}</strong> ({deleteTarget.email}) ?
                <br />Cette action est irréversible.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
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
