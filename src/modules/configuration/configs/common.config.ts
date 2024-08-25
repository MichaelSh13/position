import { registerAs } from '@nestjs/config';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

import { CommonDto } from '../dto/common.dto';

export default registerAs('common', async () => {
  const options = {
    port: Number(process.env.PORT),
    apiLimit: process.env.API_LIMIT,
  };

  const instance = plainToInstance(CommonDto, options);
  const errors = await validate(instance);
  errors.forEach((error) => {
    throw new Error(error.toString());
  });

  return options;
});
