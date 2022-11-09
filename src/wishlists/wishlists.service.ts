import { Request } from 'express';
import { HttpException, HttpStatus, Injectable, Logger, Req } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Wishlist, WishlistDocument, WishlistStatus } from './entities/wishlist.entity';
import { CreateWishlistDto, UpdateWishlistDto } from './dto';
import { UsersService, WishlistOperation } from 'src/users/users.service';

@Injectable()
export class WishlistsService {
    private readonly logger = new Logger(WishlistsService.name);

    constructor(
        @InjectModel(Wishlist.name) private wishlistModel: Model<WishlistDocument>,
        private userService: UsersService,
    ) {}

    /**
     * creates a new wishlist
     * @param req the request
     * @param createWishlistDto the create wishlist DTO
     * @returns the wishlist
     */
    async createNewWishlist(@Req() req: Request, createWishlistDto: CreateWishlistDto): Promise<WishlistDocument> {
        try {
            createWishlistDto.owner = req.user._id;

            const wishlist = await this.wishlistModel.create(createWishlistDto);

            await this.userService.updateUsersWishlists(WishlistOperation.Add, req.user._id, [wishlist._id]);

            return wishlist;
        } catch (error) {
            this.logger.error(error);
            throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * gets the wishlists based on status
     * @param req the request
     * @param wishListStatus the wishlist status
     * @returns the wishlists
     */
    async getWishlistsByStatus(@Req() req: Request, wishListStatus: WishlistStatus): Promise<WishlistDocument[]> {
        try {
            this.logger.log('getting all the wishlists by ' + wishListStatus);
            const results = await this.wishlistModel
                .find({ owner: req.user._id, status: wishListStatus })
                .populate('owner')
                .populate({
                    path: 'book',
                    model: 'Book',
                    populate: {
                        path: 'owner',
                        model: 'User',
                    },
                });
            this.logger.log('Found ' + results.length + ' wishlists');

            return results;
        } catch (error) {
            this.logger.error(error);
            throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * gets the wishlist by ID
     * @param wishlistId the wishlist ID
     * @returns the wishlist
     */
    async getWishlistById(wishlistId: string): Promise<WishlistDocument> {
        try {
            return await this.wishlistModel.findById(wishlistId).populate('owner').populate('book');
        } catch (error) {
            this.logger.error(error);
            throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * updated the wishlist by ID
     * @param wishlistId the wishlist ID
     * @param updateWishlistDto the update wishlist DTO
     * @returns the wishlist
     */
    async updateWishlistById(wishlistId: string, updateWishlistDto: UpdateWishlistDto): Promise<WishlistDocument> {
        const updateOptions = {
            // Create if not already there.
            upsert: false,

            // Return the new object instead of the original.
            new: true,

            // Apply the defaults specified in the model's schema if a new document is created.
            setDefaultsOnInsert: false,
        };

        try {
            const updatedWishlist = await this.wishlistModel.findByIdAndUpdate(
                wishlistId,
                updateWishlistDto,
                updateOptions,
            );

            return updatedWishlist;
        } catch (error) {
            this.logger.error(error);
            throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * deletes single/multiple wishlists
     * @param req the request
     * @param ids the ids
     * @returns the ids of deleted wishlists
     */
    async deleteMultipleWishlists(@Req() req: Request, ids: string[]): Promise<string[]> {
        try {
            await this.wishlistModel.deleteMany({ _id: { $in: ids }, owner: req.user._id });

            await this.userService.updateUsersWishlists(WishlistOperation.Remove, req.user._id, ids);

            return ids;
        } catch (error) {
            this.logger.error(error);
            throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * deletes the wishlist based on book ID
     * @param userId the user ID
     * @param bookId the book ID
     * @returns the wishlist
     */
    async deleteWishlistByBookId(userId: string, bookId: string): Promise<WishlistDocument> {
        try {
            const deleteOptions = {
                // Return the new object instead of the original.
                new: true,
            };

            const deletedWishlist = await this.wishlistModel.findOneAndDelete(
                { book: bookId, owner: userId },
                deleteOptions,
            );

            await this.userService.updateUsersWishlists(WishlistOperation.Remove, userId, [deletedWishlist._id]);

            return deletedWishlist;
        } catch (error) {
            this.logger.error(error);
            throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * deletes the wishlist based on book ID
     * @param userId the user ID
     * @param bookId the book ID
     * @param updateWishlistDto the update wishlist DTO
     * @returns the wishlist
     */
    async updateWishlistByBookId(
        userId: string,
        bookId: string,
        updateWishlistDto: UpdateWishlistDto,
    ): Promise<WishlistDocument> {
        try {
            const updateOptions = {
                // Create if not already there.
                upsert: false,

                // Return the new object instead of the original.
                new: true,

                // Apply the defaults specified in the model's schema if a new document is created.
                setDefaultsOnInsert: false,
            };

            const updatedWishlist = await this.wishlistModel.findOneAndUpdate(
                { book: bookId, owner: userId },
                updateWishlistDto,
                updateOptions,
            );

            return updatedWishlist;
        } catch (error) {
            this.logger.error(error);
            throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
