import { Request } from 'express';
import { ConfigService } from '@nestjs/config';
import { HttpException, HttpStatus, Injectable, Logger, Req } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { EnvironmentVariables } from 'src/env.validation';
import { User, UserDocument } from './entities/user.entity';
import { CreateUserDto, UpdateUserDto } from './dto';

export enum WishlistOperation {
    Add = 'add',
    Remove = 'remove',
}

@Injectable()
export class UsersService {
    private readonly logger = new Logger(UsersService.name);

    constructor(
        @InjectModel(User.name) private userModel: Model<UserDocument>,
        private config: ConfigService<EnvironmentVariables>,
    ) {}

    /**
     * creates a new user (this is triggered after user registers from Firebase)
     * @param createUserDto the create user DTO
     * @returns the user
     */
    async createNewUser(createUserDto: CreateUserDto): Promise<any> {
        try {
            this.logger.debug('***** creating new user *****');

            const newUser = new this.userModel(createUserDto);
            newUser.save();

            this.logger.debug('***** creating new user completed *****');
            this.logger.debug('New user created' + newUser._id);

            return HttpStatus.CREATED;
        } catch (error) {
            this.logger.error(error);
            throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * returns all the user in the database
     * not meant to use in the frontend
     * @returns the users
     */
    async findAll() {
        this.logger.log('getting all the users');
        return await this.userModel.find({});
    }

    /**
     * return my profile
     * @returns my user
     */
    async myProfile(@Req() req: Request) {
        try {
            return this.userModel.findById(req.user.uid).populate('wishlists');
        } catch (error) {
            this.logger.error(error);
            throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * updates the currently logged in user
     * @param req
     * @param updateUserDto
     * @returns updated user
     */
    async update(@Req() req: Request, updateUserDto: UpdateUserDto) {
        const updateOptions = {
            // Create if not already there.
            upsert: false,

            // Return the new object instead of the original.
            new: true,

            // Apply the defaults specified in the model's schema if a new document is created.
            setDefaultsOnInsert: false,
        };

        try {
            const updatedProfile = await this.userModel.findByIdAndUpdate(req.user.uid, updateUserDto, updateOptions);

            return updatedProfile;
        } catch (error) {
            this.logger.error(error);
            throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    remove(id: number) {
        return `This action removes a #${id} user`;
    }

    /**
     * adds/removes wishlists from the user
     * @param operation the add/remove operation
     * @param userId the user ID
     * @param wishlistIds the array of wishlist ids
     */
    async updateUsersWishlists(operation: WishlistOperation, userId: string, wishlistIds: any[]) {
        const updateOptions = {
            // Create if not already there.
            upsert: false,

            // Return the new object instead of the original.
            new: true,

            // Apply the defaults specified in the model's schema if a new document is created.
            setDefaultsOnInsert: false,
        };

        let updateQuery;

        if (operation === WishlistOperation.Add) {
            updateQuery = { $push: { wishlists: { $each: wishlistIds } } };
        } else {
            updateQuery = { $pull: { wishlists: { $in: wishlistIds } } };
        }

        await this.userModel.findOneAndUpdate({ _id: userId }, updateQuery, updateOptions);
    }
}
