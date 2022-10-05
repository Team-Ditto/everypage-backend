import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ type: String })
  _id: string;

  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  address: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
