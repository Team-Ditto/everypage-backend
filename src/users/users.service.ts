import { ConfigService } from '@nestjs/config';
import { Injectable, Logger } from '@nestjs/common';
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

  async createNewUser(createUserDto: CreateUserDto): Promise<UserDocument> {
    try {
      const user = await this.userModel.create(createUserDto);

      return user;
    } catch (error) {
      throw error;
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
