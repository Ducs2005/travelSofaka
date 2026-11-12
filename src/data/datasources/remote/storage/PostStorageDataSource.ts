import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { storage } from '@/core/firebase/firebaseConfig';

/** Ảnh được thu nhỏ còn tối đa 1080px chiều ngang và nén JPEG quality 0.7 trước khi upload */
const MAX_IMAGE_WIDTH = 1080;
const JPEG_QUALITY = 0.7;

export interface CompressedImage {
  uri: string;
  contentType: string;
  fileExtension: string;
}

export class PostStorageDataSource {
  /** Nén ảnh ngay trên thiết bị (không cần mạng) để giảm dung lượng tải lên Firebase Storage */
  async compressImage(localUri: string): Promise<CompressedImage> {
    const context = ImageManipulator.manipulate(localUri).resize({ width: MAX_IMAGE_WIDTH });
    const rendered = await context.renderAsync();
    const saved = await rendered.saveAsync({
      compress: JPEG_QUALITY,
      format: SaveFormat.JPEG,
    });

    return { uri: saved.uri, contentType: 'image/jpeg', fileExtension: 'jpg' };
  }

  /** Nén rồi upload lên Firebase Storage, trả về URL tải công khai của ảnh */
  async uploadPostImage(localUri: string, authorUid: string): Promise<string> {
    const compressed = await this.compressImage(localUri);
    const blob = await this.readAsBlob(compressed.uri);
    const storageRef = ref(
      storage,
      `posts/${authorUid}/${Date.now()}.${compressed.fileExtension}`
    );

    await uploadBytes(storageRef, blob, { contentType: compressed.contentType });
    return getDownloadURL(storageRef);
  }

  private async readAsBlob(uri: string): Promise<Blob> {
    const response = await fetch(uri);
    return response.blob();
  }
}
