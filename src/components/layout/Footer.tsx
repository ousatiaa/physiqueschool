'use client';

import { useTranslations } from 'next-intl';
import { Atom } from 'lucide-react';

export default function Footer() {
  const t = useTranslations();

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-primary-600 text-white rounded-lg p-2">
                <Atom size={24} />
              </div>
              <h3 className="text-xl font-bold">Physique School</h3>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              {t('auth.selectLevelTitle')}
            </p>
          </div>

          <div>
            <h4 className="font-bold mb-4 text-lg">{t('common.lessons')}</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li><a href="/lessons" className="hover:text-white transition-colors">{t('common.lessons')}</a></li>
              <li><a href="/videos" className="hover:text-white transition-colors">{t('common.videos')}</a></li>
              <li><a href="/exercises" className="hover:text-white transition-colors">{t('common.exercises')}</a></li>
              <li><a href="/homework" className="hover:text-white transition-colors">{t('common.homework')}</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4 text-lg">{t('common.settings')}</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li>Français</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-500 text-sm">
          &copy; 2024 Physique School. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
