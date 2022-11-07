import { Request } from 'express';
import { HttpException, HttpStatus, Injectable, Logger, Req } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { UsersService } from 'src/users/users.service';
import { Book, BookDocument } from './entities/book.entity';
import { BookFilterCriteria, CreateBookDto, UpdateBookDto } from './dto';

export interface FilteredBookData {
    total?: number;
    results: BookDocument[];
    page: number;
    perPage: number;
}

@Injectable()
export class BooksService {
    private readonly logger = new Logger(BooksService.name);

    constructor(
        @InjectModel(Book.name)
        private bookModel: Model<BookDocument>,
        private userService: UsersService,
    ) {}

    /**
     * creates a new book
     * @param req the request
     * @param createBookDto the create book DTO
     * @returns the created book
     */
    async createNewBook(@Req() req: Request, createBookDto: CreateBookDto): Promise<BookDocument> {
        try {
            createBookDto.owner = req.user._id;
            const book = await this.bookModel.create(createBookDto);

            return book;
        } catch (error) {
            this.logger.error(error);
            throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * gets all of currently logged in user's books
     * @param req the request
     * @param filterCriteria the filter criteria
     * @returns the filtered book data
     */
    async getMyBooks(req: Request, filterCriteria: BookFilterCriteria): Promise<FilteredBookData> {
        try {
            this.logger.log('getting all of my books');

            const query = this.getCalculatedFilterCriteria(filterCriteria, true);

            query['$or'] = [
                {
                    owner: req.user._id,
                },
                {
                    bearer: req.user._id,
                },
            ];

            if (filterCriteria.location) {
                query.location = filterCriteria.location;
            }

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

    /**
     * gets the location
     * @param req the request
     * @returns the locations of currently logged in user's books
     */
    async getMyBookLocations(req: Request): Promise<string[]> {
        try {
            this.logger.log('getting all of my books locations');

            const locations = await this.bookModel.aggregate([
                {
                    $match: {
                        owner: req.user._id,
                    },
                },
                {
                    $project: {
                        location: 1,
                        _id: 0,
                    },
                },
            ]);

            return locations.map(item => item.location);
        } catch (error) {
            this.logger.error(error);
            throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * gets all the books
     * @param filterCriteria the filter criteria
     * @returns the filtered book data
     */
    async getAllBooks(filterCriteria: BookFilterCriteria): Promise<FilteredBookData> {
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

    /**
     * gets all the filtered books not belonging to the currently logged in user
     * @param req the request
     * @param filterCriteria the filter criteria
     * @returns the filtered book data
     */
    async getUserBooks(@Req() req: Request, filterCriteria: BookFilterCriteria): Promise<FilteredBookData> {
        try {
            this.logger.log("getting all of the user's books");

            const query = this.getCalculatedFilterCriteria(filterCriteria, true);

            if (filterCriteria.location) {
                const userIds = await this.userService.getUserIdsWithinTheLocation(
                    req.user._id,
                    [req.user.location.coordinates[0], req.user.location.coordinates[1]],
                    +filterCriteria.location * 1000,
                );

                query.owner = { $in: userIds };
            } else {
                query.owner = { $ne: req.user._id };
            }

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

    /**
     * gets the book by user ID
     * @param userId the user ID
     * @returns the book
     */
    async getUserBooksById(userId: string): Promise<BookDocument[]> {
        try {
            this.logger.log("getting all of the user's books by id");
            return await this.bookModel.find({ owner: userId, shareable: true }).limit(10).populate('owner');
        } catch (error) {
            this.logger.error(error);
            throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * gets the book by ID
     * @param bookId the book ID
     * @returns the book
     */
    async getBookById(bookId: string): Promise<BookDocument> {
        try {
            return await (await this.bookModel.findById(bookId)).populate('owner');
        } catch (error) {
            this.logger.error(error);
            throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * updates the book by ID
     * @param bookId the book ID
     * @param updateBookDto the update book DTO
     * @returns the book
     */
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

    /**
     * gets the query from the filter criteria
     * @param filter the filter criteria
     * @param shareable the (is book shareable) value
     * @returns the modified query
     */
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
            query.genre = new RegExp(filter.genre, 'i');
        }

        if (filter.readingStatus) {
            query.readingStatus = filter.readingStatus;
        }

        return query;
    }
}
