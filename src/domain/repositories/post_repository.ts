import {
  CommentInput,
  CreatePostInput,
  PostComment,
  TravelPost,
} from '../entities/post';

export interface IPostRepository {
  /** Đọc offline-first: trả cache SQLite ngay, sau đó làm mới từ Firestore khi có mạng */
  getFeedPosts(): Promise<TravelPost[]>;
  createPost(input: CreatePostInput): Promise<TravelPost>;
  likePost(postId: string): Promise<void>;
  unlikePost(postId: string): Promise<void>;
  getComments(postId: string): Promise<PostComment[]>;
  addComment(postId: string, comment: CommentInput): Promise<PostComment>;
  /** Số bài viết đang chờ Sync Engine đẩy lên Firestore */
  countPendingPosts(): Promise<number>;
}
