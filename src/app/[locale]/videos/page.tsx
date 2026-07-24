'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { Video, Play, Search } from 'lucide-react';

interface User {
  level: string;
  track: string;
}

interface VideoItem {
  _id: string;
  title: string;
  titleFr: string;
  description: string;
  descriptionFr: string;
  url: string;
  thumbnail: string;
  duration: number;
}

export default function VideosPage() {
  const t = useTranslations();
  const router = useRouter();
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (!stored) {
      router.push('/auth/login');
      return;
    }
    const userData = JSON.parse(stored);

    const isAdmin = userData.role === 'admin';
    const params = isAdmin ? '' : `?level=${userData.level}&track=${userData.track}`;
    fetch(`/api/videos${params}`)
      .then((r) => r.json())
      .then((data) => {
        setVideos(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [router]);

  const filteredVideos = videos.filter((video) => {
    const title = video.titleFr;
    return title.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const getYouTubeId = (url: string) => {
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?\s]+)/);
    return match ? match[1] : null;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Video size={28} className="text-red-500" />
            {t('videos.title')}
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
        ) : filteredVideos.length === 0 ? (
          <div className="text-center py-12">
            <Video size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">{t('common.noContent')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVideos.map((video) => {
              const ytId = getYouTubeId(video.url);
              return (
                <div key={video._id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all overflow-hidden group">
                  <div className="relative aspect-video bg-gray-900">
                    {ytId ? (
                      <img
                        src={`https://img.youtube.com/vi/${ytId}/mqdefault.jpg`}
                        alt={video.titleFr}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white/50">
                        <Video size={48} />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <a
                        href={video.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => {
                          const stored = localStorage.getItem('user');
                          const token = localStorage.getItem('token');
                          if (stored && token) {
                            const userData = JSON.parse(stored);
                            if (userData.role !== 'admin') {
                              fetch('/api/progress', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                                body: JSON.stringify({ userId: userData.id, contentType: 'video', contentId: video._id, action: 'viewed' }),
                              }).catch(() => {});
                            }
                          }
                        }}
                        className="bg-white/90 rounded-full p-4 hover:bg-white transition-colors"
                      >
                        <Play size={24} className="text-primary-600 ml-1" />
                      </a>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-800 group-hover:text-primary-600 transition-colors">
                      {video.titleFr}
                    </h3>
                    {video.duration > 0 && (
                      <p className="text-sm text-gray-500 mt-1">
                        {video.duration} {t('videos.minutes')}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
