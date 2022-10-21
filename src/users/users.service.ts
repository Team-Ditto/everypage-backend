import { ConfigService } from '@nestjs/config';
import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { EnvironmentVariables } from 'src/env.validation';
import { User, UserDocument } from './entities/user.entity';
import { CreateUserDto, UpdateUserDto } from './dto';

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

    async findAll() {
        this.logger.log('getting all the users');
        return await this.userModel.find({});
    }

    findOne(id: number) {
        return `This action returns a #${id} user`;
    }

    update(id: number, updateUserDto: UpdateUserDto) {
        return `This action updates a #${id} user`;
    }

    remove(id: number) {
        return `This action removes a #${id} user`;
    }
}
