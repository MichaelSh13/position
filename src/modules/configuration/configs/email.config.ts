import { registerAs } from '@nestjs/config';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

import { EmailDto } from '../dto/email.dto';

export default registerAs('email', async () => {
  const options: Partial<EmailDto> = {
    user: process.env.EMAIL_USER,
    password: process.env.EMAIL_PASSWORD,
  };

  const instance = plainToInstance(EmailDto, options);
  const errors = await validate(instance);
  errors.forEach((error) => {
    throw new Error(error.toString());
  });

  return options;
});
