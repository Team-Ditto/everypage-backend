import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

import { User } from 'src/users/entities/user.entity';
import { Library } from 'src/libraries/entities/library.entity';

export type BookDocument = Book & Document;

export enum BookReadingStatus {
    ToRead = 'To Read',
    Reading = 'Reading',
    Finished = 'Finished',
}

export enum BookBorrowingStatus {
    Available = 'Available',
    Hold = 'Hold',
    Using = 'Using',
}

export enum BookCondition {
    LikeNew = 'Like New',
    VeryGood = 'Very Good',
    Good = 'Good',
    Fair = 'Fair',
    Poor = 'Poor',
}

@Schema({ timestamps: true, versionKey: false })
export class Book {
    @Prop({ required: true })
    title: string;

    @Prop({ type: String })
    author: string;

    @Prop({ type: String })
    edition: string;

    @Prop({ type: String, enum: BookCondition })
    bookCondition: BookCondition;

    @Prop({ type: [String] })
    images: string[];

    @Prop({ type: Number, length: 13 })
    ISBN: number;

    @Prop({ type: String })
    language: string;

    @Prop({ type: String })
    location: string;

    @Prop({ type: String })
    genre: string;

    @Prop({ type: String, ref: 'User' })
    owner: User;

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Library' })
    library: Library;

    @Prop({ type: String, ref: 'User' })
    bearer: User;

    @Prop({ type: Boolean })
    shareable: boolean;

    @Prop({ type: String, enum: BookReadingStatus })
    readingStatus: BookReadingStatus;

    @Prop({ type: String, enum: BookBorrowingStatus })
    borrowingStatus: BookBorrowingStatus;

    @Prop({ type: String })
    notes: string;
}

export const BookSchema = SchemaFactory.createForClass(Book);
