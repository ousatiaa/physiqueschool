'use client';

import { useEffect, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter, Link } from '@/i18n/navigation';
import { Shield, BookOpen, Video, FileText, ClipboardList, Users, Plus } from 'lucide-react';

export default function AdminPage() {
  const t = useTranslations();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (!stored) {
      router.push('/auth/login');
      return;
    }
    const userData = JSON.parse(stored);
    if (userData.role !== 'admin') {
      router.push('/dashboard');
      return;
    }
    setUser(userData);
  }, [router]);

  if (!user) return null;

  const sections = [
    { title: t('common.lessons'), icon: <BookOpen size={28} />, color: 'from-blue-500 to-blue-600', href: '/admin/lessons', addHref: '/admin/lessons/new' },
    { title: t('common.videos'), icon: <Video size={28} />, color: 'from-red-500 to-red-600', href: '/admin/videos', addHref: '/admin/videos/new' },
    { title: t('common.exercises'), icon: <FileText size={28} />, color: 'from-green-500 to-green-600', href: '/admin/exercises', addHref: '/admin/exercises/new' },
    { title: t('common.homework'), icon: <ClipboardList size={28} />, color: 'from-yellow-500 to-yellow-600', href: '/admin/homework', addHref: '/admin/homework/new' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex items-center gap-3">
            <Shield size={32} />
            <h1 className="text-3xl font-bold">{t('common.admin')}</h1>
          </div>
          <p className="text-white/70 mt-2">Manage all content for Physique School</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sections.map((section) => (
            <div key={section.href} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className={`bg-gradient-to-r ${section.color} p-6 flex items-center gap-3 text-white`}>
                {section.icon}
                <h2 className="text-xl font-bold">{section.title}</h2>
              </div>
              <div className="p-5 flex gap-3">
                <Link
                  href={section.href}
                  className="flex-1 text-center py-3 border border-gray-300 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                >
                  {t('common.edit')}
                </Link>
                <Link
                  href={section.addHref}
                  className="flex-1 text-center py-3 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Plus size={18} />
                  {t('common.add')}
                </Link>
              </div>
            </div>
          ))}
        </div>

        <Link href="/admin/students" className="mt-6 block bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all">
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-6 flex items-center gap-3 text-white">
            <Users size={28} />
            <h2 className="text-xl font-bold">Suivi des élèves</h2>
          </div>
          <div className="p-5">
            <p className="text-gray-500 text-sm">Consulter la progression de chaque élève, leçons vues, exercices résolus, devoirs rendus.</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
