'use client';

import { useEffect, useState } from 'react';
import { useRouter } from '@/i18n/navigation';
import LevelExplorer from '@/components/dashboard/LevelExplorer';
import { TRACK_LEVEL_CONFIG } from '@/lib/constants';

interface User {
  id: string;
  email: string;
  fullName: string;
  track: string;
  level: string;
  role: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<string>('');
  const [selectedTrack, setSelectedTrack] = useState<string>('');

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (!stored) {
      router.push('/auth/login');
      return;
    }
    try {
      const parsed = JSON.parse(stored);
      setUser(parsed);
      const savedLevel = localStorage.getItem('adminLevel');
      const savedTrack = localStorage.getItem('adminTrack');
      setSelectedLevel(savedLevel || parsed.level);
      setSelectedTrack(savedTrack || parsed.track);
    } catch {
      localStorage.removeItem('user');
      router.push('/auth/login');
    }
  }, [router]);

  if (!user) return null;

  const isAdmin = user.role === 'admin';

  const handleLevelChange = (track: string, level: string) => {
    setSelectedTrack(track);
    setSelectedLevel(level);
    localStorage.setItem('adminLevel', level);
    localStorage.setItem('adminTrack', track);
  };

  return (
    <>
      {isAdmin && (
        <div className="bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-3">
              Aperçu admin — niveau affiché
            </p>
            <div className="space-y-3">
              {TRACK_LEVEL_CONFIG.map((tr) => {
                const active = selectedTrack === tr.track;
                return (
                  <div key={tr.track} className={`rounded-xl border p-3 ${active ? 'border-primary-400 bg-primary-50' : 'border-gray-200'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <button
                        onClick={() => handleLevelChange(tr.track, tr.levels[0].id)}
                        className={`text-sm font-bold ${active ? 'text-primary-700' : 'text-gray-600'}`}
                      >
                        {tr.trackNameFr}
                      </button>
                      <div className="flex flex-wrap gap-2">
                        {tr.levels.map((lev) => {
                          const levelActive = selectedLevel === lev.id;
                          return (
                            <button
                              key={lev.id}
                              onClick={() => handleLevelChange(tr.track, lev.id)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                                levelActive
                                  ? 'bg-primary-600 text-white border-primary-600'
                                  : 'bg-white text-gray-600 border-gray-200 hover:border-primary-400 hover:text-primary-600'
                              }`}
                            >
                              {lev.code}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <LevelExplorer
        level={selectedLevel || user.level}
        track={selectedTrack || user.track}
        isAdmin={isAdmin}
        userId={isAdmin ? null : user.id}
      />
    </>
  );
}