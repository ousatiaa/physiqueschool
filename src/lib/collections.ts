import { createCollection } from './db';
import type { User, Lesson, Video, Exercise, Homework } from './types';

export const users = createCollection<User>('users');
export const lessons = createCollection<Lesson>('lessons');
export const videos = createCollection<Video>('videos');
export const exercises = createCollection<Exercise>('exercises');
export const homework = createCollection<Homework>('homework');
export const progress = createCollection<any>('progress');
