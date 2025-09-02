export class CreateUserDto {
    user: string;
    password: string;
    permissions: string;
    name: string;
    companyId?: number;
}
