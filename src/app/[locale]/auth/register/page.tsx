'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter, Link } from '@/i18n/navigation';
import { Mail, Lock, Eye, EyeOff, User, Atom, GraduationCap, BookOpen, CheckCircle, ArrowRight, ArrowLeft } from 'lucide-react';
import { TRACK_LEVEL_CONFIG, type TrackType, type LevelType } from '@/lib/constants';

export default function RegisterPage() {
  const t = useTranslations();
  const router = useRouter();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [selectedTrack, setSelectedTrack] = useState<TrackType | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<LevelType | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [registered, setRegistered] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError(t('auth.passwordMismatch'));
      return;
    }
    if (formData.password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    setStep(2);
  };

  const handleSubmit = async () => {
    if (!selectedTrack || !selectedLevel) return;
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          password: formData.password,
          track: selectedTrack,
          level: selectedLevel,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || t('auth.error'));
        setLoading(false);
        return;
      }

      setRegistered(true);
      setLoading(false);
    } catch {
      setError(t('auth.error'));
      setLoading(false);
    }
  };

  const currentTrackConfig = TRACK_LEVEL_CONFIG.find((tr) => tr.track === selectedTrack);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-2xl px-6 py-3 mb-4">
            <Atom size={32} className="text-white" />
            <h1 className="text-2xl font-bold text-white">Physique School</h1>
          </div>
          {!registered && (
            <p className="text-white/80 text-sm mt-2">
              {`Étape ${step} sur 3`}
            </p>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {registered ? (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={32} />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                {t('auth.registrationSubmitted')}
              </h2>
              <p className="text-gray-500 mb-6">
                {t('auth.awaitingApproval')}
              </p>
              <Link
                href="/auth/login"
                className="inline-block bg-primary-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-primary-700 transition-all"
              >
                {t('auth.loginButton')}
              </Link>
            </div>
          ) : (
            <>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
              {error}
            </div>
          )}

          {step === 1 && (
            <>
              <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">
                {t('auth.registerTitle')}
              </h2>
              <form onSubmit={handleStep1} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    {t('auth.fullName')}
                  </label>
                  <div className="relative">
                    <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                      placeholder="Nom complet"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    {t('auth.email')}
                  </label>
                  <div className="relative">
                    <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                      placeholder="example@email.com"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    {t('auth.password')}
                  </label>
                  <div className="relative">
                    <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                      placeholder="••••••••"
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    {t('auth.confirmPassword')}
                  </label>
                  <div className="relative">
                    <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                      placeholder="••••••••"
                      required
                      minLength={6}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-primary-600 text-white py-3 rounded-xl font-semibold hover:bg-primary-700 focus:ring-4 focus:ring-primary-200 transition-all flex items-center justify-center gap-2"
                >
                  {t('common.next')}
                  <ArrowRight size={18} />
                </button>
              </form>
            </>
          )}

          {step === 2 && (
            <>
              <h2 className="text-xl font-bold text-gray-800 text-center mb-2">
                {t('auth.selectTrack')}
              </h2>
              <p className="text-gray-500 text-sm text-center mb-6">
                Choisissez votre filière
              </p>

              <div className="space-y-4 mb-6">
                {TRACK_LEVEL_CONFIG.map((trackConfig) => (
                  <button
                    key={trackConfig.track}
                    onClick={() => {
                      setSelectedTrack(trackConfig.track);
                      setSelectedLevel(null);
                    }}
                    className={`w-full p-6 rounded-xl border-2 transition-all text-start ${
                      selectedTrack === trackConfig.track
                        ? 'border-primary-500 bg-primary-50 ring-2 ring-primary-200'
                        : 'border-gray-200 hover:border-primary-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {trackConfig.track === 'idadi' ? <BookOpen size={24} className="text-primary-600" /> : <GraduationCap size={24} className="text-primary-600" />}
                        <div>
                          <h4 className="font-bold text-gray-800 text-lg">
                            {trackConfig.trackNameFr}
                          </h4>
                          <p className="text-sm text-gray-500">
                            {trackConfig.levels.length} niveaux
                          </p>
                        </div>
                      </div>
                      {selectedTrack === trackConfig.track && (
                        <CheckCircle size={24} className="text-primary-500" />
                      )}
                    </div>
                  </button>
                ))}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-all flex items-center justify-center gap-2"
                >
                  <ArrowLeft size={18} />
                  {t('common.back')}
                </button>
                <button
                  onClick={() => { if (selectedTrack) setStep(3); }}
                  disabled={!selectedTrack}
                  className="flex-1 bg-primary-600 text-white py-3 rounded-xl font-semibold hover:bg-primary-700 focus:ring-4 focus:ring-primary-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {t('common.next')}
                  <ArrowRight size={18} />
                </button>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <h2 className="text-xl font-bold text-gray-800 text-center mb-2">
                {t('auth.selectLevel')}
              </h2>
              <p className="text-gray-500 text-sm text-center mb-6">
                Choisissez votre niveau
              </p>

              {currentTrackConfig && (
                <div className="space-y-3 mb-6">
                  {currentTrackConfig.levels.map((level) => (
                    <button
                      key={level.id}
                      onClick={() => setSelectedLevel(level.id)}
                      className={`w-full p-4 rounded-xl border-2 transition-all text-start ${
                        selectedLevel === level.id
                          ? 'border-primary-500 bg-primary-50 ring-2 ring-primary-200'
                          : 'border-gray-200 hover:border-primary-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="inline-block bg-primary-100 text-primary-700 text-xs font-bold px-2 py-1 rounded-lg mb-2">
                            {level.code}
                          </span>
                          <h4 className="font-medium text-gray-800">
                            {level.nameFr}
                          </h4>
                        </div>
                        {selectedLevel === level.id && (
                          <CheckCircle size={22} className="text-primary-500" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(2)}
                  className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-all flex items-center justify-center gap-2"
                >
                  <ArrowLeft size={18} />
                  {t('common.back')}
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!selectedLevel || loading}
                  className="flex-1 bg-primary-600 text-white py-3 rounded-xl font-semibold hover:bg-primary-700 focus:ring-4 focus:ring-primary-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? t('common.loading') : t('auth.registerButton')}
                </button>
              </div>
            </>
          )}
            </>
          )}

          <div className="mt-6 text-center text-sm text-gray-600">
            {t('auth.hasAccount')}{' '}
            <Link href="/auth/login" className="text-primary-600 font-semibold hover:underline">
              {t('auth.loginHere')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
