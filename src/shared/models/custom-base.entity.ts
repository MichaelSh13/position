import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import {
  CreateDateColumn,
  DeleteDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export abstract class CustomBaseEntity {
  @ApiProperty()
  @Expose()
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ApiProperty()
  @Expose()
  @CreateDateColumn()
  createdAt!: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updatedAt!: Date;

  @ApiProperty()
  @DeleteDateColumn()
  deletedAt?: Date;
}
