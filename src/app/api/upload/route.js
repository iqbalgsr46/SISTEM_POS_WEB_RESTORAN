import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { canAccess } from '@/lib/staff-auth-core.mjs';
import { writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  const url = new URL(request.url);
  const origin = request.headers.get('origin');
  const expectedOrigin = new URL(process.env.NEXTAUTH_URL || url.origin).origin;
  if (origin && origin !== expectedOrigin) {
    return NextResponse.json({ message: 'Origin rejected' }, { status: 403 });
  }

  const session = await getServerSession(authOptions);
  if (!session || !canAccess(session.user?.account, ['admin'])) {
    return NextResponse.json({ message: 'Akses ditolak. Hanya admin yang diizinkan mengunggah gambar menu.' }, { status: 403 });
  }

  let formData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ message: 'Data formulir tidak valid.' }, { status: 400 });
  }

  const file = formData.get('file');
  if (!file || typeof file === 'string') {
    return NextResponse.json({ message: 'Pilih file gambar untuk diunggah.' }, { status: 400 });
  }

  const MAX_SIZE = 5 * 1024 * 1024;
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ message: 'Ukuran file terlalu besar. Maksimal 5 MB.' }, { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  if (buffer.length < 8) {
    return NextResponse.json({ message: 'File gambar rusak atau kosong.' }, { status: 400 });
  }

  let extension = null;
  if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47 && buffer[4] === 0x0D && buffer[5] === 0x0A && buffer[6] === 0x1A && buffer[7] === 0x0A) {
    extension = 'png';
  } else if (buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF) {
    extension = 'jpg';
  } else if (buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.toString('ascii', 8, 12) === 'WEBP') {
    extension = 'webp';
  } else if (buffer.length >= 12 && buffer.toString('ascii', 4, 12).includes('avif')) {
    extension = 'avif';
  }

  if (!extension) {
    return NextResponse.json({ message: 'Format gambar harus PNG, JPG, JPEG, atau WebP.' }, { status: 400 });
  }

  const rawName = (file.name || 'menu')
    .toLowerCase()
    .replace(/\.[^/.]+$/, '')
    .replace(/[^a-z0-9_-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 32);
  const safeName = rawName || 'menu';
  const uniqueId = `${Date.now().toString(36)}-${crypto.randomBytes(3).toString('hex')}`;
  const fileName = `${safeName}-${uniqueId}.${extension}`;

  const targetDir = path.join(process.cwd(), 'public', 'images', 'menu');
  await mkdir(targetDir, { recursive: true });
  await writeFile(path.join(targetDir, fileName), buffer);

  return NextResponse.json({
    ok: true,
    url: `/images/menu/${fileName}`,
    name: fileName,
    size: buffer.length,
  }, { status: 201 });
}
