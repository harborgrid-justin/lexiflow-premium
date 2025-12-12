import { Role } from '../../common/enums/role.enum';

export interface JwtPayload {
  sub: string; // User ID
  email: string;
  role: Role;
  type: 'access' | 'refresh';
}
