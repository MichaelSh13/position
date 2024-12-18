import { Controller, Get } from '@nestjs/common';

import { IsPublic } from './modules/auth/decorators/is-public.decorator';

@IsPublic()
@Controller()
export class AppController {
  @Get()
  app() {
    return 'Welcome to the API!';
  }
}
