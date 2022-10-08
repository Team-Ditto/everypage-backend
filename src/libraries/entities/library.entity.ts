import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

import { Book } from 'src/books/entities/book.entity';
import { User } from 'src/users/entities/user.entity';

export type LibraryDocument = Library & Document;

@Schema({ timestamps: true })
export class Library {
  @Prop({ required: true })
  name: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
  owner: User;

  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'Book' }] })
  books: Book[];
}

export const LibrarySchema = SchemaFactory.createForClass(Library);
