import { IPostRepository } from '@/domain/repositories/post_repository';
import {
  CommentInput,
  CreatePostInput,
  PostComment,
  TravelPost,
} from '@/domain/entities/post';

export class GetFeedPostsUseCase {
  constructor(private readonly postRepository: IPostRepository) {}

  async execute(): Promise<TravelPost[]> {
    return this.postRepository.getFeedPosts();
  }
}

export class CreatePostUseCase {
  constructor(private readonly postRepository: IPostRepository) {}

  async execute(input: CreatePostInput): Promise<TravelPost> {
    if (!input.caption.trim()) {
      throw new Error('Nội dung bài viết không được để trống.');
    }
    if (!input.localImageUri && !input.imageUrl) {
      throw new Error('Vui lòng chọn ảnh cho bài viết.');
    }
    return this.postRepository.createPost({ ...input, caption: input.caption.trim() });
  }
}

export class ToggleLikePostUseCase {
  constructor(private readonly postRepository: IPostRepository) {}

  async execute(postId: string, isLiked: boolean): Promise<void> {
    if (isLiked) {
      return this.postRepository.unlikePost(postId);
    }
    return this.postRepository.likePost(postId);
  }
}

export class GetPostCommentsUseCase {
  constructor(private readonly postRepository: IPostRepository) {}

  async execute(postId: string): Promise<PostComment[]> {
    return this.postRepository.getComments(postId);
  }
}

export class AddCommentUseCase {
  constructor(private readonly postRepository: IPostRepository) {}

  async execute(postId: string, comment: CommentInput): Promise<PostComment> {
    if (!comment.body.trim()) {
      throw new Error('Nội dung bình luận không được để trống.');
    }
    return this.postRepository.addComment(postId, { ...comment, body: comment.body.trim() });
  }
}
