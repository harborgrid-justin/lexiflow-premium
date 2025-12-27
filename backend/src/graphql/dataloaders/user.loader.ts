import DataLoader from 'dataloader';
import { Injectable, Scope } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { User } from '@users/entities/user.entity';

/**
 * UserLoader - DataLoader for batching and caching user queries
 * Prevents N+1 query problems when loading users
 */
@Injectable({ scope: Scope.REQUEST })
export class UserLoader {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  /**
   * Batch load users by IDs
   */
  public readonly batchUsers = new DataLoader(async (userIds: readonly string[]) => {
    const users = await this.userRepository.find({
      where: { id: In([...userIds]) },
    });
    const userMap = new Map(users.map(u => [u.id, u]));
    return userIds.map(id => userMap.get(id) || null);
  });

  /**
   * Batch load users by email addresses
   */
  public readonly batchUsersByEmail = new DataLoader(async (emails: readonly string[]) => {
    const users = await this.userRepository.find({
      where: { email: In([...emails]) },
    });
    const userMap = new Map(users.map(u => [u.email, u]));
    return emails.map(email => userMap.get(email) || null);
  });

  /**
   * Batch load user permissions by user IDs
   * Note: Permissions are derived from user roles via ROLE_PERMISSIONS constant
   */
  public readonly batchPermissionsByUserId = new DataLoader(async (userIds: readonly string[]) => {
    const users = await this.userRepository.find({
      where: { id: In([...userIds]) },
    });
    const permissionsByUserId = new Map();
    userIds.forEach(id => permissionsByUserId.set(id, []));
    users.forEach(user => {
      // Permissions would be derived from user role
      // For now, return empty array as permissions are computed from role
      permissionsByUserId.set(user.id, []);
    });
    return userIds.map(id => permissionsByUserId.get(id) || []);
  });

  /**
   * Batch load user preferences by user IDs
   * Note: User preferences would need a separate entity/table for full implementation
   */
  public readonly batchPreferencesByUserId = new DataLoader(async (userIds: readonly string[]) => {
    // User preferences may be stored in JSONB column or separate table
    // For now, return null as preferences entity is not defined
    return userIds.map(() => null);
  });
}
