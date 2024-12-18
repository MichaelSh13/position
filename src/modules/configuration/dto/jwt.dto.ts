import { Type } from 'class-transformer';
import { IsString, MinLength, ValidateNested } from 'class-validator';

class SignOptions {
  @IsString()
  @MinLength(1)
  expiresIn: string;

  @IsString()
  @MinLength(1)
  algorithm: string;
}

class SecretOptionsDto {
  // @IsString()
  // @MinLength(1)
  secret: string;
}

class AccessOptionsDto {
  @IsString()
  @MinLength(1)
  privateKey: string;

  @IsString()
  @MinLength(1)
  publicKey: string;

  @Type(() => SignOptions)
  @ValidateNested()
  signOptions: SignOptions;
}

export class JwtDto {
  @Type(() => AccessOptionsDto)
  @ValidateNested()
  access: AccessOptionsDto;

  @Type(() => SecretOptionsDto)
  @ValidateNested()
  refresh: SecretOptionsDto;

  @Type(() => SecretOptionsDto)
  @ValidateNested()
  mail: SecretOptionsDto;
}
