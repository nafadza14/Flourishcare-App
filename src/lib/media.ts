import type { MediaItem } from '../types';
import { sendJSON } from '../api';
import { SUPABASE_PUBLISHABLE_KEY } from './supabase';

/**
 * Photos are resized on the phone before upload (fast on mobile data, light on storage);
 * short videos are uploaded as they are. Files go straight to Supabase Storage with a
 * one-time upload link from our server, so large files never pass through the API.
 */

export const MAX_VIDEO_SECONDS = 60;
export const MAX_VIDEO_BYTES = 50 * 1024 * 1024;

export interface PreparedFile {
  blob: Blob;
  type: 'image' | 'video';
  contentType: string;
  width?: number;
  height?: number;
  /** Local preview URL (revoke when done) */
  previewUrl: string;
}

async function loadImage(file: Blob): Promise<{ draw: CanvasImageSource; width: number; height: number; close: () => void }> {
  if ('createImageBitmap' in window) {
    try {
      const bmp = await createImageBitmap(file, { imageOrientation: 'from-image' } as ImageBitmapOptions);
      return { draw: bmp, width: bmp.width, height: bmp.height, close: () => bmp.close() };
    } catch {
      /* fall back to <img> */
    }
  }
  const url = URL.createObjectURL(file);
  const img = new Image();
  img.decoding = 'async';
  img.src = url;
  await img.decode();
  return { draw: img, width: img.naturalWidth, height: img.naturalHeight, close: () => URL.revokeObjectURL(url) };
}

export async function compressImage(file: File, maxDim = 1600, quality = 0.82): Promise<PreparedFile> {
  const src = await loadImage(file);
  const scale = Math.min(1, maxDim / Math.max(src.width, src.height));
  const width = Math.round(src.width * scale);
  const height = Math.round(src.height * scale);
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Foto belum bisa diproses di perangkat ini.');
  ctx.drawImage(src.draw, 0, 0, width, height);
  src.close();
  const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Foto belum bisa diproses.'))), 'image/jpeg', quality));
  return { blob, type: 'image', contentType: 'image/jpeg', width, height, previewUrl: URL.createObjectURL(blob) };
}

function videoMeta(file: File): Promise<{ duration: number; width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const v = document.createElement('video');
    v.preload = 'metadata';
    v.muted = true;
    v.onloadedmetadata = () => {
      resolve({ duration: v.duration, width: v.videoWidth, height: v.videoHeight });
      URL.revokeObjectURL(url);
    };
    v.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Video tidak bisa dibaca. Coba format MP4.'));
    };
    v.src = url;
  });
}

export async function prepareFile(file: File): Promise<PreparedFile> {
  if (file.type.startsWith('image/')) return compressImage(file);
  if (file.type.startsWith('video/')) {
    if (file.size > MAX_VIDEO_BYTES) throw new Error('Video terlalu besar. Pilih video maksimal 50 MB (sekitar 1 menit).');
    const meta = await videoMeta(file).catch(() => null);
    if (meta && Number.isFinite(meta.duration) && meta.duration > MAX_VIDEO_SECONDS + 1) throw new Error(`Video maksimal ${MAX_VIDEO_SECONDS} detik. Potong dulu videonya ya.`);
    const contentType = ['video/mp4', 'video/quicktime', 'video/webm'].includes(file.type) ? file.type : 'video/mp4';
    return { blob: file, type: 'video', contentType, width: meta?.width, height: meta?.height, previewUrl: URL.createObjectURL(file) };
  }
  throw new Error('Pilih file foto atau video.');
}

/** Upload a prepared file for a child, returns the stored media item */
export async function uploadPrepared(childId: string, prepared: PreparedFile, purpose: 'journal' | 'avatar' = 'journal'): Promise<MediaItem> {
  const ticket = await sendJSON<{ path: string; uploadUrl: string; type: 'image' | 'video' }>('/api/media/upload-url', {
    childId,
    purpose,
    contentType: prepared.contentType,
    size: prepared.blob.size,
  });
  const res = await fetch(ticket.uploadUrl, {
    method: 'PUT',
    headers: { 'Content-Type': prepared.contentType, 'x-upsert': 'false', apikey: SUPABASE_PUBLISHABLE_KEY },
    body: prepared.blob,
  });
  if (!res.ok) throw new Error('Unggah gagal. Periksa koneksi lalu coba lagi.');
  return { path: ticket.path, type: prepared.type, width: prepared.width, height: prepared.height, url: prepared.previewUrl };
}
