import { Column } from 'typeorm';

export class PhoneNumber {
  @Column({ nullable: true })
  code: string;

  @Column({ nullable: true })
  numbers: string;
}
