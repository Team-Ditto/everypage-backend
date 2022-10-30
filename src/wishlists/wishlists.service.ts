import { Request } from 'express';
import { HttpException, HttpStatus, Injectable, Logger, Req } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Wishlist, WishlistDocument, WishlistStatus } from './entities/wishlist.entity';
import { CreateWishlistDto, UpdateWishlistDto } from './dto';
import { FirebaseUser, UsersService, WishlistOperation } from 'src/users/users.service';

@Injectable()
export class WishlistsService {
    private readonly logger = new Logger(WishlistsService.name);

    constructor(
        @InjectModel(Wishlist.name) private wishlistModel: Model<WishlistDocument>,
        private userService: UsersService,
    ) {}

    async createNewWishlist(@Req() req: Request, createWishlistDto: CreateWishlistDto): Promise<WishlistDocument> {
        try {
            createWishlistDto.owner = (req.user as FirebaseUser).uid;

            const wishlist = await this.wishlistModel.create(createWishlistDto);

            await this.userService.updateUsersWishlists(WishlistOperation.Add, (req.user as FirebaseUser).uid, [
                wishlist._id,
            ]);

            return wishlist;
        } catch (error) {
            this.logger.error(error);
            throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async getWishlistsByStatus(@Req() req: Request, wishListStatus: WishlistStatus): Promise<WishlistDocument[]> {
        try {
            this.logger.log('getting all the wishlists by ' + wishListStatus);
            const results = await this.wishlistModel
                .find({ owner: (req.user as FirebaseUser).uid, status: wishListStatus })
                .populate('owner')
                .populate('book');
            this.logger.log('Found ' + results.length + ' wishlists');

            return results;
        } catch (error) {
            this.logger.error(error);
            throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async getWishlistById(wishlistId: string): Promise<WishlistDocument> {
        try {
            return await this.wishlistModel.findById(wishlistId).populate('owner').populate('book');
        } catch (error) {
            this.logger.error(error);
            throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

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

    async deleteMultipleWishlists(@Req() req: Request, ids: string[]) {
        try {
            await this.wishlistModel.deleteMany({ _id: { $in: ids }, owner: (req.user as FirebaseUser).uid });
            await this.userService.updateUsersWishlists(WishlistOperation.Remove, (req.user as FirebaseUser).uid, ids);
        } catch (error) {
            this.logger.error(error);
            throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
