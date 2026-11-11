import { IPostRepository } from '@/domain/repositories/post_repository';
import { TravelPost } from '@/domain/entities/post';

export class GetFeedPostsUseCase {
  constructor(private readonly postRepository: IPostRepository) {}

  async execute(): Promise<TravelPost[]> {
    return this.postRepository.getFeedPosts();
  }
}

export class CreatePostUseCase {
  constructor(private readonly postRepository: IPostRepository) {}

  async execute(
    postData: Omit<TravelPost, 'id' | 'createdAt' | 'likesCount' | 'commentsCount' | 'timeAgo'>
  ): Promise<TravelPost> {
    if (!postData.imageUrl || !postData.caption) {
      throw new Error('Ảnh và nội dung bài viết không được để trống.');
    }
    return this.postRepository.createPost(postData);
  }
}
