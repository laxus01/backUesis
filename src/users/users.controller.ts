import { Controller, Get, Param, Post, Body, Put, Delete } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Get()
    async getUsers() {
        return this.usersService.getUsers();
    }

    @Get(':id')
    async getUserById(@Param('id') id: number) {
        return this.usersService.getUserById(id);
    }

    @Post()
    async createUser(@Body() user: CreateUserDto) {
        console.log(user);
        return this.usersService.createUser(user);
    }

    @Put(':id')
    async updateUser(@Param('id') id: number, @Body() user: CreateUserDto) {
        return this.usersService.updateUser(id, user);
    }

    @Delete(':id')
    async deleteUser(@Param('id') id: number) {
        return this.usersService.deleteUser(id);
    }
}
