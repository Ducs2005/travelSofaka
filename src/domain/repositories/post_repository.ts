import { TravelPost } from '../entities/post';

export interface IPostRepository {
  getFeedPosts(): Promise<TravelPost[]>;
  createPost(post: Omit<TravelPost, 'id' | 'createdAt' | 'likesCount' | 'commentsCount' | 'timeAgo'>): Promise<TravelPost>;
  likePost(postId: string): Promise<void>;
}
