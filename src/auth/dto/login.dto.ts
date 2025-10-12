import { IsString, IsNotEmpty, MinLength, MaxLength } from 'class-validator';

export class LoginAuthDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(50)
    user: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(6)
    @MaxLength(100)
    password: string;
}