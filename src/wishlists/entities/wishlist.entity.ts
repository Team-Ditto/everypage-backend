import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

import { Book } from 'src/books/entities/book.entity';
import { User } from 'src/users/entities/user.entity';

export type WishlistDocument = Wishlist & Document;

export enum WishlistStatus {
  Requested = 'Requested',
  ForLater = 'For Later',
}

@Schema({ timestamps: true })
export class Wishlist {
  @Prop({ required: true })
  name: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
  owner: User;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Book' })
  book: Book;

  @Prop({ type: String, enum: WishlistStatus })
  status: WishlistStatus;
}

export const WishlistSchema = SchemaFactory.createForClass(Wishlist);
