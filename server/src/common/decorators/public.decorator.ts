import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Marks a route handler as publicly accessible, bypassing the global
 * `JwtAuthGuard`. Used for endpoints such as `/auth/login` and `/auth/refresh`.
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
