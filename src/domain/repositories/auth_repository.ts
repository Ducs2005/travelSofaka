import { UserProfile } from '../entities/user';

export interface IAuthRepository {
  loginWithEmail(email: string, pass: string): Promise<UserProfile>;
  loginWithGoogle(): Promise<UserProfile>;
  registerWithEmail(email: string, pass: string, name: string): Promise<UserProfile>;
  logout(): Promise<void>;
  getCurrentUser(): Promise<UserProfile | null>;
  updateProfile(profile: Partial<UserProfile>): Promise<UserProfile>;
}
