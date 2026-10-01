'use client';

import { useState, useEffect, useRef } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter, usePathname, Link } from '@/i18n/navigation';
import { TRACK_LEVEL_CONFIG, getLevelConfig, type LevelType } from '@/lib/constants';
import { BookOpen, Video, FileText, ClipboardList, Menu, X, LogOut, User, ChevronDown } from 'lucide-react';

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
  const [isLevelMenuOpen, setIsLevelMenuOpen] = useState(false);
  const levelMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem('user');
      }
    }
  }, [pathname]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (levelMenuRef.current && !levelMenuRef.current.contains(e.target as Node)) {
        setIsLevelMenuOpen(false);
      }
    };
    if (isLevelMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isLevelMenuOpen]);

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
                  {user.role === 'admin' ? (
                    <div className="relative" ref={levelMenuRef}>
                      <button
                        onClick={() => setIsLevelMenuOpen(!isLevelMenuOpen)}
                        className="inline-flex items-center gap-1 text-xs text-white/70 hover:text-white transition-colors"
                      >
                        {levelName}
                        <ChevronDown size={14} />
                      </button>
                      {isLevelMenuOpen && (
                        <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-gray-100 p-3 z-50">
                          {TRACK_LEVEL_CONFIG.map((tr) => (
                            <div key={tr.track} className="mb-3 last:mb-0">
                              <p className="text-xs font-bold text-gray-500 uppercase px-2 mb-1">{tr.trackNameFr}</p>
                              <div className="grid grid-cols-3 gap-1">
                                {tr.levels.map((lev) => (
                                  <Link
                                    key={lev.id}
                                    href={`/levels/${lev.id}`}
                                    onClick={() => setIsLevelMenuOpen(false)}
                                    className={`px-2 py-1.5 rounded-lg text-xs font-semibold text-center transition-colors ${
                                      user.level === lev.id
                                        ? 'bg-primary-600 text-white'
                                        : 'text-gray-700 hover:bg-primary-50 hover:text-primary-700'
                                    }`}
                                  >
                                    {lev.code}
                                  </Link>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    levelName && (
                      <Link
                        href={`/levels/${user.level}`}
                        className="text-xs text-white/70 hover:text-white hover:underline transition-colors"
                      >
                        {levelName}
                      </Link>
                    )
                  )}
                </div>
                <Link
                  href="/profile"
                  title={t('common.profile')}
                  className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
                >
                  <User size={18} />
                </Link>
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
                    {levelName && (
                      <Link
                        href={`/levels/${user.level}`}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="text-xs text-white/70 hover:text-white hover:underline"
                      >
                        {levelName}
                      </Link>
                    )}
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
                  <Link
                    href="/profile"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm w-full hover:bg-white/10"
                  >
                    <User size={18} />
                    {t('common.profile')}
                  </Link>
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
