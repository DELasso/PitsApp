#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const { createClient } = require('@supabase/supabase-js');

dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
const PROJECT_ROOT = path.resolve(__dirname, '..');
const UPLOADS_DIR = path.join(PROJECT_ROOT, 'uploads');
const DRY_RUN = process.argv.includes('--dry-run');

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Faltan SUPABASE_URL o SUPABASE_SERVICE_KEY en backend/.env');
  process.exit(1);
}

if (!fs.existsSync(UPLOADS_DIR)) {
  console.error(`No existe la carpeta de uploads legacy: ${UPLOADS_DIR}`);
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const targets = [
  { table: 'workshops', bucket: 'workshops' },
  { table: 'parts', bucket: 'parts' },
];

function walkFiles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walkFiles(fullPath));
      continue;
    }

    files.push(fullPath);
  }

  return files;
}

function normalizeImages(value) {
  if (Array.isArray(value)) {
    return value.map((item) => String(item)).filter(Boolean);
  }

  if (typeof value === 'string' && value.trim()) {
    const trimmed = value.trim();
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        return parsed.map((item) => String(item)).filter(Boolean);
      }
    } catch {}

    return [trimmed];
  }

  return [];
}

function isRemoteUrl(value) {
  return /^https?:\/\//i.test(value);
}

function guessMimeType(buffer, filePath) {
  if (!buffer || buffer.length < 12) {
    const ext = path.extname(filePath).toLowerCase();
    return mimeFromExtension(ext);
  }

  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return 'image/jpeg';
  }

  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47
  ) {
    return 'image/png';
  }

  if (buffer.toString('ascii', 0, 6) === 'GIF87a' || buffer.toString('ascii', 0, 6) === 'GIF89a') {
    return 'image/gif';
  }

  if (
    buffer.toString('ascii', 0, 4) === 'RIFF' &&
    buffer.toString('ascii', 8, 12) === 'WEBP'
  ) {
    return 'image/webp';
  }

  return mimeFromExtension(path.extname(filePath).toLowerCase());
}

function mimeFromExtension(ext) {
  switch (ext) {
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg';
    case '.png':
      return 'image/png';
    case '.gif':
      return 'image/gif';
    case '.webp':
      return 'image/webp';
    default:
      return 'application/octet-stream';
  }
}

function extensionFromMime(mimeType) {
  switch (mimeType) {
    case 'image/jpeg':
      return '.jpg';
    case 'image/png':
      return '.png';
    case 'image/gif':
      return '.gif';
    case 'image/webp':
      return '.webp';
    default:
      return '';
  }
}

function normalizeLegacyPath(value) {
  let cleaned = String(value).trim();

  cleaned = cleaned.replace(/^https?:\/\/[^/]+/i, '');
  cleaned = cleaned.split('?')[0].split('#')[0];
  cleaned = cleaned.replace(/^\/+/, '');

  const uploadsIndex = cleaned.indexOf('uploads/');
  if (uploadsIndex >= 0) {
    cleaned = cleaned.slice(uploadsIndex + 'uploads/'.length);
  }

  return cleaned;
}

function buildFileIndexes() {
  const allFiles = walkFiles(UPLOADS_DIR);
  const byRelativePath = new Map();
  const byBasename = new Map();

  for (const fullPath of allFiles) {
    const relativePath = path.relative(UPLOADS_DIR, fullPath).replace(/\\/g, '/');
    byRelativePath.set(relativePath, fullPath);

    const basename = path.basename(fullPath);
    const current = byBasename.get(basename) || [];
    current.push(fullPath);
    byBasename.set(basename, current);
  }

  return { byRelativePath, byBasename };
}

function resolveLegacyFile(imageValue, bucket, fileIndexes) {
  const normalized = normalizeLegacyPath(imageValue);

  if (!normalized) {
    return null;
  }

  if (fileIndexes.byRelativePath.has(normalized)) {
    return fileIndexes.byRelativePath.get(normalized);
  }

  const prefixed = `${bucket}/${normalized}`;
  if (fileIndexes.byRelativePath.has(prefixed)) {
    return fileIndexes.byRelativePath.get(prefixed);
  }

  const basename = path.basename(normalized);
  const basenameMatches = fileIndexes.byBasename.get(basename) || [];

  if (basenameMatches.length === 1) {
    return basenameMatches[0];
  }

  const bucketMatch = basenameMatches.find((filePath) => {
    const relativePath = path.relative(UPLOADS_DIR, filePath).replace(/\\/g, '/');
    return relativePath.startsWith(`${bucket}/`);
  });

  if (bucketMatch) {
    return bucketMatch;
  }

  return null;
}

async function fetchRows(table) {
  const pageSize = 1000;
  let from = 0;
  const rows = [];

  while (true) {
    const to = from + pageSize - 1;
    const { data, error } = await supabase
      .from(table)
      .select('id, images')
      .range(from, to);

    if (error) {
      throw new Error(`Error leyendo ${table}: ${error.message}`);
    }

    if (!data || data.length === 0) {
      break;
    }

    rows.push(...data);

    if (data.length < pageSize) {
      break;
    }

    from += pageSize;
  }

  return rows;
}

async function uploadLegacyFile(bucket, rowId, imageIndex, filePath) {
  const buffer = fs.readFileSync(filePath);
  if (buffer.length === 0) {
    throw new Error(`El archivo legacy está vacío: ${filePath}`);
  }

  const mimeType = guessMimeType(buffer, filePath);
  const originalExt = path.extname(filePath).toLowerCase();
  const ext = originalExt || extensionFromMime(mimeType);
  const storagePath = `legacy/${rowId}-${imageIndex}${ext}`;

  const { error } = await supabase.storage.from(bucket).upload(storagePath, buffer, {
    contentType: mimeType,
    upsert: true,
  });

  if (error) {
    throw new Error(`Error subiendo ${filePath} a ${bucket}: ${error.message}`);
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(storagePath);
  return data.publicUrl;
}

async function migrateTable({ table, bucket }, fileIndexes) {
  const rows = await fetchRows(table);
  let migratedImages = 0;
  let updatedRows = 0;
  let missingFiles = 0;

  console.log(`\nProcesando tabla "${table}" (${rows.length} registros)...`);

  for (const row of rows) {
    const images = normalizeImages(row.images);
    if (images.length === 0) {
      continue;
    }

    let rowChanged = false;
    const nextImages = [];

    for (let index = 0; index < images.length; index += 1) {
      const imageValue = images[index];

      if (isRemoteUrl(imageValue)) {
        nextImages.push(imageValue);
        continue;
      }

      const filePath = resolveLegacyFile(imageValue, bucket, fileIndexes);

      if (!filePath) {
        console.warn(`[${table}:${row.id}] No se encontró el archivo legacy para: ${imageValue}`);
        nextImages.push(imageValue);
        missingFiles += 1;
        continue;
      }

      if (DRY_RUN) {
        console.log(`[dry-run] ${table}:${row.id} -> ${filePath}`);
        nextImages.push(imageValue);
        migratedImages += 1;
        continue;
      }

      const publicUrl = await uploadLegacyFile(bucket, row.id, index, filePath);
      nextImages.push(publicUrl);
      rowChanged = true;
      migratedImages += 1;
    }

    if (!rowChanged || DRY_RUN) {
      continue;
    }

    const { error } = await supabase
      .from(table)
      .update({ images: nextImages })
      .eq('id', row.id);

    if (error) {
      throw new Error(`Error actualizando ${table}:${row.id}: ${error.message}`);
    }

    updatedRows += 1;
  }

  return { table, rows: rows.length, updatedRows, migratedImages, missingFiles };
}

async function main() {
  const fileIndexes = buildFileIndexes();

  console.log(DRY_RUN ? 'Ejecutando migración en modo dry-run...' : 'Migrando imágenes legacy a Supabase...');
  console.log(`Archivos legacy detectados: ${fileIndexes.byRelativePath.size}`);

  const summary = [];
  for (const target of targets) {
    summary.push(await migrateTable(target, fileIndexes));
  }

  console.log('\nResumen:');
  for (const item of summary) {
    console.log(
      `- ${item.table}: registros=${item.rows}, actualizados=${item.updatedRows}, imágenes migradas=${item.migratedImages}, faltantes=${item.missingFiles}`,
    );
  }

  if (DRY_RUN) {
    console.log('\nNo se escribieron cambios porque se ejecutó con --dry-run.');
  } else {
    console.log('\nMigración completada.');
  }
}

main().catch((error) => {
  console.error('\nLa migración falló.');
  console.error(error);
  process.exit(1);
});
