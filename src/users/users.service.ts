import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { EnvironmentVariables } from 'src/env.validation';
import { User, UserDocument } from './entities/user.entity';
import { CreateUserDto, UpdateUserDto } from './dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private config: ConfigService<EnvironmentVariables>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<UserDocument> {
    try {
      const userWithId = {
        ...createUserDto,
        _id: '0SFnMsEwogRKYTtFwH4dd2eMBxlo43', // this will be firebase id
      } as UserDocument;

      const user = await this.userModel.create(userWithId);

      return user;
    } catch (error) {
      throw error;
    }
  }

  async findAll() {
    console.log(this.config.get('PORT'));
    console.log(this.config.get('MONGODB_URI'));

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
