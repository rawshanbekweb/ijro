import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { AuthenticatedUser } from '../../modules/auth/interfaces/jwt-payload.interface';

interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
}

/**
 * Extracts the `request.user` object populated by `JwtStrategy`/`JwtRefreshStrategy`.
 */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthenticatedUser | undefined => {
    const request = ctx.switchToHttp().getRequest<AuthenticatedRequest>();
    return request.user;
  },
);
