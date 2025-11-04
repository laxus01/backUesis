import { HttpException, HttpStatus, Injectable, OnModuleInit } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
  ) { }


  async getUsers(companyId?: number) {
    const whereCondition = companyId ? { company: { id: companyId } } : {};
    
    const users = await this.userRepository.find({ 
      where: whereCondition,
      relations: ['company'] 
    });
    
    return users.map(user => this.sanitizeUser(user));
  }

  async getUserById(id: number) {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['company'],
    });
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    return this.sanitizeUser(user);
  }

  async createUser(userData: CreateUserDto) {
    try {
      const hashedPassword = await this._hashPassword(userData.password);

      const userToCreate: Partial<User> = {
        ...userData,
        password: hashedPassword,
        company: userData.companyId ? { id: userData.companyId } as any : null,
      };

      const newUser = this.userRepository.create(userToCreate);
      const savedUser = await this.userRepository.save(newUser);
      return this.sanitizeUser(savedUser);
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new HttpException('User already exists', HttpStatus.CONFLICT);
      }
      throw new HttpException('Error creating user', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async updateUser(id: number, userData: Partial<CreateUserDto>) {
    if (userData.password) {
      userData.password = await this._hashPassword(userData.password);
    }

    const userToUpdate = await this.userRepository.preload({
      id,
      ...userData,
      company: userData.companyId ? { id: userData.companyId } as any : undefined,
    });

    if (!userToUpdate) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    try {
      const savedUser = await this.userRepository.save(userToUpdate);
      return this.sanitizeUser(savedUser);
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new HttpException('User already exists', HttpStatus.CONFLICT);
      }
      throw new HttpException('Error updating user', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async findOneByUserForAuth(username: string): Promise<User | undefined> {
    return this.userRepository.findOne({ where: { user: username }, relations: ['company'] });
  }

  async deleteUser(id: number) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    const removedUser = await this.userRepository.remove(user);
    return this.sanitizeUser(removedUser);
  }

  sanitizeUser(user: User) {
    const { password, ...rest } = user;
    return rest;
  }

  private async _hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt();
    return bcrypt.hash(password, salt);
  }
}
