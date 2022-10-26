import { Request } from 'express';
import { HttpException, HttpStatus, Injectable, Logger, Req } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Book, BookDocument } from './entities/book.entity';
import { CreateBookDto, UpdateBookDto } from './dto';
import { FirebaseUser } from 'src/users/users.service';

@Injectable()
export class BooksService {
    private readonly logger = new Logger(BooksService.name);

    constructor(@InjectModel(Book.name) private bookModel: Model<BookDocument>) {}

    async createNewBook(@Req() req: Request, createBookDto: CreateBookDto): Promise<BookDocument> {
        try {
            createBookDto.owner = (req.user as FirebaseUser).uid;
            const book = await this.bookModel.create(createBookDto);

            return book;
        } catch (error) {
            this.logger.error(error);
            throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async getMyBooks(req: Request): Promise<BookDocument[]> {
        try {
            this.logger.log('getting all of my books');
            return await this.bookModel.find({ owner: (req.user as FirebaseUser).uid }).populate('owner');
        } catch (error) {
            this.logger.error(error);
            throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async getAllBooks(): Promise<BookDocument[]> {
        try {
            this.logger.log('getting all the books');
            return await this.bookModel.find({ shareable: true }).populate('owner');
        } catch (error) {
            this.logger.error(error);
            throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async getUserBooks(userId: string): Promise<BookDocument[]> {
        try {
            this.logger.log("getting all of the user's books");
            return await this.bookModel.find({ owner: userId, shareable: true }).limit(10).populate('owner');
        } catch (error) {
            this.logger.error(error);
            throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async getBookById(bookId: string): Promise<BookDocument> {
        try {
            return await (await this.bookModel.findById(bookId)).populate('owner');
        } catch (error) {
            this.logger.error(error);
            throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async updateBookById(bookId: string, updateBookDto: UpdateBookDto): Promise<BookDocument> {
        // Finally, update the taxonomy with the update code.
        const updateOptions = {
            // Create if not already there.
            upsert: false,

            // Return the new object instead of the original.
            new: true,

            // Apply the defaults specified in the model's schema if a new document is created.
            setDefaultsOnInsert: false,
        };

        try {
            const updatedBook = await this.bookModel.findByIdAndUpdate(bookId, updateBookDto, updateOptions);

            return updatedBook;
        } catch (error) {
            this.logger.error(error);
            throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    remove(id: string) {
        return `This action removes a #${id} book`;
    }
}
