import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { storage } from '@/core/firebase/firebaseConfig';
import { compressImageForUpload } from './imageCompression';
import type { CompressedImage } from './imageCompression';
import type { PostImageStorage } from './PostImageStorage';

/** Firebase Storage — yêu cầu project Firebase ở gói Blaze mới bật được bucket */
export class PostStorageDataSource implements PostImageStorage {
  compressImage(localUri: string): Promise<CompressedImage> {
    return compressImageForUpload(localUri);
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
