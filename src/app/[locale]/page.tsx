'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { useEffect, useState } from 'react';
import { TRACK_LEVEL_CONFIG, type LevelType } from '@/lib/constants';
import { ArrowRight, BookOpen, Video, FileText, ClipboardList, GraduationCap, Atom } from 'lucide-react';

export default function HomePage() {
  const t = useTranslations();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setIsLoggedIn(Boolean(localStorage.getItem('token')));
  }, []);

  const features = [
    {
      icon: <BookOpen size={40} />,
      title: t('common.lessons'),
      desc: 'Leçons détaillées et organisées par chapitres',
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      emoji: '📚',
      image: (
        <svg viewBox="0 0 200 150" className="w-full h-32">
          <rect x="30" y="20" width="140" height="110" rx="8" fill="#3B82F6" opacity="0.1"/>
          <rect x="45" y="35" width="110" height="15" rx="4" fill="#3B82F6" opacity="0.3"/>
          <rect x="45" y="55" width="90" height="8" rx="3" fill="#93C5FD"/>
          <rect x="45" y="68" width="100" height="8" rx="3" fill="#93C5FD"/>
          <rect x="45" y="81" width="70" height="8" rx="3" fill="#93C5FD"/>
          <rect x="45" y="100" width="110" height="20" rx="6" fill="#3B82F6"/>
          <text x="100" y="115" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">Commencer</text>
        </svg>
      )
    },
    {
      icon: <Video size={40} />,
      title: t('common.videos'),
      desc: 'Vidéos éducatives claires et simplifiées',
      color: 'from-red-500 to-red-600',
      bgColor: 'bg-red-50',
      emoji: '🎬',
      image: (
        <svg viewBox="0 0 200 150" className="w-full h-32">
          <rect x="20" y="15" width="160" height="100" rx="8" fill="#EF4444" opacity="0.1"/>
          <rect x="35" y="30" width="130" height="70" rx="6" fill="#FCA5A5" opacity="0.5"/>
          <circle cx="100" cy="65" r="25" fill="#EF4444"/>
          <polygon points="92,55 92,75 112,65" fill="white"/>
          <rect x="35" y="110" width="60" height="8" rx="3" fill="#FECACA"/>
          <rect x="105" y="110" width="60" height="8" rx="3" fill="#FECACA"/>
        </svg>
      )
    },
    {
      icon: <FileText size={40} />,
      title: t('common.exercises'),
      desc: 'Exercices variés avec des solutions détaillées',
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      emoji: '✏️',
      image: (
        <svg viewBox="0 0 200 150" className="w-full h-32">
          <rect x="30" y="15" width="140" height="120" rx="8" fill="#22C55E" opacity="0.1"/>
          <rect x="45" y="30" width="110" height="12" rx="4" fill="#86EFAC"/>
          <rect x="45" y="48" width="80" height="8" rx="3" fill="#BBF7D0"/>
          <rect x="45" y="62" width="100" height="8" rx="3" fill="#BBF7D0"/>
          <rect x="45" y="76" width="60" height="8" rx="3" fill="#BBF7D0"/>
          <circle cx="55" cy="100" r="8" fill="#22C55E"/>
          <text x="70" y="104" fill="#166534" fontSize="11" fontWeight="bold">✓ Solution</text>
          <rect x="45" y="115" width="110" height="12" rx="4" fill="#22C55E"/>
          <text x="100" y="125" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">Voir solutions</text>
        </svg>
      )
    },
    {
      icon: <ClipboardList size={40} />,
      title: t('common.homework'),
      desc: 'Devoirs pour s\'entraîner et réviser',
      color: 'from-amber-500 to-amber-600',
      bgColor: 'bg-amber-50',
      emoji: '📝',
      image: (
        <svg viewBox="0 0 200 150" className="w-full h-32">
          <rect x="35" y="10" width="130" height="130" rx="8" fill="#F59E0B" opacity="0.1"/>
          <rect x="50" y="25" width="100" height="15" rx="4" fill="#FCD34D"/>
          <rect x="50" y="45" width="100" height="30" rx="4" fill="#FEF3C7"/>
          <rect x="55" y="50" width="70" height="6" rx="2" fill="#F59E0B" opacity="0.5"/>
          <rect x="55" y="60" width="50" height="6" rx="2" fill="#F59E0B" opacity="0.5"/>
          <rect x="50" y="80" width="100" height="30" rx="4" fill="#FEF3C7"/>
          <rect x="55" y="85" width="80" height="6" rx="2" fill="#F59E0B" opacity="0.5"/>
          <rect x="55" y="95" width="60" height="6" rx="2" fill="#F59E0B" opacity="0.5"/>
          <rect x="50" y="115" width="100" height="15" rx="6" fill="#F59E0B"/>
          <text x="100" y="126" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">Télécharger</text>
        </svg>
      )
    },
  ];

  const trackExplorer = TRACK_LEVEL_CONFIG.map((tr) => ({
    track: tr.track,
    trackNameFr: tr.trackNameFr,
    levels: tr.levels.map((lev) => ({
      id: lev.id as LevelType,
      code: lev.code,
      nameFr: lev.nameFr,
    })),
  }));

  return (
    <div className="min-h-screen">
      <section className="bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-2xl px-6 py-3 mb-8">
              <Atom size={36} className="text-white" />
              <h1 className="text-3xl md:text-4xl font-bold">Physique School</h1>
            </div>
            <h2 className="text-xl md:text-2xl text-white/90 mb-4">
              Plateforme éducative complète pour la Physique
            </h2>
            <p className="text-white/70 text-lg mb-8">
              Leçons, vidéos, exercices et devoirs pour le Collège et le Lycée - option française
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/auth/register"
                className="bg-white text-primary-700 px-8 py-3.5 rounded-xl font-bold hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
              >
                {t('common.register')}
                <ArrowRight size={18} />
              </Link>
              <Link
                href="/auth/login"
                className="border-2 border-white/30 px-8 py-3.5 rounded-xl font-bold hover:bg-white/10 transition-colors"
              >
                {t('common.login')}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Niveaux disponibles
            </h2>
            <p className="text-gray-500 text-lg">
              Choisissez votre niveau et commencez à apprendre
            </p>
          </div>
          <div className="space-y-8 max-w-4xl mx-auto">
            {trackExplorer.map((tr) => (
              <div key={tr.track}>
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <GraduationCap size={20} className="text-primary-600" />
                  {tr.trackNameFr}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {tr.levels.map((lev) => (
                    <div key={lev.id} className="bg-gray-50 rounded-2xl p-6 text-center border border-gray-200 hover:border-primary-300 hover:shadow-md transition-all">
                      <h3 className="text-lg font-bold text-gray-800 mb-2">
                        {lev.nameFr}
                      </h3>
                      <Link
                        href={isLoggedIn ? `/levels/${lev.id}` : '/auth/register'}
                        className="inline-block mt-3 bg-primary-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-primary-700 transition-colors"
                      >
                        {t('common.open')}
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block bg-primary-100 text-primary-700 text-sm font-bold px-4 py-2 rounded-full mb-4">
              Nos services
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Ce que nous vous offrons
            </h2>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto">
              Nous vous offrons un ensemble complet de ressources éducatives pour vous aider à exceller
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all border border-gray-100 group">
                <div className={`${feature.bgColor} p-6 flex items-center justify-center`}>
                  {feature.image}
                </div>
                <div className="p-6 text-center">
                  <h3 className="text-xl font-bold text-gray-800 mb-3 group-hover:text-primary-600 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-gray-500 text-sm leading-relaxed">
                    {feature.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-gradient-to-r from-primary-600 to-primary-800 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Commencez votre parcours éducatif maintenant!
          </h2>
          <p className="text-white/80 text-lg mb-8">
            Inscrivez-vous gratuitement et obtenez un accès complet à toutes les leçons, vidéos et exercices
          </p>
          <Link
            href="/auth/register"
            className="bg-white text-primary-700 px-10 py-4 rounded-xl font-bold text-lg hover:bg-gray-100 transition-colors inline-flex items-center gap-2"
          >
            {t('common.register')}
            <ArrowRight size={20} />
          </Link>
        </div>
      </section>
    </div>
  );
}
