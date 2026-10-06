import { Role } from '../../../common/enums/role.enum';

export interface JwtPayload {
  sub: string;
  rol: Role;
  sohaId: string | null;
}

export interface AuthenticatedUser {
  userId: string;
  rol: Role;
  sohaId: string | null;
}
