import { IAuthResponse } from '../interfaces/auth-manager.interface';

export class AuthResponseDto implements IAuthResponse {
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
    policy?: {
      id: number;
      insurerId: number;
      insurerName?: string;
      contractual?: string;
      contractualExpires?: string;
      extraContractual?: string;
      extraContractualExpires?: string;
      createdAt: Date;
    };
  };
}

export class LoginRequestDto {
  user: string;
  password: string;
}
