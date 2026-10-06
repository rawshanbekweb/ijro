import {
  isUUID,
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Role } from '../enums/role.enum';

/**
 * Cross-field validator applied on `sohaId`:
 * - `rol=BAJARUVCHI` bo'lsa, `sohaId` majburiy va valid UUID bo'lishi kerak.
 * - `rol=SUPERADMIN` bo'lsa, `sohaId` berilmasligi kerak.
 *
 * NOTE: this validator owns the full "required"/"forbidden"/"format" logic
 * for `sohaId` on purpose — a plain `@IsOptional()` would short-circuit and
 * skip this constraint whenever `sohaId` is undefined, which is exactly the
 * case we need to catch for `rol=BAJARUVCHI`.
 */
@ValidatorConstraint({ name: 'SohaIdRolgaMos', async: false })
export class SohaIdRolgaMosConstraint implements ValidatorConstraintInterface {
  validate(sohaId: unknown, args: ValidationArguments): boolean {
    const object = args.object as { rol?: Role };
    const bosh = sohaId === undefined || sohaId === null || sohaId === '';

    if (object.rol === Role.BAJARUVCHI) {
      return !bosh && typeof sohaId === 'string' && isUUID(sohaId);
    }

    if (object.rol === Role.SUPERADMIN) {
      return bosh;
    }

    return true;
  }

  defaultMessage(args: ValidationArguments): string {
    const object = args.object as { rol?: Role };

    if (object.rol === Role.BAJARUVCHI) {
      return 'rol=BAJARUVCHI bo‘lganda sohaId majburiy va valid UUID bo‘lishi kerak';
    }

    if (object.rol === Role.SUPERADMIN) {
      return 'rol=SUPERADMIN bo‘lganda sohaId berilmasligi kerak';
    }

    return 'sohaId qiymati rolga mos emas';
  }
}

export function SohaIdRolgaMos(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [],
      validator: SohaIdRolgaMosConstraint,
    });
  };
}
