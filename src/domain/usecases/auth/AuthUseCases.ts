import { IAuthRepository } from '@/domain/repositories/auth_repository';
import { UserProfile } from '@/domain/entities/user';

export class LoginWithEmailUseCase {
  constructor(private readonly authRepository: IAuthRepository) {}

  async execute(email: string, pass: string): Promise<UserProfile> {
    if (!email || !pass) {
      throw new Error('Email và mật khẩu không được để trống.');
    }
    return this.authRepository.loginWithEmail(email, pass);
  }
}

export class RegisterWithEmailUseCase {
  constructor(private readonly authRepository: IAuthRepository) {}

  async execute(email: string, pass: string, name: string): Promise<UserProfile> {
    if (!email || !pass || !name) {
      throw new Error('Họ tên, email và mật khẩu là bắt buộc.');
    }
    return this.authRepository.registerWithEmail(email, pass, name);
  }
}
