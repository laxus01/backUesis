import { HttpException, HttpStatus, Injectable, OnModuleInit } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService implements OnModuleInit {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}

  async onModuleInit() {
    const user = await this.userRepository.findOne({
      where: { user: 'testuser_2025' },
    });

    if (!user) {
      const newUser: CreateUserDto = {
        user: 'testuser_2025',
        password: 'password123',
        permissions: 'user',
        name: 'Test User',
      };
      await this.createUser(newUser);
      console.log('Default user created.');
    }
  }

  async getUsers() {
    const users = await this.userRepository.find({ relations: ['company'] });
    return users.map(({ password, ...rest }) => rest);
  }

  async getUserById(id: number) {
    const found = await this.userRepository.findOne({
      where: { id },
      relations: ['company'],
    });
    if (!found) return null as any;
    const { password, ...rest } = found as any;
    return rest;
  }

    async createUser(user: CreateUserDto) {
    try {
      const salt = await bcrypt.genSalt();
      const hashedPassword = await bcrypt.hash(user.password, salt);
      const userToCreate: any = {
        user: user.user,
        password: hashedPassword,
        permissions: user.permissions,
        name: user.name,
      };
      if (user.companyId) {
        userToCreate.company = { id: user.companyId } as any;
      }
      const newUser = this.userRepository.create(userToCreate);
      const saved = await this.userRepository.save(newUser);
      const { password, ...rest } = saved as any;
      return rest;
    } catch (error) {
      console.error('Error creating user:', error);
      if (error.code === 'ER_DUP_ENTRY') {
        // Specific to MySQL for duplicate entry
        throw new HttpException('User already exists', HttpStatus.CONFLICT);
      }
      throw new HttpException(
        'Error creating user',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

    async updateUser(id: number, user: Partial<CreateUserDto>) {
    const existingUser = await this.userRepository.findOne({
      where: { id },
    });
    if (!existingUser) {
      throw new Error('User not found');
    }

    if (user.password) {
      const salt = await bcrypt.genSalt();
      user.password = await bcrypt.hash(user.password, salt);
    }

    // Map relation update if provided
    if (user.companyId !== undefined) {
      (existingUser as any).company = user.companyId ? ({ id: user.companyId } as any) : null as any;
    }
    const updatedUser = { ...existingUser, ...user } as any;
    const saved = await this.userRepository.save(updatedUser);
    const { password, ...rest } = saved as any;
    return rest;
  }

  async deleteUser(id: number) {
    const existingUser = await this.userRepository.findOne({
      where: { id },
      relations: ['company'],
    });
    if (!existingUser) {
      throw new Error('User not found');
    }
    const removed = await this.userRepository.remove(existingUser);
    const { password, ...rest } = removed as any;
    return rest;
  }
}
