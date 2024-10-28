import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MailerModule, MailerOptions } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { join } from 'path';

import { EmailService } from './services/email.service';
import { EmailDto } from '../configuration/dto/email.dto';
import { JsonWebTokenModule } from '../json-web-token/json-web-token.module';

@Module({
  imports: [
    JsonWebTokenModule,
    MailerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const { password, user } = configService.getOrThrow<EmailDto>('email');

        const options: MailerOptions = {
          transport: {
            service: 'gmail',
            auth: {
              user,
              pass: password,
            },
          },
          defaults: {
            from: '"No Reply" <noreply@example.com>',
          },
          template: {
            dir: join(__dirname, 'templates'),
            adapter: new HandlebarsAdapter(),
            options: {
              strict: true,
            },
          },
        };

        return options;
      },
    }),
  ],
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}
