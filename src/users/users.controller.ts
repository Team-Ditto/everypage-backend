import { Controller, Get, Post, Body, Put, Param, UseGuards } from '@nestjs/common';

import { FirebaseAuthGuard } from '../firebase/firebase-auth.guard';
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto } from './dto';
import { Response } from 'express';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Post()
    async createNewUser(@Body() createUserDto: CreateUserDto): Promise<Response> {
        return this.usersService.createNewUser(createUserDto);
    }

    @Get()
    @UseGuards(FirebaseAuthGuard)
    findAll() {
        return this.usersService.findAll();
    }

    @Put(':id')
    @UseGuards(FirebaseAuthGuard)
    update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
        return this.usersService.update(+id, updateUserDto);
    }
}
