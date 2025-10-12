import { User } from '../../users/entities/user.entity';

export interface IAuthResponse {
  token: string;
  user: {
    id: string;
    name: string;
    user: string;
  };
}

export interface IAuthRepository {
  findUserByUsername(username: string): Promise<User | null>;
}

export const AUTH_REPOSITORY_TOKEN = 'AUTH_REPOSITORY';
