import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';

/** Ảnh được thu nhỏ còn tối đa 1080px chiều ngang và nén JPEG quality 0.7 trước khi upload */
const MAX_IMAGE_WIDTH = 1080;
const JPEG_QUALITY = 0.7;

export interface CompressedImage {
  uri: string;
  contentType: string;
  fileExtension: string;
}

/** Nén ảnh ngay trên thiết bị (không cần mạng) để giảm 70–85% dung lượng tải lên cloud */
export async function compressImageForUpload(localUri: string): Promise<CompressedImage> {
  const context = ImageManipulator.manipulate(localUri).resize({ width: MAX_IMAGE_WIDTH });
  const rendered = await context.renderAsync();
  const saved = await rendered.saveAsync({ compress: JPEG_QUALITY, format: SaveFormat.JPEG });

  return { uri: saved.uri, contentType: 'image/jpeg', fileExtension: 'jpg' };
}
