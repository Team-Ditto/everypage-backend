import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, Schema as MongooseSchema } from 'mongoose';

import { Wishlist } from 'src/wishlists/entities/wishlist.entity';

export type UserDocument = User & Document;

export enum ReaderType {
    Fast = 'Fast',
    Casual = 'Casual',
    Slow = 'Slow',
}

export interface PointSchemaType {
    type: string;
    coordinates: number[];
}

const PointSchema = new mongoose.Schema<PointSchemaType>(
    {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point',
            required: true,
        },
        coordinates: {
            type: [Number],
            required: true,
        },
    },
    { _id: false },
);

@Schema({ timestamps: true, versionKey: false })
export class User {
    @Prop({ type: String, required: true })
    _id: string;

    @Prop({ required: true, unique: true })
    email: string;

    @Prop({ type: String, required: true })
    displayName: string;

    @Prop({ type: String, required: true })
    photoURL: string;

    @Prop({ type: PointSchema, index: '2dsphere' })
    location: PointSchemaType;

    @Prop({ type: String, enum: ReaderType })
    readerType: ReaderType;

    @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'Wishlist' }] })
    wishlists: Wishlist[];

    @Prop({ type: Boolean, default: true })
    firstTimeLogin: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);
