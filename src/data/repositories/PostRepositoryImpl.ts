import { IPostRepository } from '@/domain/repositories/post_repository';
import { TravelPost } from '@/domain/entities/post';
import { PostRemoteDataSource } from '../datasources/remote/firestore/PostRemoteDataSource';

const remote = new PostRemoteDataSource();

export class PostRepositoryImpl implements IPostRepository {
  async getFeedPosts(): Promise<TravelPost[]> {
    return remote.getFeedPosts();
  }

  async createPost(
    postData: Omit<TravelPost, 'id' | 'createdAt' | 'likesCount' | 'commentsCount' | 'timeAgo'>
  ): Promise<TravelPost> {
    return remote.createPost(postData);
  }

  async likePost(postId: string): Promise<void> {
    return remote.likePost(postId);
  }
}
