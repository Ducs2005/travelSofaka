import { compressImageForUpload } from './imageCompression';
import type { CompressedImage } from './imageCompression';
import type { PostImageStorage } from './PostImageStorage';

const CLOUD_NAME = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

interface CloudinaryUploadResponse {
  secure_url?: string;
  public_id?: string;
  error?: { message?: string };
}

/**
 * Cloudinary — gói miễn phí 25GB, không cần thẻ thanh toán.
 * Upload trực tiếp từ client bằng "unsigned upload preset" (không nhúng API secret vào app).
 */
export class CloudinaryStorageDataSource implements PostImageStorage {
  compressImage(localUri: string): Promise<CompressedImage> {
    return compressImageForUpload(localUri);
  }

  async uploadPostImage(localUri: string, authorUid: string): Promise<string> {
    if (!CLOUD_NAME || !UPLOAD_PRESET) {
      throw new Error(
        'Chưa cấu hình EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME / EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET trong .env'
      );
    }

    const compressed = await this.compressImage(localUri);
    const formData = new FormData();
    formData.append('upload_preset', UPLOAD_PRESET);
    formData.append(
      'file',
      {
        uri: compressed.uri,
        name: `post_${authorUid}_${Date.now()}.${compressed.fileExtension}`,
        type: compressed.contentType,
      } as unknown as Blob
    );

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
      { method: 'POST', body: formData }
    );
    const json = (await response.json()) as CloudinaryUploadResponse;

    if (!response.ok || !json.secure_url) {
      throw new Error(json.error?.message ?? 'Upload ảnh lên Cloudinary thất bại.');
    }
    return json.secure_url;
  }
}
