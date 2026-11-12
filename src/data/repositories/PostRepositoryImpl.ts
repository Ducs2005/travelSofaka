import { IPostRepository } from '@/domain/repositories/post_repository';
import {
  CommentInput,
  CreatePostInput,
  PostComment,
  TravelPost,
} from '@/domain/entities/post';
import { formatRelativeTime } from '@/core/utils/relativeTime';
import { PostLocalDataSource } from '../datasources/local/sqlite/PostLocalDataSource';
import { SyncQueueLocalDataSource } from '../datasources/local/sqlite/SyncQueueLocalDataSource';
import { PostRemoteDataSource } from '../datasources/remote/firestore/PostRemoteDataSource';
import { PostStorageDataSource } from '../datasources/remote/storage/PostStorageDataSource';
import { mergeFeedPosts } from './feedMerge';

function randomSuffix(): string {
  return Math.random().toString(36).slice(2, 7);
}

/** Lỗi do thiết bị mất mạng (khác với lỗi quyền / tài liệu không tồn tại) */
function isConnectivityError(error: unknown): boolean {
  const code = (error as { code?: string } | null)?.code;
  if (!code) return true;
  return code === 'unavailable' || code === 'failed-precondition' || code === 'deadline-exceeded';
}

/**
 * OFF-02: Repository đọc/ghi Offline-First cho bảng tin.
 * - Đọc: trả dữ liệu tức thì từ SQLite (posts_cache), làm mới từ Firestore khi có mạng.
 * - Ghi: luôn ghi được vào SQLite; khi ngoại tuyến bản ghi được đánh dấu is_synced = 0
 *   và xếp vào sync_queue để Sync Engine đẩy lên Cloud Firestore sau.
 */
export class PostRepositoryImpl implements IPostRepository {
  constructor(
    private readonly localDataSource: PostLocalDataSource = new PostLocalDataSource(),
    private readonly syncQueue: SyncQueueLocalDataSource = new SyncQueueLocalDataSource(),
    private readonly remote: PostRemoteDataSource = new PostRemoteDataSource(),
    private readonly storage: PostStorageDataSource = new PostStorageDataSource()
  ) {}

  async getFeedPosts(): Promise<TravelPost[]> {
    const cached = await this.localDataSource.getCachedPosts();

    try {
      const remotePosts = await this.remote.getFeedPosts();
      if (remotePosts.length > 0) {
        await this.localDataSource.savePosts(remotePosts);
      }

      // Bài tạo lúc ngoại tuyến chưa đẩy được lên cloud vẫn phải hiện trong bảng tin
      const merged = mergeFeedPosts(cached, remotePosts);
      if (merged.length > 0) return merged;

      // Firestore trống nhưng máy còn dữ liệu cũ: hiển thị cache thay vì màn hình trống
      if (cached.length > 0) return cached;
      return this.seedDemoPosts();
    } catch (_error) {
      // Ngoại tuyến: dùng cache SQLite
      if (cached.length > 0) return cached;
      return this.seedDemoPosts();
    }
  }

  async createPost(input: CreatePostInput): Promise<TravelPost> {
    const createdAt = Date.now();
    let imageUrl = input.imageUrl ?? '';
    let localImageUri: string | undefined;

    if (input.localImageUri) {
      try {
        // SOC-03: nén ảnh trên client rồi mới upload lên Firebase Storage
        imageUrl = await this.storage.uploadPostImage(input.localImageUri, input.authorUid);
      } catch (_error) {
        // Ngoại tuyến hoặc upload lỗi: giữ ảnh cục bộ, Sync Engine sẽ upload lại sau
        localImageUri = input.localImageUri;
        imageUrl = input.localImageUri;
      }
    }

    const post: TravelPost = {
      id: `post_${createdAt}_${randomSuffix()}`,
      authorUid: input.authorUid,
      authorName: input.authorName,
      authorAvatar: input.authorAvatar,
      destinationTag: input.destinationTag,
      caption: input.caption,
      imageUrl,
      likesCount: 0,
      commentsCount: 0,
      timeAgo: 'Just now',
      createdAt,
      isSynced: false,
    };

    if (!localImageUri) {
      try {
        const remotePost = await this.remote.createPost({
          authorUid: post.authorUid,
          authorName: post.authorName,
          authorAvatar: post.authorAvatar,
          destinationTag: post.destinationTag,
          caption: post.caption,
          imageUrl: post.imageUrl,
        });
        // Giữ nguyên id Firestore để các lượt like/comment sau trỏ đúng tài liệu
        const syncedPost: TravelPost = { ...remotePost, isSynced: true };
        await this.localDataSource.savePost(syncedPost);
        return syncedPost;
      } catch (_error) {
        // Firestore không truy cập được -> xếp hàng đồng bộ
      }
    }

    await this.localDataSource.savePost(post);
    await this.syncQueue.enqueue('posts', 'INSERT', { ...post, localImageUri });
    return post;
  }

  async likePost(postId: string): Promise<void> {
    await this.changeLikes(postId, 1);
  }

  async unlikePost(postId: string): Promise<void> {
    await this.changeLikes(postId, -1);
  }

  async getComments(postId: string): Promise<PostComment[]> {
    return this.remote.getComments(postId);
  }

  async addComment(postId: string, comment: CommentInput): Promise<PostComment> {
    return this.remote.addComment(postId, comment);
  }

  async countPendingPosts(): Promise<number> {
    return this.syncQueue.countPending();
  }

  /** Tăng/giảm lượt thích: ưu tiên Firestore, ngoại tuyến thì cập nhật cache và xếp hàng đồng bộ */
  private async changeLikes(postId: string, delta: 1 | -1): Promise<void> {
    try {
      if (delta > 0) {
        await this.remote.likePost(postId);
      } else {
        await this.remote.unlikePost(postId);
      }
      return;
    } catch (error) {
      const cached = await this.localDataSource.getCachedPosts();
      const cachedPost = cached.find((post) => post.id === postId);
      if (!cachedPost) return;

      const updated: TravelPost = {
        ...cachedPost,
        likesCount: Math.max(0, cachedPost.likesCount + delta),
        isSynced: false,
      };
      await this.localDataSource.savePost(updated);

      // Chỉ xếp hàng đồng bộ khi lỗi do mất mạng; lỗi quyền/tài liệu không tồn tại thì thử lại cũng vô ích
      if (isConnectivityError(error)) {
        await this.syncQueue.enqueue('posts', 'UPDATE', updated);
      }
    }
  }

  /** Dữ liệu mẫu cho lần chạy đầu tiên (khi cả Firestore và SQLite đều trống) */
  private async seedDemoPosts(): Promise<TravelPost[]> {
    const now = Date.now();
    const seeds: TravelPost[] = [
      {
        id: 'post_seed_hoian',
        authorUid: 'user_minhanh',
        authorName: 'Minh Anh',
        authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120',
        destinationTag: '📍 Hoi An Ancient Town',
        imageUrl: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=800',
        caption: 'Night lantern boat ride with the CS uni squad! Best Cao Lầu & Bánh Mì Phượng 🏮🛶',
        likesCount: 128,
        commentsCount: 14,
        timeAgo: formatRelativeTime(now - 2 * 3600000),
        createdAt: now - 2 * 3600000,
        isSynced: true,
      },
      {
        id: 'post_seed_dalat',
        authorUid: 'user_baobao',
        authorName: 'Bảo Bảo',
        authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120',
        destinationTag: '📍 Da Lat Pine Hills',
        imageUrl: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=800',
        caption: 'Chilly morning coffee overlooking the pine forest ☕🌲',
        likesCount: 94,
        commentsCount: 8,
        timeAgo: formatRelativeTime(now - 86400000),
        createdAt: now - 86400000,
        isSynced: true,
      },
    ];

    await this.localDataSource.savePosts(seeds);
    return seeds;
  }
}
