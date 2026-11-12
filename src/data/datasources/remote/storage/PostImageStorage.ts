import { CloudinaryStorageDataSource } from './CloudinaryStorageDataSource';
import { PostStorageDataSource } from './PostStorageDataSource';
import { compressImageForUpload } from './imageCompression';
import type { CompressedImage } from './imageCompression';

/** Cổng lưu trữ ảnh bài viết — cho phép đổi nhà cung cấp mà không đụng tới repository */
export interface PostImageStorage {
  compressImage(localUri: string): Promise<CompressedImage>;
  /** Nén ảnh rồi upload, trả về URL công khai */
  uploadPostImage(localUri: string, authorUid: string): Promise<string>;
}

/**
 * Chọn nhà cung cấp theo biến môi trường:
 * - Có `EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME`  → Cloudinary (miễn phí 25GB, không cần thẻ)
 * - Không có                                → Firebase Storage (yêu cầu project ở gói Blaze)
 */
export function createPostImageStorage(): PostImageStorage {
  return process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME
    ? new CloudinaryStorageDataSource()
    : new PostStorageDataSource();
}

export { compressImageForUpload };
export type { CompressedImage };
