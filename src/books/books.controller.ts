import { Controller, Get, Post, Body, Put, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { Request } from 'express';

import { FirebaseAuthGuard } from 'src/firebase/firebase-auth.guard';
import { BooksService } from './books.service';
import { CreateBookDto, UpdateBookDto } from './dto';

@Controller('books')
@UseGuards(FirebaseAuthGuard)
export class BooksController {
    constructor(private readonly booksService: BooksService) {}

    @Post()
    createNewBook(@Req() req: Request, @Body() createBookDto: CreateBookDto) {
        return this.booksService.createNewBook(req, createBookDto);
    }

    @Get('mine')
    getMyBooks(@Req() req: Request) {
        return this.booksService.getMyBooks(req);
    }

    @Get('all')
    getAllBooks() {
        return this.booksService.getAllBooks();
    }

    @Get('user/:id')
    getUserBooks(@Param('id') id: string) {
        return this.booksService.getUserBooks(id);
    }

    @Get(':id')
    getBookById(@Param('id') id: string) {
        return this.booksService.getBookById(id);
    }

    @Put(':id')
    updateBookById(@Param('id') id: string, @Body() updateBookDto: UpdateBookDto) {
        return this.booksService.updateBookById(id, updateBookDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.booksService.remove(id);
    }
}
