import { create } from 'zustand';
import { CreatePostInput, PostComment, TravelPost } from '@/domain/entities/post';
import { SyncResult } from '@/domain/entities/sync';
import {
  AddCommentUseCase,
  CreatePostUseCase,
  GetFeedPostsUseCase,
  GetPostCommentsUseCase,
  ToggleLikePostUseCase,
} from '@/domain/usecases/post/PostUseCases';
import { PostRepositoryImpl } from '@/data/repositories/PostRepositoryImpl';
import { syncEngine } from '@/data/datasources/sync';
import { useAuthStore } from '@/presentation/stores/authStore';

const postRepository = new PostRepositoryImpl();
const getFeedPosts = new GetFeedPostsUseCase(postRepository);
const createPost = new CreatePostUseCase(postRepository);
const toggleLikePost = new ToggleLikePostUseCase(postRepository);
const getPostComments = new GetPostCommentsUseCase(postRepository);
const addPostComment = new AddCommentUseCase(postRepository);

/** Tác giả mặc định khi chưa đăng nhập (chế độ xem thử) */
const DEMO_AUTHOR = {
  uid: 'user_lam_nguyen',
  name: 'Tùng Lâm',
  avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120',
};

export function resolveCurrentAuthor() {
  const user = useAuthStore.getState().user;
  if (user) {
    return { uid: user.uid, name: user.displayName, avatar: user.avatarUrl ?? DEMO_AUTHOR.avatar };
  }
  return DEMO_AUTHOR;
}

export interface PublishPostInput {
  caption: string;
  destinationTag: string;
  localImageUri?: string;
}

interface SocialState {
  posts: TravelPost[];
  commentsByPost: Record<string, PostComment[]>;
  likedPostIds: string[];
  pendingCount: number;
  isOnline: boolean;
  isLoading: boolean;
  isRefreshing: boolean;
  isPublishing: boolean;
  error: string | null;

  loadFeed: (options?: { silent?: boolean }) => Promise<void>;
  publishPost: (input: PublishPostInput) => Promise<TravelPost>;
  toggleLike: (postId: string) => Promise<void>;
  loadComments: (postId: string) => Promise<void>;
  addComment: (postId: string, body: string) => Promise<void>;
  syncPending: () => Promise<SyncResult>;
  refreshPendingCount: () => Promise<void>;
  clearError: () => void;
}

export const useSocialStore = create<SocialState>((set, get) => ({
  posts: [],
  commentsByPost: {},
  likedPostIds: [],
  pendingCount: 0,
  isOnline: true,
  isLoading: false,
  isRefreshing: false,
  isPublishing: false,
  error: null,

  loadFeed: async (options) => {
    const silent = options?.silent === true;
    set(silent ? { isRefreshing: true } : { isLoading: true, error: null });
    try {
      const [posts, pendingCount] = await Promise.all([
        getFeedPosts.execute(),
        postRepository.countPendingPosts(),
      ]);
      set({
        posts,
        pendingCount,
        isOnline: syncEngine.isOnline(),
        isLoading: false,
        isRefreshing: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Không tải được bảng tin.',
        isLoading: false,
        isRefreshing: false,
      });
    }
  },

  publishPost: async (input) => {
    const author = resolveCurrentAuthor();
    const payload: CreatePostInput = {
      authorUid: author.uid,
      authorName: author.name,
      authorAvatar: author.avatar,
      destinationTag: input.destinationTag,
      caption: input.caption,
      localImageUri: input.localImageUri,
    };

    set({ isPublishing: true, error: null });
    try {
      const published = await createPost.execute(payload);
      set((state) => ({
        posts: [published, ...state.posts.filter((post) => post.id !== published.id)],
        isPublishing: false,
      }));
      await get().refreshPendingCount();
      return published;
    } catch (error) {
      set({
        isPublishing: false,
        error: error instanceof Error ? error.message : 'Không đăng được bài viết.',
      });
      throw error;
    }
  },

  toggleLike: async (postId) => {
    const { posts, likedPostIds } = get();
    if (!posts.some((post) => post.id === postId)) return;

    const wasLiked = likedPostIds.includes(postId);
    set({
      likedPostIds: wasLiked
        ? likedPostIds.filter((id) => id !== postId)
        : [...likedPostIds, postId],
      posts: posts.map((post) =>
        post.id === postId
          ? { ...post, likesCount: Math.max(0, post.likesCount + (wasLiked ? -1 : 1)) }
          : post
      ),
    });

    try {
      await toggleLikePost.execute(postId, wasLiked);
      await get().refreshPendingCount();
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Không cập nhật được lượt thích.' });
    }
  },

  loadComments: async (postId) => {
    try {
      const comments = await getPostComments.execute(postId);
      set((state) => ({
        commentsByPost: { ...state.commentsByPost, [postId]: comments },
      }));
    } catch (_error) {
      set({ error: 'Cần kết nối mạng để tải bình luận.' });
    }
  },

  addComment: async (postId, body) => {
    const author = resolveCurrentAuthor();
    try {
      const comment = await addPostComment.execute(postId, {
        authorUid: author.uid,
        authorName: author.name,
        authorAvatar: author.avatar,
        body,
      });
      set((state) => ({
        commentsByPost: {
          ...state.commentsByPost,
          [postId]: [...(state.commentsByPost[postId] ?? []), comment],
        },
        posts: state.posts.map((post) =>
          post.id === postId ? { ...post, commentsCount: post.commentsCount + 1 } : post
        ),
      }));
    } catch (_error) {
      set({ error: 'Cần kết nối mạng để bình luận.' });
    }
  },

  syncPending: async () => {
    const result = await syncEngine.syncNow();
    set({ pendingCount: result.remaining, isOnline: syncEngine.isOnline() });
    if (result.pushed > 0) {
      await get().loadFeed({ silent: true });
    }
    return result;
  },

  refreshPendingCount: async () => {
    const pendingCount = await postRepository.countPendingPosts();
    set({ pendingCount });
  },

  clearError: () => set({ error: null }),
}));

// Sync Engine báo kết quả mỗi lượt đồng bộ (kể cả khi tự động chạy lúc có mạng trở lại)
syncEngine.subscribe((result) => {
  useSocialStore.setState({ pendingCount: result.remaining });
  if (result.pushed > 0) {
    void useSocialStore.getState().loadFeed({ silent: true });
  }
});
