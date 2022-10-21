import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

export enum ReaderType {
    Fast = 'Fast',
    Slow = 'Slow',
}

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

    @Prop({ type: String })
    location: string;

    @Prop({ type: String, enum: ReaderType })
    readerType: ReaderType;
}

export const UserSchema = SchemaFactory.createForClass(User);
