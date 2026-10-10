export interface User {
  _id?: string;
  email: string;
  password: string;
  fullName: string;
  track: string;
  level: string;
  role: 'student' | 'admin';
  approved?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Lesson {
  _id?: string;
  title: string;
  titleFr: string;
  chapter: string;
  chapterFr: string;
  chapterNumber: number;
  content: string;
  contentFr: string;
  level: string;
  track: string;
  duration: number;
  order: number;
  pdfUrl?: string;
  published?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Video {
  _id?: string;
  title: string;
  titleFr: string;
  description: string;
  descriptionFr: string;
  url: string;
  thumbnail: string;
  level: string;
  track: string;
  chapter: string;
  chapterFr: string;
  duration: number;
  lessonId?: string;
  published?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Exercise {
  _id?: string;
  title: string;
  titleFr: string;
  description: string;
  descriptionFr: string;
  content: string;
  contentFr: string;
  solution: string;
  solutionFr: string;
  level: string;
  track: string;
  chapter: string;
  chapterFr: string;
  difficulty: 'easy' | 'medium' | 'hard';
  lessonId?: string;
  published?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Homework {
  _id?: string;
  title: string;
  titleFr: string;
  description: string;
  descriptionFr: string;
  level: string;
  track: string;
  fileUrl: string;
  deadline: string;
  chapter: string;
  chapterFr: string;
  published?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface WhitelistEntry {
  _id?: string;
  level: string;
  name: string;
  createdAt?: string;
  updatedAt?: string;
}
