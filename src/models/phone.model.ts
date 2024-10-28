import { Prop } from '@nestjs/mongoose';

export class Phone {
  @Prop({ type: String, required: true })
  code: string;

  @Prop({ type: String, required: true })
  numbers: string;

  get value() {
    const parsedNumbers = this.numbers;

    return `+${this.code} ${parsedNumbers}`;
  }
}
