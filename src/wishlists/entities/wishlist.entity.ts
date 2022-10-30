import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

import { Book } from 'src/books/entities/book.entity';
import { User } from 'src/users/entities/user.entity';

export type WishlistDocument = Wishlist & Document;

export enum WishlistStatus {
    Requested = 'Requested',
    ForLater = 'For Later',
}

@Schema({ timestamps: true, versionKey: false })
export class Wishlist {
    @Prop({ type: String })
    name: string;

    @Prop({ type: String, ref: 'User' })
    owner: User;

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Book' })
    book: Book;

    @Prop({ type: String, enum: WishlistStatus, default: WishlistStatus.Requested })
    status: WishlistStatus;
}

export const WishlistSchema = SchemaFactory.createForClass(Wishlist);
