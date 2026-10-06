import { SetMetadata } from '@nestjs/common';
import { Role } from '../enums/role.enum';

export const ROLES_KEY = 'roles';

/**
 * Marks the required role(s) for a route handler as metadata.
 *
 * Enforced globally by `RolesGuard` (registered as `APP_GUARD` in
 * `AppModule`). Handlers without `@Roles()` are accessible to any
 * authenticated user.
 */
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
