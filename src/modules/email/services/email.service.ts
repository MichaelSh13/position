import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { MailerService } from '@nestjs-modules/mailer';
import { plainToInstance } from 'class-transformer';
import { SentMessageInfo } from 'nodemailer';
import { CONFIRM_EMAIL_ENDPOINT_NAME } from 'src/modules/auth/consts/endpoint-names.const';
import { CommonDto } from 'src/modules/configuration/dto/common.dto';

import { EmailEvents } from '../consts/email.event.const';
import { EmailSendedEvent } from '../events/email-sended.event';

@Injectable()
export class EmailService {
  private baseUrl: string;

  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,

    private readonly eventEmitter: EventEmitter2,
  ) {
    const { port } = this.configService.getOrThrow<CommonDto>('common');
    // TODO: Create better way, including versioning system.
    this.baseUrl = `http://localhost:${port}/v1`;
  }

  public async sendVerificationLink(
    email: string,
    token: string,
  ): Promise<unknown> {
    const url = `${this.baseUrl}/auth/${CONFIRM_EMAIL_ENDPOINT_NAME}?token=${token}`;

    try {
      const result: SentMessageInfo = await this.mailerService.sendMail({
        to: email,
        subject: 'Welcome to Nice App! Confirm your Email',
        template: './confirmation',
        context: {
          name: `"${email}"`,
          url,
        },
      });

      const payloadData: EmailSendedEvent = {
        id: result.id,
        payload: result,
      };
      const payload = plainToInstance(EmailSendedEvent, payloadData);
      this.eventEmitter.emit(EmailEvents.SENDED, payload);

      // TODO: logger info.
      return result;
    } catch (err) {
      // TODO: error
      console.log(err);
      throw new BadRequestException('Email not sent.');
    }
  }
}
