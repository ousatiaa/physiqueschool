import path from 'path';
import { promises as fs } from 'fs';

const DATA_DIR = path.join(process.cwd(), 'data');

export interface DataStore<T> {
  find(filter?: Partial<T>): Promise<T[]>;
  findById(id: string): Promise<T | null>;
  create(item: Omit<T, '_id' | 'createdAt' | 'updatedAt'>): Promise<T>;
  update(id: string, data: Partial<T>): Promise<T | null>;
  delete(id: string): Promise<boolean>;
}

const CHARS = 'abcdefghijklmnopqrstuvwxyz0123456789';

function generateId(length = 20): string {
  let id = '';
  for (let i = 0; i < length; i++) {
    id += CHARS[Math.floor(Math.random() * CHARS.length)];
  }
  return id;
}

function getFilePath(collection: string): string {
  return path.join(DATA_DIR, collection, 'index.json');
}

async function readCollection<T>(collection: string): Promise<T[]> {
  try {
    const raw = await fs.readFile(getFilePath(collection), 'utf-8');
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

async function writeCollection<T>(collection: string, items: T[]): Promise<void> {
  await fs.writeFile(getFilePath(collection), JSON.stringify(items, null, 2), 'utf-8');
}

export function createCollection<T extends { _id?: string }>(collection: string): DataStore<T> {
  return {
    async find(filter?: Partial<T>): Promise<T[]> {
      const items = await readCollection<T>(collection);
      if (!filter || Object.keys(filter).length === 0) {
        return items;
      }
      return items.filter((item) =>
        Object.entries(filter).every(([key, value]) => {
          if (value === undefined || value === null || value === '') return true;
          return (item as any)[key] === value;
        })
      );
    },

    async findById(id: string): Promise<T | null> {
      const items = await readCollection<T>(collection);
      return items.find((item) => item._id === id) ?? null;
    },

    async create(item: Omit<T, '_id' | 'createdAt' | 'updatedAt'>): Promise<T> {
      const items = await readCollection<T>(collection);
      const now = new Date().toISOString();
      const newItem = {
        ...item,
        _id: generateId(),
        createdAt: now,
        updatedAt: now,
      } as unknown as T;
      items.push(newItem);
      await writeCollection(collection, items);
      return newItem;
    },

    async update(id: string, data: Partial<T>): Promise<T | null> {
      const items = await readCollection<T>(collection);
      const index = items.findIndex((item) => item._id === id);
      if (index === -1) return null;
      items[index] = {
        ...items[index],
        ...data,
        _id: id,
        updatedAt: new Date().toISOString(),
      };
      await writeCollection(collection, items);
      return items[index];
    },

    async delete(id: string): Promise<boolean> {
      const items = await readCollection<T>(collection);
      const filtered = items.filter((item) => item._id !== id);
      if (filtered.length === items.length) return false;
      await writeCollection(collection, filtered);
      return true;
    },
  };
}
