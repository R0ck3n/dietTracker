import argon2 from 'argon2';
import { AppError } from '../lib/errors.js';
import { UserRepository } from '../repositories/user.repository.js';

export class AuthService {
  constructor(private readonly users = new UserRepository()) {}

  async login(username: string, password: string): Promise<{ userId: number; username: string }> {
    const user = this.users.findByUsername(username);
    if (!user) {
      throw new AppError('Identifiants invalides.', 401, 'INVALID_CREDENTIALS');
    }

    const valid = await argon2.verify(user.PasswordHash, password);
    if (!valid) {
      throw new AppError('Identifiants invalides.', 401, 'INVALID_CREDENTIALS');
    }

    return { userId: user.UserID, username: user.Username };
  }

  getProfile(userId: number): { userId: number; username: string } {
    const user = this.users.findById(userId);
    if (!user) {
      throw new AppError('Utilisateur introuvable.', 404, 'USER_NOT_FOUND');
    }

    return { userId: user.UserID, username: user.Username };
  }

  async createUser(username: string, password: string): Promise<{ userId: number; username: string }> {
    if (this.users.findByUsername(username)) {
      throw new AppError('Cet identifiant est déjà utilisé.', 409, 'USERNAME_TAKEN');
    }

    const passwordHash = await argon2.hash(password);
    const user = this.users.create(username, passwordHash);

    return { userId: user.UserID, username: user.Username };
  }

  async register(username: string, password: string): Promise<{ userId: number; username: string }> {
    return this.createUser(username, password);
  }

  hasUser(): boolean {
    return this.users.count() > 0;
  }
}
