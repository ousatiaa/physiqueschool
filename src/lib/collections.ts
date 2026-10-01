import { createCollection } from './db';
import { createSupabaseCollection } from './supabase-collection';
import { isSupabaseConfigured } from './supabase';
import type { User, Lesson, Video, Exercise, Homework } from './types';

export const users = isSupabaseConfigured
  ? createSupabaseCollection<User>('users')
  : createCollection<User>('users');

export const lessons = isSupabaseConfigured
  ? createSupabaseCollection<Lesson>('lessons')
  : createCollection<Lesson>('lessons');

export const videos = isSupabaseConfigured
  ? createSupabaseCollection<Video>('videos')
  : createCollection<Video>('videos');

export const exercises = isSupabaseConfigured
  ? createSupabaseCollection<Exercise>('exercises')
  : createCollection<Exercise>('exercises');

export const homework = isSupabaseConfigured
  ? createSupabaseCollection<Homework>('homework')
  : createCollection<Homework>('homework');

export const progress = isSupabaseConfigured
  ? createSupabaseCollection<any>('progress')
  : createCollection<any>('progress');
