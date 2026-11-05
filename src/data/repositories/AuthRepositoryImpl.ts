import { IAuthRepository } from '@/domain/repositories/auth_repository';
import { UserProfile } from '@/domain/entities/user';

export class AuthRepositoryImpl implements IAuthRepository {
  private currentUser: UserProfile | null = {
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
  };

  async loginWithEmail(email: string, _pass: string): Promise<UserProfile> {
    // In production, delegate to Firebase Auth signInWithEmailAndPassword
    this.currentUser = {
      uid: 'user_' + email.split('@')[0],
      email,
      displayName: email.split('@')[0],
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=160',
      tripsCount: 0,
      savedCount: 0,
      friendsCount: 0,
      createdAt: Date.now(),
    };
    return this.currentUser;
  }

  async loginWithGoogle(): Promise<UserProfile> {
    return this.currentUser!;
  }

  async registerWithEmail(email: string, _pass: string, name: string): Promise<UserProfile> {
    this.currentUser = {
      uid: 'user_' + Date.now(),
      email,
      displayName: name,
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=160',
      tripsCount: 0,
      savedCount: 0,
      friendsCount: 0,
      createdAt: Date.now(),
    };
    return this.currentUser;
  }

  async logout(): Promise<void> {
    this.currentUser = null;
  }

  async getCurrentUser(): Promise<UserProfile | null> {
    return this.currentUser;
  }

  async updateProfile(profile: Partial<UserProfile>): Promise<UserProfile> {
    if (!this.currentUser) throw new Error('Chưa đăng nhập');
    this.currentUser = { ...this.currentUser, ...profile };
    return this.currentUser;
  }
}
