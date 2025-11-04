import { Controller, Get, Param, Post, Body, Put, Delete, ParseIntPipe, Headers } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Get()
    async getUsers(@Headers('companyid') companyId?: string) {
        const parsedCompanyId = companyId ? parseInt(companyId, 10) : undefined;
        return this.usersService.getUsers(parsedCompanyId);
    }

    @Get(':id')
    async getUserById(@Param('id', ParseIntPipe) id: number) {
        return this.usersService.getUserById(id);
    }

    @Post()
    async createUser(@Body() user: CreateUserDto) {
        return this.usersService.createUser(user);
    }

    @Put(':id')
    async updateUser(@Param('id', ParseIntPipe) id: number, @Body() user: CreateUserDto) {
        return this.usersService.updateUser(id, user);
    }

    @Delete(':id')
    async deleteUser(@Param('id', ParseIntPipe) id: number) {
        return this.usersService.deleteUser(id);
    }
}
