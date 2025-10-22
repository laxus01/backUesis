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
      contractual?: string;
      contractualExpires?: string;
      extraContractual?: string;
      extraContractualExpires?: string;
    };
  };
}

export class LoginRequestDto {
  user: string;
  password: string;
}
