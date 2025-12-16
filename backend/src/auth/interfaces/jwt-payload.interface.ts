import { Role } from '../../common/enums/role.enum';

export interface JwtPayload {
  sub: string; // User ID
  email: string;
  role: Role;
  type: 'access' | 'refresh';
  jti: string; // JWT ID - unique token identifier for blacklisting
  iat?: number; // Issued at timestamp (added by JWT library)
  exp?: number; // Expiration timestamp (added by JWT library)
}
