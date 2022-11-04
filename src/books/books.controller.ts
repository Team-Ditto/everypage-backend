import { Controller, Get, Post, Body, Put, Param, Delete, UseGuards, Req, Query } from '@nestjs/common';
import { Request } from 'express';

import { FirebaseAuthGuard } from 'src/firebase/firebase-auth.guard';
import { BooksService } from './books.service';
import { CreateBookDto, UpdateBookDto, BookFilterCriteria } from './dto';

@Controller('books')
@UseGuards(FirebaseAuthGuard)
export class BooksController {
    constructor(private readonly booksService: BooksService) {}

    @Post()
    createNewBook(@Req() req: Request, @Body() createBookDto: CreateBookDto) {
        return this.booksService.createNewBook(req, createBookDto);
    }

    @Get('mine')
    getMyBooks(@Req() req: Request, @Query() filterCriteria: BookFilterCriteria) {
        return this.booksService.getMyBooks(req, filterCriteria);
    }

    @Get('all')
    getAllBooks(@Query() filterCriteria: BookFilterCriteria) {
        return this.booksService.getAllBooks(filterCriteria);
    }

    @Get('users')
    getUserBooks(@Req() req: Request, @Query() filterCriteria: BookFilterCriteria) {
        return this.booksService.getUserBooks(req, filterCriteria);
    }

    @Get('users/:id')
    getUserBooksById(@Param('id') id: string) {
        return this.booksService.getUserBooksById(id);
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
