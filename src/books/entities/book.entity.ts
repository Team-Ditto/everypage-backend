import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

import { User } from 'src/users/entities/user.entity';

export type BookDocument = Book & Document;

export enum BookReadingStatus {
    ToRead = 'To Read',
    Reading = 'Reading',
    Finished = 'Finished',
}

export enum BookBorrowingStatus {
    Available = 'Available',
    Hold = 'On-Hold',
    Using = 'In-Use',
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
    @Prop({ required: true, index: true })
    title: string;

    @Prop({ type: String, index: true })
    author: string;

    @Prop({ type: String })
    edition: string;

    @Prop({ type: String, enum: BookCondition })
    bookCondition: BookCondition;

    @Prop({ type: [String] })
    images: string[];

    @Prop({ type: Number, length: 13 })
    ISBN: number;

    @Prop({ type: String, index: true })
    language: string;

    @Prop({ type: String, index: true })
    location: string;

    @Prop({ type: String, index: true })
    genre: string;

    @Prop({ type: String, ref: 'User' })
    owner: User;

    @Prop({ type: String, ref: 'User', default: null })
    bearer: User;

    @Prop({ type: String, ref: 'User', default: null })
    requestor: User;

    @Prop({ type: Boolean, default: false })
    bookReturnRequest: boolean;

    @Prop({ type: Boolean, index: true, default: false })
    shareable: boolean;

    @Prop({ type: String, enum: BookReadingStatus, index: true })
    readingStatus: BookReadingStatus;

    @Prop({ type: String, enum: BookBorrowingStatus, default: BookBorrowingStatus.Available })
    borrowingStatus: BookBorrowingStatus;

    @Prop({ type: String })
    notes: string;
}

export const BookSchema = SchemaFactory.createForClass(Book);
