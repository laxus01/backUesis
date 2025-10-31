import { User } from '../../users/entities/user.entity';

export interface IAuthResponse {
  token: string;
  user: {
    id: string;
    name: string;
    user: string;
    permissions: string;
    company?: {
      id: string;
      name: string;
      nit: string;
      phone: string;
      address: string;
    };
  };
}

export interface IAuthRepository {
  findUserByUsername(username: string): Promise<User | null>;
}

export const AUTH_REPOSITORY_TOKEN = 'AUTH_REPOSITORY';
