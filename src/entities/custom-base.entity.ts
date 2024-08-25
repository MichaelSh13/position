import { Exclude } from 'class-transformer';
import {
  CreateDateColumn,
  DeleteDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export abstract class CustomBaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @Exclude()
  @UpdateDateColumn()
  updatedAt!: Date;

  @Exclude()
  @DeleteDateColumn()
  deletedAt?: Date;
}
