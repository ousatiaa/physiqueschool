import mongoose, { Schema, Document } from 'mongoose';

export interface IUserDoc extends Document {
  email: string;
  password: string;
  fullName: string;
  track: string;
  level: string;
  role: 'student' | 'admin';
  createdAt: Date;
  updatedAt: Date;
}

export interface ILessonDoc extends Document {
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
  createdAt: Date;
  updatedAt: Date;
}

export interface IVideoDoc extends Document {
  title: string;
  titleFr: string;
  description: string;
  descriptionFr: string;
  url: string;
  thumbnail: string;
  level: string;
  track: string;
  duration: number;
  lessonId?: string;
  published?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IExerciseDoc extends Document {
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
  createdAt: Date;
  updatedAt: Date;
}

export interface IHomeworkDoc extends Document {
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
  createdAt: Date;
  updatedAt: Date;
}

export interface IProgressDoc extends Document {
  userId: string;
  contentType: string;
  contentId: string;
  action: string;
  completedAt: string;
}

const UserSchema = new Schema<IUserDoc>({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  fullName: { type: String, required: true },
  track: { type: String, required: true },
  level: { type: String, required: true },
  role: { type: String, enum: ['student', 'admin'], default: 'student' },
}, { timestamps: true });

const LessonSchema = new Schema<ILessonDoc>({
  title: { type: String, default: '' },
  titleFr: { type: String, required: true },
  chapter: { type: String, default: '' },
  chapterFr: { type: String, default: '' },
  chapterNumber: { type: Number, default: 0 },
  content: { type: String, default: '' },
  contentFr: { type: String, default: '' },
  level: { type: String, required: true },
  track: { type: String, required: true },
  duration: { type: Number, default: 45 },
  order: { type: Number, default: 0 },
  pdfUrl: { type: String, default: '' },
  published: { type: Boolean, default: false },
}, { timestamps: true });

const VideoSchema = new Schema<IVideoDoc>({
  title: { type: String, default: '' },
  titleFr: { type: String, required: true },
  description: { type: String, default: '' },
  descriptionFr: { type: String, default: '' },
  url: { type: String, required: true },
  thumbnail: { type: String, default: '' },
  level: { type: String, required: true },
  track: { type: String, required: true },
  duration: { type: Number, default: 0 },
  lessonId: { type: String },
  published: { type: Boolean, default: false },
}, { timestamps: true });

const ExerciseSchema = new Schema<IExerciseDoc>({
  title: { type: String, default: '' },
  titleFr: { type: String, required: true },
  description: { type: String, default: '' },
  descriptionFr: { type: String, default: '' },
  content: { type: String, default: '' },
  contentFr: { type: String, default: '' },
  solution: { type: String, default: '' },
  solutionFr: { type: String, default: '' },
  level: { type: String, required: true },
  track: { type: String, required: true },
  chapter: { type: String, default: '' },
  chapterFr: { type: String, default: '' },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
  lessonId: { type: String },
  published: { type: Boolean, default: false },
}, { timestamps: true });

const HomeworkSchema = new Schema<IHomeworkDoc>({
  title: { type: String, default: '' },
  titleFr: { type: String, required: true },
  description: { type: String, default: '' },
  descriptionFr: { type: String, default: '' },
  level: { type: String, required: true },
  track: { type: String, required: true },
  fileUrl: { type: String, default: '' },
  deadline: { type: String, default: '' },
  chapter: { type: String, default: '' },
  chapterFr: { type: String, default: '' },
  published: { type: Boolean, default: false },
}, { timestamps: true });

const ProgressSchema = new Schema<IProgressDoc>({
  userId: { type: String, required: true },
  contentType: { type: String, required: true },
  contentId: { type: String, required: true },
  action: { type: String, required: true },
  completedAt: { type: String, default: () => new Date().toISOString() },
});

export const UserModel = mongoose.models.User || mongoose.model<IUserDoc>('User', UserSchema);
export const LessonModel = mongoose.models.Lesson || mongoose.model<ILessonDoc>('Lesson', LessonSchema);
export const VideoModel = mongoose.models.Video || mongoose.model<IVideoDoc>('Video', VideoSchema);
export const ExerciseModel = mongoose.models.Exercise || mongoose.model<IExerciseDoc>('Exercise', ExerciseSchema);
export const HomeworkModel = mongoose.models.Homework || mongoose.model<IHomeworkDoc>('Homework', HomeworkSchema);
export const ProgressModel = mongoose.models.Progress || mongoose.model<IProgressDoc>('Progress', ProgressSchema);
