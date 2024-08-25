export function CombineValidators(
  ...validators: PropertyDecorator[]
): PropertyDecorator {
  return function (target, propertyKey) {
    validators.forEach((validator) => validator(target, propertyKey));
  };
}
