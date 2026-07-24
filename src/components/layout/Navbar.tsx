'use client';

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter, usePathname, Link } from '@/i18n/navigation';
import { TRACK_LEVEL_CONFIG, getLevelConfig, type LevelType } from '@/lib/constants';
import { BookOpen, Video, FileText, ClipboardList, Menu, X, LogOut, User } from 'lucide-react';

interface User {
  id: string;
  email: string;
  fullName: string;
  track: string;
  level: string;
  role: string;
}

export default function Navbar() {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem('user');
      }
    }
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      setUser(null);
      router.push('/auth/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const levelConfig = user ? getLevelConfig(user.level as LevelType) : null;
  const levelName = levelConfig ? levelConfig.nameFr : '';

  const navLinks = [
    { href: '/', label: t('common.dashboard'), icon: <BookOpen size={18} /> },
    { href: '/lessons', label: t('common.lessons'), icon: <BookOpen size={18} /> },
    { href: '/videos', label: t('common.videos'), icon: <Video size={18} /> },
    { href: '/exercises', label: t('common.exercises'), icon: <FileText size={18} /> },
    { href: '/homework', label: t('common.homework'), icon: <ClipboardList size={18} /> },
  ];

  return (
    <nav className="bg-primary-700 text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <div className="bg-white text-primary-700 rounded-lg p-1.5 font-bold text-lg">
              PS
            </div>
            <span className="text-xl font-bold hidden sm:block">Physique School</span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  pathname === link.href
                    ? 'bg-white/20 text-white'
                    : 'text-white/80 hover:bg-white/10 hover:text-white'
                }`}
              >
                {link.icon}
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2">
            {user ? (
              <div className="hidden md:flex items-center gap-2">
                <div className="text-right text-sm">
                  <div className="font-medium">{user.fullName}</div>
                  <div className="text-xs text-white/70">{levelName}</div>
                </div>
                <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center">
                  <User size={18} />
                </div>
                {user.role === 'admin' && (
                  <Link
                    href="/admin"
                    className="px-3 py-1.5 bg-accent-600 rounded-lg text-sm font-medium hover:bg-accent-700 transition-colors"
                  >
                    {t('common.admin')}
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                  title={t('common.logout')}
                >
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link
                  href="/auth/login"
                  className="px-4 py-2 rounded-lg text-sm font-medium hover:bg-white/10 transition-colors"
                >
                  {t('common.login')}
                </Link>
                <Link
                  href="/auth/register"
                  className="px-4 py-2 bg-white text-primary-700 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors"
                >
                  {t('common.register')}
                </Link>
              </div>
            )}

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-white/10"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="md:hidden pb-4 border-t border-white/20 mt-2 pt-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm ${
                  pathname === link.href ? 'bg-white/20' : 'hover:bg-white/10'
                }`}
              >
                {link.icon}
                {link.label}
              </Link>
            ))}
            <div className="border-t border-white/20 mt-2 pt-2">
              {user ? (
                <>
                  <div className="px-3 py-2 text-sm">
                    <div className="font-medium">{user.fullName}</div>
                    <div className="text-xs text-white/70">{levelName}</div>
                  </div>
                  {user.role === 'admin' && (
                    <Link
                      href="/admin"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm bg-accent-600 mx-3"
                    >
                      {t('common.admin')}
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm w-full hover:bg-white/10"
                  >
                    <LogOut size={18} />
                    {t('common.logout')}
                  </button>
                </>
              ) : (
                <div className="flex flex-col gap-2 px-3">
                  <Link
                    href="/auth/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-center py-2 rounded-lg text-sm border border-white/30"
                  >
                    {t('common.login')}
                  </Link>
                  <Link
                    href="/auth/register"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-center py-2 rounded-lg text-sm bg-white text-primary-700"
                  >
                    {t('common.register')}
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
