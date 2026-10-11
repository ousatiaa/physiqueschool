import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { getSupabase } from '@/lib/supabase';

const BUCKET = 'uploads';

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value || request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const formData = await request.formData();
    const file = formData.get('file') as File;
    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 });

    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Only image files are allowed' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const ext = file.name.includes('.') ? file.name.split('.').pop() : '';
    const safeExt = (ext || 'bin').replace(/[^a-zA-Z0-9]/g, '').slice(0, 8).toLowerCase();
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${safeExt}`;

    const supabase = getSupabase();
    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(filename, buffer, { contentType: file.type, upsert: false });
    if (error) {
      console.error('Storage upload error:', error);
      return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
    }

    const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(filename);

    return NextResponse.json({ url: pub.publicUrl, filename }, { status: 201 });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}