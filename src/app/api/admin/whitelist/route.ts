import { NextRequest, NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import { users, whitelist } from '@/lib/collections';
import { verifyToken } from '@/lib/auth';
import { normalizeLevelInput, normalizeName, namesMatch } from '@/lib/whitelist';

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
    } else if (sheetLevel && !hasLevelCol) {
      const first = rowCells(rows[0]);
      const firstLevel = normalizeLevelInput(first[0]);
      const twoCol = first.length >= 2 && (firstLevel !== null || String(first[0]).toUpperCase() === sheetName.toUpperCase());
      if (twoCol) {
        for (const row of rows) {
          const cells = rowCells(row);
          const level = normalizeLevelInput(cells[0]) ?? sheetLevel;
          addEntry(level, cells[1]);
        }
      } else {
        for (const row of rows) {
          const cells = rowCells(row);
          addEntry(sheetLevel, cells[0]);
        }
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
      return NextResponse.json({ error: 'Aucun nom valide trouvé dans le fichier. Format : une feuille par niveau (ex. « 2AC », « 1BACSPF ») avec les noms en colonne A.' }, { status: 400 });
    }

    const byLevel: Record<string, { level: string; name: string }[]> = {};
    for (const entry of entries) {
      if (!byLevel[entry.level]) byLevel[entry.level] = [];
      byLevel[entry.level].push(entry);
    }

    const removed: Record<string, number> = {};
    const added: Record<string, number> = {};
    for (const [level, levelEntries] of Object.entries(byLevel)) {
      const existing = await whitelist.find({ level });

      const incomingNames = new Set(levelEntries.map((e) => e.name));
      let removedCount = 0;
      for (const old of existing) {
        if (!incomingNames.has(old.name) && old._id) {
          await whitelist.delete(old._id);
          removedCount++;
        }
      }
      removed[level] = removedCount;

      let addedCount = 0;
      for (const entry of levelEntries) {
        const already = existing.some((old) => old.name === entry.name);
        if (!already) {
          await whitelist.create(entry);
          addedCount++;
        }
      }
      added[level] = addedCount;
    }

    const approvedNow: Record<string, number> = {};
    for (const [level, levelEntries] of Object.entries(byLevel)) {
      const names = levelEntries.map((e) => e.name);
      const students = await users.find({ level });
      let approvedCount = 0;
      for (const student of students) {
        if (student.approved === true || student.role !== 'student') continue;
        if (!student._id) continue;
        if (names.some((n) => namesMatch(n, student.fullName))) {
          await users.update(student._id, { approved: true } as any);
          approvedCount++;
        }
      }
      approvedNow[level] = approvedCount;
    }

    return NextResponse.json({ imported: entries.length, perLevel: added, removed, approvedNow }, { status: 201 });
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