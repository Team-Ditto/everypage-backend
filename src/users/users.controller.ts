import { Controller, Get, Post, Body, Put, UseGuards, Req } from '@nestjs/common';

import { FirebaseAuthGuard } from '../firebase/firebase-auth.guard';
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto } from './dto';
import { Request, Response } from 'express';

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

    @Get('me')
    @UseGuards(FirebaseAuthGuard)
    myProfile(@Req() req: Request) {
        return this.usersService.myProfile(req);
    }

    @Put('me')
    @UseGuards(FirebaseAuthGuard)
    update(@Req() req: Request, @Body() updateUserDto: UpdateUserDto) {
        return this.usersService.update(req, updateUserDto);
    }
}
