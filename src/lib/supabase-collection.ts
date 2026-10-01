import type { DataStore } from './db';
import { getSupabase } from './supabase';

function db() {
  return getSupabase();
}

const CHARS = 'abcdefghijklmnopqrstuvwxyz0123456789';

function generateId(length = 20): string {
  let id = '';
  for (let i = 0; i < length; i++) {
    id += CHARS[Math.floor(Math.random() * CHARS.length)];
  }
  return id;
}

function normalizeFilter<T>(filter?: Partial<T>): Partial<T> {
  if (!filter) return {};
  return Object.fromEntries(
    Object.entries(filter).filter(
      ([, value]) => value !== undefined && value !== null && value !== ''
    )
  ) as Partial<T>;
}

export function createSupabaseCollection<T extends { _id?: string }>(
  table: string
): DataStore<T> {
  return {
    async find(filter?: Partial<T>): Promise<T[]> {
      const cleanFilter = normalizeFilter(filter);
      let query = db().from(table).select('*');

      for (const [key, value] of Object.entries(cleanFilter)) {
        query = query.eq(key, value);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as T[];
    },

    async findById(id: string): Promise<T | null> {
      const { data, error } = await db()
        .from(table)
        .select('*')
        .eq('_id', id)
        .maybeSingle();

      if (error) throw error;
      return (data as T) ?? null;
    },

    async create(item: Omit<T, '_id' | 'createdAt' | 'updatedAt'>): Promise<T> {
      const now = new Date().toISOString();
      const newItem = {
        ...(item as object),
        _id: generateId(),
        createdAt: now,
        updatedAt: now,
      } as Record<string, unknown>;

      const { data, error } = await db()
        .from(table)
        .insert(newItem)
        .select()
        .single();

      if (error) throw error;
      return data as T;
    },

    async update(id: string, data: Partial<T>): Promise<T | null> {
      const updateData = {
        ...(data as object),
        updatedAt: new Date().toISOString(),
      } as Record<string, unknown>;

      const { data: result, error } = await db()
        .from(table)
        .update(updateData)
        .eq('_id', id)
        .select()
        .single();

      if (error) throw error;
      return (result as T) ?? null;
    },

    async delete(id: string): Promise<boolean> {
      const { error } = await db().from(table).delete().eq('_id', id);
      if (error) throw error;
      return true;
    },
  };
}
