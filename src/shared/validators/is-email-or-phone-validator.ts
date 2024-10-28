import {
  isEmail,
  isPhoneNumber,
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'IsEmailOrPhone', async: false })
export class IsEmailOrPhoneConstraint implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments) {
    if (typeof value !== 'string') return false;

    const isEmailValue = isEmail(value);

    const withCode: boolean = args.constraints[0];
    const isPhoneValue = withCode
      ? isPhoneNumber(value)
      : /^\d{7,15}$/.test(value);

    return isEmailValue || isPhoneValue;
  }

  defaultMessage(args: ValidationArguments) {
    return 'Value must be a valid email or phone number.';
  }
}

type IsEmailOrPhoneOption = {
  withCode?: boolean;
};
export function IsEmailOrPhone(
  { withCode = false }: IsEmailOrPhoneOption = {},
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [withCode],
      validator: IsEmailOrPhoneConstraint,
    });
  };
}
