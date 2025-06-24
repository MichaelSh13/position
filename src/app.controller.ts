import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { IsPublic } from './modules/auth/decorators/is-public.decorator';

@IsPublic()
@ApiTags('Health-check')
@Controller()
export class AppController {
  @Get('health-check')
  app() {
    return 'Welcome to the API!';
  }
}
