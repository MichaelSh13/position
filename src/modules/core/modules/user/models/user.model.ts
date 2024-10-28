import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { HydratedDocument, ObjectId } from 'mongoose';

import { UserRoles } from '../consts/user-roles.enum';

export type UserDocument = HydratedDocument<User>;

@Schema({ collection: 'user', id: true, timestamps: true })
export class User {
  @ApiProperty({ type: String })
  id!: ObjectId;

  @ApiProperty({ type: String })
  @Prop({ type: String, required: true })
  email!: string;

  @ApiProperty({ type: String, maxLength: 200, nullable: true })
  @Prop({ type: String, required: false, maxlength: 200 })
  name?: string;

  @ApiProperty({ enum: UserRoles, isArray: true })
  @Prop({
    type: [UserRoles],
    enum: UserRoles,
    default: [UserRoles.USER],
    required: true,
  })
  roles!: UserRoles[];

  @ApiProperty({ enum: Boolean })
  @Prop({
    type: Boolean,
    default: false,
    required: true,
  })
  complete!: boolean;

  @Prop({
    type: String,
  })
  @Exclude({ toPlainOnly: true })
  password?: string;
}

export const UserModel = SchemaFactory.createForClass(User);
