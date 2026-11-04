import { create } from 'zustand';
import { TravelPost } from '@/domain/entities/post';

interface SocialState {
  posts: TravelPost[];
  isLoading: boolean;

  // Actions
  addPost: (post: TravelPost) => void;
  likePost: (postId: string) => void;
}

export const useSocialStore = create<SocialState>((set) => ({
  posts: [
    {
      id: 'post_1',
      authorUid: 'user_minhanh',
      authorName: 'Minh Anh',
      authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100',
      destinationTag: '📍 Hoi An Ancient Town',
      imageUrl: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=600',
      caption: 'Night lantern boat ride with the CS uni squad! Best Cao Lầu & Bánh Mì Phượng 🏮🛶',
      likesCount: 128,
      commentsCount: 14,
      timeAgo: '2h ago',
      createdAt: Date.now() - 7200000,
    },
    {
      id: 'post_2',
      authorUid: 'user_baobao',
      authorName: 'Bảo Bảo',
      authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
      destinationTag: '📍 Da Lat Pine Hills',
      imageUrl: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=600',
      caption: 'Chilly morning coffee overlooking the pine forest ☕🌲',
      likesCount: 94,
      commentsCount: 8,
      timeAgo: '1d ago',
      createdAt: Date.now() - 86400000,
    },
  ],
  isLoading: false,

  addPost: (post) => set((state) => ({ posts: [post, ...state.posts] })),
  likePost: (postId) =>
    set((state) => ({
      posts: state.posts.map((p) =>
        p.id === postId ? { ...p, likesCount: p.likesCount + 1 } : p
      ),
    })),
}));
