export interface TravelPost {
  id: string;
  authorUid: string;
  authorName: string;
  authorAvatar: string;
  destinationTag: string; // e.g. "📍 Ha Long Bay, Quang Ninh"
  imageUrl: string;
  caption: string;
  likesCount: number;
  commentsCount: number;
  timeAgo: string;
  createdAt: number;
  /** false khi bài viết chỉ mới nằm trong SQLite và đang chờ Sync Engine đẩy lên Firestore */
  isSynced?: boolean;
}

/** Dữ liệu người dùng gửi lên từ Screen 09 trước khi ảnh được nén & upload */
export interface CreatePostInput {
  authorUid: string;
  authorName: string;
  authorAvatar: string;
  destinationTag: string;
  caption: string;
  /** Ảnh chụp/chọn từ thiết bị (file:// hoặc content://) — sẽ được nén trước khi upload */
  localImageUri?: string;
  /** Ảnh đã có sẵn URL từ xa (dùng khi không chọn ảnh mới) */
  imageUrl?: string;
}

export interface PostComment {
  id: string;
  postId: string;
  authorUid: string;
  authorName: string;
  authorAvatar: string;
  body: string;
  createdAt: number;
}

export interface CommentInput {
  authorUid: string;
  authorName: string;
  authorAvatar: string;
  body: string;
}
