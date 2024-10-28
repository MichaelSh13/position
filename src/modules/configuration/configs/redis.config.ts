import { registerAs } from '@nestjs/config';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { timeStringToMs } from 'src/shared/utils/time-string-to-ms.util';

import { RedisDto } from '../dto/redis.dto';

export default registerAs('redis', async () => {
  const options: Partial<RedisDto> = {
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT),
    ttl: timeStringToMs(process.env.JWT_USER_EXPIRES_IN),
  };

  const instance = plainToInstance(RedisDto, options);
  const errors = await validate(instance);
  errors.forEach((error) => {
    throw new Error(error.toString());
  });

  return options;
});
