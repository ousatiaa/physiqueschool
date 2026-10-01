'use client';

import { useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { getLevelConfig, type LevelType } from '@/lib/constants';
import {
  BookOpen, Video, FileText, ClipboardList, ArrowLeft, Atom,
  Clock, Play, Eye, EyeOff, CheckCircle, Calendar, Download,
} from 'lucide-react';
import MarkdownRenderer from '@/components/ui/MarkdownRenderer';

interface Lesson {
  _id: string;
  titleFr: string;
  chapter: string;
  chapterFr: string;
  chapterNumber: number;
  duration: number;
  contentFr: string;
}

interface Exercise {
  _id: string;
  titleFr: string;
  chapter: string;
  chapterFr: string;
  contentFr: string;
  solutionFr: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

interface VideoItem {
  _id: string;
  titleFr: string;
  chapter: string;
  chapterFr: string;
  url: string;
  duration: number;
}

interface Homework {
  _id: string;
  titleFr: string;
  descriptionFr: string;
  fileUrl: string;
  deadline: string;
  chapter: string;
  chapterFr: string;
}

type Category = 'lessons' | 'videos' | 'exercises' | 'homework';

interface LessonOption {
  id: string;
  titleFr: string;
  chapterFr: string;
  chapterNumber: number;
}

interface LevelExplorerProps {
  level: string;
  track: string;
  isAdmin: boolean;
  userId: string | null;
  showStats?: boolean;
  backHref?: string;
}

const difficultyColors = {
  easy: 'bg-green-100 text-green-700',
  medium: 'bg-yellow-100 text-yellow-700',
  hard: 'bg-red-100 text-red-700',
};

const difficultyLabels: Record<string, string> = {
  easy: 'Facile',
  medium: 'Moyen',
  hard: 'Difficile',
};

const getYouTubeId = (url: string) => {
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?\s]+)/);
  return match ? match[1] : null;
};

export default function LevelExplorer({ level, track, isAdmin, userId, showStats = true, backHref }: LevelExplorerProps) {
  const t = useTranslations();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [homework, setHomework] = useState<Homework[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLesson, setSelectedLesson] = useState<LessonOption | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [showSolutions, setShowSolutions] = useState<Record<string, boolean>>({});
  const [lessonViewed, setLessonViewed] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const saved = localStorage.getItem(`selectedLesson:${level}`);
    if (saved) {
      try {
        setSelectedLesson(JSON.parse(saved));
      } catch {
        localStorage.removeItem(`selectedLesson:${level}`);
      }
    }
  }, [level]);

  useEffect(() => {
    const params = `level=${level}&track=${track}`;
    const fetchData = async () => {
      try {
        const [lessonsRes, videosRes, exercisesRes, homeworkRes] = await Promise.all([
          fetch(`/api/lessons?${params}`).then((r) => r.json()),
          fetch(`/api/videos?${params}`).then((r) => r.json()),
          fetch(`/api/exercises?${params}`).then((r) => r.json()),
          fetch(`/api/homework?${params}`).then((r) => r.json()),
        ]);

        setLessons(Array.isArray(lessonsRes) ? lessonsRes : []);
        setVideos(Array.isArray(videosRes) ? videosRes : []);
        setExercises(Array.isArray(exercisesRes) ? exercisesRes : []);
        setHomework(Array.isArray(homeworkRes) ? homeworkRes : []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [level, track]);

  const lessonOptions = useMemo(() => {
    return lessons
      .slice()
      .sort((a, b) => (a.chapterNumber || 0) - (b.chapterNumber || 0))
      .map((lesson) => ({
        id: lesson._id,
        titleFr: lesson.titleFr,
        chapterFr: lesson.chapterFr,
        chapterNumber: lesson.chapterNumber || 0,
      }));
  }, [lessons]);

  useEffect(() => {
    if (lessonOptions.length === 0) return;
    const stillExists = lessonOptions.some((l) => l.id === selectedLesson?.id);
    if (!selectedLesson || !stillExists) {
      setSelectedLesson(lessonOptions[0]);
    }
  }, [lessonOptions, selectedLesson]);

  const handleSelectLesson = (lesson: LessonOption) => {
    setSelectedLesson(lesson);
    setSelectedCategory(null);
    try {
      localStorage.setItem(`selectedLesson:${level}`, JSON.stringify(lesson));
    } catch {}
  };

  const levelConfig = getLevelConfig(level as LevelType);
  const levelName = levelConfig ? levelConfig.nameFr : level;
  const trackName = levelConfig ? levelConfig.trackNameFr : track;

  const selectedLessonLessons = selectedLesson
    ? lessons.filter((l) => l._id === selectedLesson.id)
    : [];
  const selectedLessonExercises = selectedLesson
    ? exercises.filter((e) => e.chapterFr === selectedLesson.chapterFr)
    : [];
  const selectedLessonVideos = selectedLesson
    ? videos.filter((v) => v.chapterFr === selectedLesson.chapterFr)
    : [];
  const selectedLessonHomework = selectedLesson
    ? homework.filter((h) => h.chapterFr === selectedLesson.chapterFr)
    : [];

  const categoryTabs = [
    { key: 'lessons' as Category, label: t('common.lessons'), count: selectedLessonLessons.length, icon: <BookOpen size={20} />, color: 'text-blue-600 bg-blue-50 border-blue-200', activeColor: 'bg-blue-600 text-white border-blue-600' },
    { key: 'videos' as Category, label: t('common.videos'), count: selectedLessonVideos.length, icon: <Video size={20} />, color: 'text-red-600 bg-red-50 border-red-200', activeColor: 'bg-red-600 text-white border-red-600' },
    { key: 'exercises' as Category, label: t('common.exercises'), count: selectedLessonExercises.length, icon: <FileText size={20} />, color: 'text-green-600 bg-green-50 border-green-200', activeColor: 'bg-green-600 text-white border-green-600' },
    { key: 'homework' as Category, label: t('common.homework'), count: selectedLessonHomework.length, icon: <ClipboardList size={20} />, color: 'text-yellow-600 bg-yellow-50 border-yellow-200', activeColor: 'bg-yellow-600 text-white border-yellow-600' },
  ];

  const toggleSolution = (id: string) => {
    setShowSolutions((prev) => ({ ...prev, [id]: !prev[id] }));
    if (!showSolutions[id]) {
      const token = localStorage.getItem('token');
      if (!isAdmin && userId && token) {
        fetch('/api/progress', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ userId, contentType: 'exercise', contentId: id, action: 'solved' }),
        }).catch(() => {});
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {backHref && (
            <Link href={backHref} className="inline-flex items-center gap-1 text-white/70 hover:text-white mb-4 text-sm">
              <ArrowLeft size={16} />
              {t('dashboard.backToDashboard')}
            </Link>
          )}
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-white/20 rounded-2xl p-3">
              <Atom size={36} />
            </div>
            <div>
              <h1 className="text-3xl font-bold">{t('dashboard.welcome')}</h1>
              <p className="text-white/80 mt-1">{t('dashboard.welcomeMessage')}</p>
            </div>
          </div>
          <div className="mt-6 flex flex-wrap gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl px-5 py-3">
              <span className="text-white/60 text-sm">{t('dashboard.myLevel')}</span>
              <p className="font-bold text-lg">{levelName}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl px-5 py-3">
              <span className="text-white/60 text-sm">{t('dashboard.myTrack')}</span>
              <p className="font-bold text-lg">{trackName}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 pb-12">
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">{t('dashboard.chooseLesson')}</h2>
          {loading ? (
            <div className="text-center py-8 text-gray-500">{t('common.loading')}</div>
          ) : lessonOptions.length === 0 ? (
            <div className="text-center py-8">
              <BookOpen size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">{t('common.noContent')}</p>
            </div>
          ) : (
            <>
              <div className="flex flex-wrap gap-3">
                {lessonOptions.map((lesson) => {
                  const active = selectedLesson?.id === lesson.id;
                  return (
                    <button
                      key={lesson.id}
                      onClick={() => handleSelectLesson(lesson)}
                      className={`px-5 py-3 rounded-xl text-sm font-semibold transition-all border-2 ${
                        active
                          ? 'bg-primary-600 text-white border-primary-600 shadow-md'
                          : 'bg-white text-gray-700 border-gray-200 hover:border-primary-400 hover:text-primary-600'
                      }`}
                    >
                      {lesson.titleFr}
                    </button>
                  );
                })}
              </div>

              {selectedLesson && (
                <div className="mt-8">
                  <div className="flex flex-wrap gap-3">
                    {categoryTabs.map((tab) => (
                      <button
                        key={tab.key}
                        onClick={() => setSelectedCategory(tab.key)}
                        className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold transition-all border-2 ${
                          selectedCategory === tab.key ? tab.activeColor : tab.color
                        }`}
                      >
                        {tab.icon}
                        {tab.label}
                        <span className={`px-2 py-0.5 rounded-full text-xs ${
                          selectedCategory === tab.key ? 'bg-white/20' : 'bg-white border border-gray-200'
                        }`}>
                          {tab.count}
                        </span>
                      </button>
                    ))}
                  </div>

                  <div className="mt-8">
                    {selectedCategory === 'lessons' && (
                      selectedLessonLessons.length === 0 ? (
                        <div className="text-center py-8">
                          <BookOpen size={48} className="mx-auto text-gray-300 mb-4" />
                          <p className="text-gray-500">{t('dashboard.noCategoryContent')}</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {selectedLessonLessons.map((lesson) => (
                            <div key={lesson._id} className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                              <div className="flex items-start justify-between mb-3">
                                <h4 className="font-semibold text-gray-800">
                                  {lesson.titleFr}
                                </h4>
                                {lesson.duration > 0 && (
                                  <div className="flex items-center gap-1 text-sm text-gray-500 shrink-0 ml-3">
                                    <Clock size={14} />
                                    {lesson.duration} {t('lessons.minutes')}
                                  </div>
                                )}
                              </div>
                              {lesson.contentFr && (
                                <div className="bg-white rounded-xl p-4">
                                  <MarkdownRenderer
                                    content={lesson.contentFr}
                                    className="text-sm"
                                    disableCopy={!isAdmin}
                                    onContentLoaded={() => {
                                      const token = localStorage.getItem('token');
                                      if (!isAdmin && userId && token && !lessonViewed[lesson._id]) {
                                        fetch('/api/progress', {
                                          method: 'POST',
                                          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                                          body: JSON.stringify({ userId, contentType: 'lesson', contentId: lesson._id, action: 'viewed' }),
                                        }).catch(() => {});
                                        setLessonViewed((prev) => ({ ...prev, [lesson._id]: true }));
                                      }
                                    }}
                                  />
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )
                    )}

                    {selectedCategory === 'exercises' && (
                      selectedLessonExercises.length === 0 ? (
                        <div className="text-center py-8">
                          <FileText size={48} className="mx-auto text-gray-300 mb-4" />
                          <p className="text-gray-500">{t('dashboard.noCategoryContent')}</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {selectedLessonExercises.map((exercise) => (
                            <div key={exercise._id} className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                              <div className="flex items-start justify-between mb-3">
                                <h4 className="font-semibold text-gray-800">
                                  {exercise.titleFr}
                                </h4>
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${difficultyColors[exercise.difficulty]}`}>
                                  {difficultyLabels[exercise.difficulty]}
                                </span>
                              </div>
                              <div className="bg-white rounded-xl p-4">
                                <MarkdownRenderer content={exercise.contentFr} className="text-sm" disableCopy={!isAdmin} />
                              </div>
                              {exercise.solutionFr && (
                                <div className="mt-3">
                                  <button
                                    onClick={() => toggleSolution(exercise._id)}
                                    className="flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium text-sm"
                                  >
                                    {showSolutions[exercise._id] ? (
                                      <>
                                        <EyeOff size={16} />
                                        {t('exercises.hideSolution')}
                                      </>
                                    ) : (
                                      <>
                                        <Eye size={16} />
                                        {t('exercises.showSolution')}
                                      </>
                                    )}
                                  </button>
                                  {showSolutions[exercise._id] && (
                                    <div className="mt-3 bg-green-50 border border-green-200 rounded-xl p-5">
                                      <div className="flex items-center gap-2 text-green-700 font-medium mb-2">
                                        <CheckCircle size={16} />
                                        {t('exercises.solution')}
                                      </div>
                                      <MarkdownRenderer content={exercise.solutionFr} className="text-sm text-green-800" disableCopy={!isAdmin} />
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )
                    )}

                    {selectedCategory === 'videos' && (
                      selectedLessonVideos.length === 0 ? (
                        <div className="text-center py-8">
                          <Video size={48} className="mx-auto text-gray-300 mb-4" />
                          <p className="text-gray-500">{t('dashboard.noCategoryContent')}</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {selectedLessonVideos.map((video) => {
                            const ytId = getYouTubeId(video.url);
                            return (
                              <div key={video._id} className="bg-gray-50 rounded-xl overflow-hidden border border-gray-100 group">
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
                                        const token = localStorage.getItem('token');
                                        if (!isAdmin && userId && token) {
                                          fetch('/api/progress', {
                                            method: 'POST',
                                            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                                            body: JSON.stringify({ userId, contentType: 'video', contentId: video._id, action: 'viewed' }),
                                          }).catch(() => {});
                                        }
                                      }}
                                      className="bg-white/90 rounded-full p-4 hover:bg-white transition-colors"
                                    >
                                      <Play size={24} className="text-primary-600 ml-1" />
                                    </a>
                                  </div>
                                </div>
                                <div className="p-4">
                                  <h4 className="font-semibold text-gray-800 group-hover:text-primary-600 transition-colors">
                                    {video.titleFr}
                                  </h4>
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
                      )
                    )}

                    {selectedCategory === 'homework' && (
                      selectedLessonHomework.length === 0 ? (
                        <div className="text-center py-8">
                          <ClipboardList size={48} className="mx-auto text-gray-300 mb-4" />
                          <p className="text-gray-500">{t('dashboard.noCategoryContent')}</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {selectedLessonHomework.map((hw) => (
                            <div key={hw._id} className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                              <h4 className="font-semibold text-gray-800 mb-2">
                                {hw.titleFr}
                              </h4>
                              {hw.descriptionFr && (
                                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                                  {hw.descriptionFr}
                                </p>
                              )}
                              <div className="flex items-center gap-1 text-xs text-gray-500">
                                <Calendar size={14} />
                                {t('homework.deadline')}: {new Date(hw.deadline).toLocaleDateString('fr-FR')}
                              </div>
                              {hw.fileUrl && (
                                <a
                                  href={hw.fileUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={() => {
                                    const token = localStorage.getItem('token');
                                    if (!isAdmin && userId && token) {
                                      fetch('/api/progress', {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                                        body: JSON.stringify({ userId, contentType: 'homework', contentId: hw._id, action: 'completed' }),
                                      }).catch(() => {});
                                    }
                                  }}
                                  className="mt-4 flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium text-sm"
                                >
                                  <Download size={16} />
                                  {t('homework.download')}
                                </a>
                              )}
                            </div>
                          ))}
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {showStats && (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { key: 'lessons', label: t('dashboard.totalLessons'), value: lessons.length, icon: <BookOpen size={28} />, color: 'bg-blue-500', href: `/levels/${level}` },
                { key: 'videos', label: t('dashboard.totalVideos'), value: videos.length, icon: <Video size={28} />, color: 'bg-red-500', href: `/levels/${level}` },
                { key: 'exercises', label: t('dashboard.totalExercises'), value: exercises.length, icon: <FileText size={28} />, color: 'bg-green-500', href: `/levels/${level}` },
                { key: 'homework', label: t('dashboard.totalHomework'), value: homework.length, icon: <ClipboardList size={28} />, color: 'bg-yellow-500', href: `/levels/${level}` },
              ].map((card) => (
                <Link
                  key={card.key}
                  href={card.href}
                  className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all p-6 group"
                >
                  <div className={`inline-flex p-3 rounded-xl ${card.color} text-white mb-4 group-hover:scale-110 transition-transform`}>
                    {card.icon}
                  </div>
                  <div className="text-3xl font-bold text-gray-800">
                    {loading ? '...' : card.value}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">{card.label}</div>
                </Link>
              ))}
            </div>

            <div className="mt-12">
              <h2 className="text-xl font-bold text-gray-800 mb-6">{t('common.lessons')}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  { href: `/levels/${level}`, icon: <BookOpen size={32} />, color: 'from-blue-500 to-blue-600', label: t('common.lessons') },
                  { href: `/levels/${level}`, icon: <Video size={32} />, color: 'from-red-500 to-red-600', label: t('common.videos') },
                  { href: `/levels/${level}`, icon: <FileText size={32} />, color: 'from-green-500 to-green-600', label: t('common.exercises') },
                  { href: `/levels/${level}`, icon: <ClipboardList size={32} />, color: 'from-yellow-500 to-yellow-600', label: t('common.homework') },
                ].map((item) => (
                  <Link
                    key={item.href + item.label}
                    href={item.href}
                    className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all overflow-hidden group"
                  >
                    <div className={`bg-gradient-to-r ${item.color} p-8 flex items-center justify-center text-white group-hover:scale-105 transition-transform`}>
                      {item.icon}
                    </div>
                    <div className="p-5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-gray-800">
                          {item.label}
                        </span>
                        <ArrowLeft size={18} className="text-gray-400 group-hover:text-primary-500 group-hover:-translate-x-1 transition-all" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
