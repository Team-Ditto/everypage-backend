import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

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
            enum: ['point'],
            default: 'point',
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

    @Prop({ type: PointSchema })
    location: PointSchemaType;

    @Prop({ type: String, enum: ReaderType })
    readerType: ReaderType;
}

export const UserSchema = SchemaFactory.createForClass(User);
