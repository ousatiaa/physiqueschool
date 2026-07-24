import { connectDB } from './mongodb';
import { UserModel, LessonModel, VideoModel, ExerciseModel, HomeworkModel, ProgressModel } from './models';
import type { Model } from 'mongoose';

export interface DataStore<T> {
  find(filter?: Partial<T>): Promise<T[]>;
  findById(id: string): Promise<T | null>;
  create(item: Omit<T, '_id' | 'createdAt' | 'updatedAt'>): Promise<T>;
  update(id: string, data: Partial<T>): Promise<T | null>;
  delete(id: string): Promise<boolean>;
}

type MongooseModel = Model<any>;

function getModel(collection: string): MongooseModel {
  switch (collection) {
    case 'users': return UserModel;
    case 'lessons': return LessonModel;
    case 'videos': return VideoModel;
    case 'exercises': return ExerciseModel;
    case 'homework': return HomeworkModel;
    case 'progress': return ProgressModel;
    default: throw new Error(`Unknown collection: ${collection}`);
  }
}

export function createCollection<T extends { _id?: string }>(collection: string): DataStore<T> {
  const Model = getModel(collection);

  return {
    async find(filter?: Partial<T>): Promise<T[]> {
      await connectDB();
      if (!filter || Object.keys(filter).length === 0) {
        const docs = await Model.find().lean();
        return docs.map((d: any) => ({ ...d, _id: d._id.toString() }));
      }
      const query: Record<string, any> = {};
      for (const [key, value] of Object.entries(filter)) {
        if (value !== undefined && value !== null && value !== '') {
          query[key] = value;
        }
      }
      const docs = await Model.find(query).lean();
      return docs.map((d: any) => ({ ...d, _id: d._id.toString() }));
    },

    async findById(id: string): Promise<T | null> {
      await connectDB();
      try {
        const doc = await Model.findById(id).lean();
        if (!doc) return null;
        return { ...doc, _id: doc._id.toString() } as T;
      } catch {
        return null;
      }
    },

    async create(item: Omit<T, '_id' | 'createdAt' | 'updatedAt'>): Promise<T> {
      await connectDB();
      const doc = await Model.create(item);
      const obj = doc.toObject();
      obj._id = obj._id.toString();
      delete obj.__v;
      return obj as T;
    },

    async update(id: string, data: Partial<T>): Promise<T | null> {
      await connectDB();
      try {
        const doc = await Model.findByIdAndUpdate(id, { ...data, updatedAt: new Date() }, { new: true }).lean();
        if (!doc) return null;
        return { ...doc, _id: doc._id.toString() } as T;
      } catch {
        return null;
      }
    },

    async delete(id: string): Promise<boolean> {
      await connectDB();
      try {
        const result = await Model.findByIdAndDelete(id);
        return !!result;
      } catch {
        return false;
      }
    },
  };
}
