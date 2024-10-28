import { registerAs } from '@nestjs/config';
import type { JwtModuleOptions } from '@nestjs/jwt';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

import { JwtDto } from '../dto/jwt.dto';

type Options = Record<string, JwtModuleOptions>;

export default registerAs('jwt', async (): Promise<Options> => {
  const options: Options = {
    access: {
      privateKey: process.env.JWT_USER_PRIVATE_KEY,
      publicKey: process.env.JWT_USER_PUBLIC_KEY,
      signOptions: {
        expiresIn: process.env.JWT_USER_EXPIRES_IN,
        algorithm: 'RS256',
      },
    },
    refresh: { secret: process.env.JWT_USER_REFRESH_SECRET },
    mail: { secret: process.env.EMAIL_JWT_SECRET },
  };

  const instance = plainToInstance(JwtDto, options);
  const errors = await validate(instance);
  errors.forEach((error) => {
    throw new Error(error.toString());
  });

  return options;
});
