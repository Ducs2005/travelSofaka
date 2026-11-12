/**
 * Kiểm thử upload ảnh lên Cloudinary bằng đúng cấu hình trong .env
 * (xác nhận cloud name + unsigned upload preset trước khi demo trên thiết bị).
 *
 *   node scripts/test_cloudinary_upload.mjs [đường-dẫn-ảnh]
 *
 * Không truyền đường dẫn thì script tự tải một ảnh JPEG mẫu từ Unsplash.
 */
import fs from 'node:fs';
import path from 'node:path';

function loadEnv() {
  const envPath = path.join(process.cwd(), '.env');
  if (!fs.existsSync(envPath)) return {};
  return Object.fromEntries(
    fs
      .readFileSync(envPath, 'utf8')
      .split(/\r?\n/)
      .filter((line) => /^[A-Z_]+=/.test(line))
      .map((line) => {
        const idx = line.indexOf('=');
        return [line.slice(0, idx), line.slice(idx + 1)];
      })
  );
}

const env = loadEnv();
const cloudName = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME || env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME;
const uploadPreset =
  process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET || env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

if (!cloudName || !uploadPreset) {
  console.error('Thiếu EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME hoặc EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET trong .env');
  process.exit(1);
}

const imagePath = process.argv[2];
const bytes = imagePath
  ? new Uint8Array(fs.readFileSync(imagePath))
  : new Uint8Array(
      await (await fetch('https://images.unsplash.com/photo-1528127269322-539801943592?w=1200&q=80')).arrayBuffer()
    );

console.log(`Cloud name: ${cloudName}`);
console.log(`Upload preset: ${uploadPreset}`);
console.log(`Ảnh kiểm thử: ${(bytes.length / 1024).toFixed(0)} KB`);

const form = new FormData();
form.append('upload_preset', uploadPreset);
form.append('file', new Blob([bytes], { type: 'image/jpeg' }), imagePath ? path.basename(imagePath) : 'probe.jpg');

const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
  method: 'POST',
  body: form,
});
const result = await response.json();

if (!response.ok) {
  console.error(`❌ Upload thất bại (HTTP ${response.status}):`, result.error?.message ?? result);
  process.exit(1);
}

console.log(`✅ Upload thành công (HTTP ${response.status})`);
console.log(`   ${result.bytes} bytes · ${result.format} · ${result.width}x${result.height}`);
console.log(`   secure_url: ${result.secure_url}`);
