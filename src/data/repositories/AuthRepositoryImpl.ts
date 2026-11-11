import { IAuthRepository } from '@/domain/repositories/auth_repository';
import { UserProfile } from '@/domain/entities/user';
import { AuthRemoteDataSource } from '../datasources/remote/firestore/AuthRemoteDataSource';

const remote = new AuthRemoteDataSource();

export class AuthRepositoryImpl implements IAuthRepository {
  async loginWithEmail(email: string, password: string): Promise<UserProfile> {
    return remote.loginWithEmail(email, password);
  }

  async loginWithGoogle(): Promise<UserProfile> {
    // Google Sign-in cần EAS Build (không dùng được trong Expo Go)
    throw new Error('Google Sign-in chưa hỗ trợ trong Expo Go. Dùng Email/Password.');
  }

  async registerWithEmail(email: string, password: string, name: string): Promise<UserProfile> {
    return remote.registerWithEmail(email, password, name);
  }

  async logout(): Promise<void> {
    return remote.logout();
  }

  async getCurrentUser(): Promise<UserProfile | null> {
    return remote.getCurrentUser();
  }

  async updateProfile(profile: Partial<UserProfile>): Promise<UserProfile> {
    const current = remote.getCurrentUser();
    if (!current) throw new Error('Chưa đăng nhập');
    await remote.updateProfile(current.uid, profile);
    return { ...current, ...profile };
  }
}
