import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

import { User } from 'src/users/entities/user.entity';

export type BookDocument = Book & Document;

@Schema({ timestamps: true })
export class Book {
  @Prop({ type: String, ref: 'User' })
  user: User;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  author: string;
}

export const BookSchema = SchemaFactory.createForClass(Book);
