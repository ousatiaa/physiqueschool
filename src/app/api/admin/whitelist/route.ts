import { NextRequest, NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import { whitelist } from '@/lib/collections';
import { verifyToken } from '@/lib/auth';
import { normalizeLevelInput, normalizeName } from '@/lib/whitelist';

function parseWorkbook(buffer: Buffer): { level: string; name: string }[] {
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const entries: { level: string; name: string }[] = [];

  const addEntry = (level: string | null, raw: string) => {
    if (!level) return;
    const name = normalizeName(raw);
    if (name && !entries.some((e) => e.level === level && e.name === name)) {
      entries.push({ level, name });
    }
  };

  const rowCells = (row: unknown[]): string[] =>
    (row || []).map((c) => (c === undefined || c === null ? '' : String(c)).trim());

  for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1, defval: '' });
    if (rows.length === 0) continue;

    const sheetLevel = normalizeLevelInput(sheetName);
    const header = rowCells(rows[0]).map((c) => c.toLowerCase());

    const levelIdx = header.findIndex((c) => c === 'niveau' || c === 'level' || c === 'niveaux' || c === 'la liste');
    const nameIdx = header.findIndex((c) => c === 'nom' || c === 'name' || c === 'noms' || c === 'les noms');
    const hasLevelCol = levelIdx !== -1;
    const hasNameCol = nameIdx !== -1;

    if ((hasLevelCol || sheetLevel) && hasNameCol) {
      for (const row of rows.slice(1)) {
        const cells = rowCells(row);
        const level = hasLevelCol ? normalizeLevelInput(cells[levelIdx]) : sheetLevel;
        addEntry(level, cells[nameIdx]);
      }
    } else if (sheetLevel) {
      for (const row of rows) {
        const cells = rowCells(row);
        addEntry(sheetLevel, cells[0]);
      }
    } else {
      for (const row of rows) {
        const cells = rowCells(row);
        if (cells.length < 2) continue;
        if (hasLevelCol) {
          const level = normalizeLevelInput(cells[levelIdx]);
          for (const cell of cells.slice(1)) addEntry(hasLevelCol ? level : null, cell);
        } else {
          const level = normalizeLevelInput(cells[0]);
          if (!level) continue;
          for (const cell of cells.slice(1)) addEntry(level, cell);
        }
      }
    }
  }

  return entries;
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value || request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 });

    const buffer = Buffer.from(await file.arrayBuffer());
    const entries = parseWorkbook(buffer);
    if (entries.length === 0) {
      return NextResponse.json({ error: 'Aucun nom valide trouvé dans le fichier. Format attendu : Niveau | Nom...' }, { status: 400 });
    }

    for (const entry of entries) {
      const existing = await whitelist.find({ level: entry.level, name: entry.name });
      if (existing.length === 0) {
        await whitelist.create(entry);
      }
    }

    const perLevel: Record<string, number> = {};
    for (const entry of entries) {
      perLevel[entry.level] = (perLevel[entry.level] || 0) + 1;
    }

    return NextResponse.json({ imported: entries.length, perLevel }, { status: 201 });
  } catch (error) {
    console.error('Whitelist upload error:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value || request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const all = await whitelist.find({});
    const perLevel: Record<string, string[]> = {};
    for (const entry of all) {
      if (!perLevel[entry.level]) perLevel[entry.level] = [];
      perLevel[entry.level].push(entry.name);
    }
    return NextResponse.json({ count: all.length, perLevel });
  } catch (error) {
    console.error('Whitelist read error:', error);
    return NextResponse.json({ error: 'Read failed' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value || request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const all = await whitelist.find({});
    for (const entry of all) {
      if (entry._id) await whitelist.delete(entry._id);
    }
    return NextResponse.json({ message: 'Whitelist cleared' });
  } catch (error) {
    console.error('Whitelist clear error:', error);
    return NextResponse.json({ error: 'Clear failed' }, { status: 500 });
  }
}