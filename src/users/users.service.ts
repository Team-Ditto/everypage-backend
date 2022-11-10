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

            const user = await this.userModel.findOne({
                $or: [{ _id: createUserDto._id }, { email: createUserDto.email }],
            });

            if (user) {
                throw new Error('User already exists!');
            }

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
     * gets the user by ID
     * @param userId the user ID
     * @returns the user
     */
    async getUserById(userId: string): Promise<UserDocument> {
        return this.userModel.findById(userId);
    }

    /**
     * return my profile
     * @returns my user
     */
    async myProfile(@Req() req: Request) {
        try {
            const user = await this.userModel.findById(req.user._id).populate('wishlists');

            return user;
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
            const updatedProfile = await this.userModel.findByIdAndUpdate(req.user._id, updateUserDto, updateOptions);

            return updatedProfile;
        } catch (error) {
            this.logger.error(error);
            throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
        }
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

    /**
     * returns the IDs of the user that fall within the boundaries
     * @param currentUserId the current user ID
     * @param coordinates the coordinates of the current user
     * @param maxDistance the max distance
     * @returns the user IDs
     */
    async getUserIdsWithinTheLocation(
        currentUserId: string,
        coordinates: [number, number],
        maxDistance: number,
    ): Promise<string[]> {
        console.log(currentUserId);
        console.log(coordinates);
        console.log(maxDistance);

        const users = await this.userModel.aggregate<UserDocument>([
            {
                $geoNear: {
                    near: {
                        type: 'Point',
                        coordinates,
                    },
                    distanceField: 'dist.calculated',
                    maxDistance,
                    includeLocs: 'dist.location',
                },
            },
            {
                $match: {
                    _id: {
                        $ne: currentUserId,
                    },
                },
            },
            {
                $project: {
                    _id: 1,
                },
            },
        ]);

        return users.map(item => item._id);
    }
}
