import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

export enum ReaderType {
  Fast = 'Fast',
  Slow = 'Slow',
}

@Schema({ timestamps: true, versionKey: false })
export class User {
  @Prop({ type: String })
  _id: string;

  @Prop({ required: true })
  email: string;

  @Prop({ type: String })
  firstName: string;

  @Prop({ type: String })
  lastName: string;

  @Prop({ type: String })
  location: string;

  @Prop({ type: String })
  profilePhotoURL: string;

  @Prop({ type: String, enum: ReaderType })
  readerType: ReaderType;
}

export const UserSchema = SchemaFactory.createForClass(User);
