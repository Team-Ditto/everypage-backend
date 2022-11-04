import { Request } from 'express';
import { HttpException, HttpStatus, Injectable, Logger, Req } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Book, BookDocument } from './entities/book.entity';
import { BookFilterCriteria, CreateBookDto, UpdateBookDto } from './dto';

@Injectable()
export class BooksService {
    private readonly logger = new Logger(BooksService.name);

    constructor(@InjectModel(Book.name) private bookModel: Model<BookDocument>) {}

    async createNewBook(@Req() req: Request, createBookDto: CreateBookDto): Promise<BookDocument> {
        try {
            createBookDto.owner = req.user.uid;
            const book = await this.bookModel.create(createBookDto);

            return book;
        } catch (error) {
            this.logger.error(error);
            throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async getMyBooks(req: Request, filterCriteria: BookFilterCriteria): Promise<any> {
        try {
            this.logger.log('getting all of my books');

            const query = this.getCalculatedFilterCriteria(filterCriteria, true);

            query['$or'] = [
                {
                    owner: req.user.uid,
                },
                {
                    bearer: req.user.uid,
                },
            ];

            console.log(query);

            const sortStr = `${filterCriteria.sortOrder === 'asc' ? '' : '-'}${filterCriteria.sortBy}`;

            const results = await this.bookModel
                .find(query)
                .sort(sortStr)
                .populate('owner')
                .skip((filterCriteria.page - 1) * filterCriteria.perPage)
                .limit(filterCriteria.perPage);

            return {
                // total: await this.bookModel.countDocuments(query),
                results,
                page: filterCriteria.page,
                perPage: filterCriteria.perPage,
            };
        } catch (error) {
            this.logger.error(error);
            throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async getAllBooks(filterCriteria: BookFilterCriteria): Promise<any> {
        try {
            this.logger.log('getting all the books');

            const query = this.getCalculatedFilterCriteria(filterCriteria, true);

            const sortStr = `${filterCriteria.sortOrder === 'asc' ? '' : '-'}${filterCriteria.sortBy}`;

            const results = await this.bookModel
                .find(query)
                .sort(sortStr)
                .populate('owner')
                .skip((filterCriteria.page - 1) * filterCriteria.perPage)
                .limit(filterCriteria.perPage);

            return {
                // total: await this.bookModel.countDocuments(query),
                results,
                page: filterCriteria.page,
                perPage: filterCriteria.perPage,
            };
        } catch (error) {
            this.logger.error(error);
            throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async getUserBooks(@Req() req: Request, filterCriteria: BookFilterCriteria): Promise<any> {
        try {
            this.logger.log("getting all of the user's books");

            const query = this.getCalculatedFilterCriteria(filterCriteria, true);

            query.owner = { $ne: req.user.uid };

            console.log(query);

            const sortStr = `${filterCriteria.sortOrder === 'asc' ? '' : '-'}${filterCriteria.sortBy}`;

            const results = await this.bookModel
                .find(query)
                .sort(sortStr)
                .populate('owner')
                .skip((filterCriteria.page - 1) * filterCriteria.perPage)
                .limit(filterCriteria.perPage);

            return {
                // total: await this.bookModel.countDocuments(query),
                results,
                page: filterCriteria.page,
                perPage: filterCriteria.perPage,
            };
        } catch (error) {
            this.logger.error(error);
            throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async getUserBooksById(userId: string): Promise<BookDocument[]> {
        try {
            this.logger.log("getting all of the user's books by id");
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
        const updateOptions = {
            // Create if not already there.
            upsert: false,

            // Return the new object instead of the original.
            new: true,

            // Apply the defaults specified in the model's schema if a new document is created.
            setDefaultsOnInsert: false,
        };

        try {
            // validate the update for oneself
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

    private getCalculatedFilterCriteria(filter: BookFilterCriteria, shareable = true) {
        const query: any = {};

        if (filter.keyword) {
            const regex = new RegExp(filter.keyword, 'i');
            query.$or = [
                {
                    title: regex,
                },
                {
                    author: regex,
                },
            ];
        }

        if (shareable) {
            query.shareable = shareable;
        }

        if (filter.genre) {
            query.genre = filter.genre;
        }

        if (filter.readingStatus) {
            query.readingStatus = filter.readingStatus;
        }

        return query;
    }
}
