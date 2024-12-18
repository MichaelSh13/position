import { OnEvent } from '@nestjs/event-emitter';

const MAX_RETRIES = 3;

export const HandleEvent = (eventName: string) => {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    OnEvent(eventName)(target, propertyKey, descriptor);

    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      // TODO: Logger
      // const logger = new Logger(`${target.constructor.name}.${propertyKey}`);
      let attempts = 0;
      let success = false;

      while (attempts < MAX_RETRIES && !success) {
        try {
          attempts++;
          await originalMethod.apply(this, args);
          success = true;
        } catch (error) {
          // logger.error(
          //   `Error handling event: ${eventName} (attempt ${attempts})`,
          //   error.stack,
          // );

          if (attempts >= MAX_RETRIES) {
            // logger.error(
            //   `Event handler failed after ${MAX_RETRIES} attempts: ${eventName}`,
            // );
          }
        }
      }
    };
  };
};
