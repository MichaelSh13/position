import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ async: false })
export class IsOneOfConstraint implements ValidatorConstraintInterface {
  validate(value: unknown, args: ValidationArguments) {
    const validators = args.constraints;

    // If no validators are provided, return true
    if (!validators.length) {
      return true;
    }

    // Validate the value against each provided validator
    return validators.some((validator) => validator(value));
  }

  defaultMessage(args: ValidationArguments) {
    return `Value must be one of the valid types: ${args.constraints.join(', ')}`;
  }
}

export function IsOneOf(
  validators: ((value: unknown) => boolean)[],
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: validators,
      validator: IsOneOfConstraint,
    });
  };
}
