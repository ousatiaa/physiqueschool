import { whitelist } from './collections';
import { LEVELS } from './constants';

export function normalizeName(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\u0600-\u06FF\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function normalizeLevelInput(raw: string): string | null {
  const cleaned = raw.trim();
  const upper = cleaned.toUpperCase().replace(/[^A-Z0-9]/g, '');
  for (const [key, value] of Object.entries(LEVELS)) {
    if (key.replace(/[^A-Z0-9]/g, '') === upper) return value;
  }
  return null;
}

export function namesMatch(a: string, b: string): boolean {
  const na = normalizeName(a);
  const nb = normalizeName(b);
  return na === nb;
}

export async function isAutoApproved(fullName: string, level: string): Promise<boolean> {
  try {
    const entries = await whitelist.find({ level });
    const normalized = normalizeName(fullName);
    return entries.some((entry) => namesMatch(entry.name, normalized));
  } catch {
    return false;
  }
}