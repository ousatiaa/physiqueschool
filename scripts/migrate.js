/* Migration des données locales (data/*.json) vers Supabase
   Usage : node scripts/migrate.js
   Nécessite NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY dans .env.local
*/
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

function loadEnv(file) {
  const env = {};
  try {
    const raw = fs.readFileSync(file, 'utf-8');
    for (const line of raw.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eq = trimmed.indexOf('=');
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      let value = trimmed.slice(eq + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      env[key] = value;
    }
  } catch {
    /* ignore */
  }
  return env;
}

const env = { ...loadEnv(path.join(process.cwd(), '.env.local')), ...process.env };

const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !key) {
  console.error('ERREUR : manque NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY dans .env.local');
  process.exit(1);
}

const supabase = createClient(url, key);
const DATA_DIR = path.join(process.cwd(), 'data');

const COLLECTIONS = ['users', 'lessons', 'videos', 'exercises', 'homework', 'progress'];

async function migrate() {
  for (const name of COLLECTIONS) {
    const file = path.join(DATA_DIR, name, 'index.json');
    let rows = [];
    try {
      rows = JSON.parse(fs.readFileSync(file, 'utf-8'));
    } catch {
      console.log(`- ${name}: aucun fichier, ignoré`);
      continue;
    }
    if (!Array.isArray(rows) || rows.length === 0) {
      console.log(`- ${name}: vide, ignoré`);
      continue;
    }

    const { data: existing } = await supabase.from(name).select('_id');
    const existingIds = new Set((existing ?? []).map((r) => r._id));
    const toInsert = rows.filter((r) => !existingIds.has(r._id));

    if (toInsert.length === 0) {
      console.log(`- ${name}: déjà migré (${rows.length})`);
      continue;
    }

    // insérer par lots de 100
    for (let i = 0; i < toInsert.length; i += 100) {
      const batch = toInsert.slice(i, i + 100);
      const { error } = await supabase.from(name).insert(batch);
      if (error) {
        console.error(`- ${name}: ERREUR lot ${i / 100 + 1}:`, error.message);
        continue;
      }
      console.log(`- ${name}: inséré ${batch.length}`);
    }
  }
  console.log('Terminé.');
}

migrate().catch((err) => {
  console.error(err);
  process.exit(1);
});
