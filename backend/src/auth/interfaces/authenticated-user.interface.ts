import { Role } from '../../common/enums/role.enum';
import { Permission } from '../../common/enums/permission.enum';

export interface AuthenticatedUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  permissions: Permission[];
  isActive: boolean;
  mfaEnabled: boolean;
  totpSecret?: string; // Optional - only exposed during MFA setup
  password?: string; // Optional - only used internally for validation
}
