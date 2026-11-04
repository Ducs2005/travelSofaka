import { create } from 'zustand';
import { UserProfile } from '@/domain/entities/user';

interface AuthState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  setUser: (user: UserProfile | null) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: {
    uid: 'user_viet_tran',
    email: 'viet.tran@student.edu.vn',
    displayName: 'Trần Quang Việt',
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=160',
    bio: 'Exploring Vietnam with friends 📸 | Coffee & cloud hunting enthusiast ☕⛰️',
    location: 'Da Nang, Vietnam',
    tripsCount: 12,
    savedCount: 8,
    friendsCount: 348,
    createdAt: Date.now(),
  },
  isAuthenticated: true,
  isLoading: false,
  error: null,

  setUser: (user) => set({ user, isAuthenticated: !!user }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  logout: () => set({ user: null, isAuthenticated: false }),
}));
