import { SetMetadata, CustomDecorator } from '@nestjs/common';

export const PERMISSIONS_KEY = 'permissions';
export const REQUIRE_ALL_PERMISSIONS_KEY = 'requireAllPermissions';
export const REQUIRE_ANY_PERMISSION_KEY = 'requireAnyPermission';
export const REQUIRE_OWNERSHIP_KEY = 'requireOwnership';
export const REQUIRE_DELEGATION_KEY = 'requireDelegation';
export const PERMISSION_POLICY_KEY = 'permissionPolicy';
export const RESOURCE_TYPE_KEY = 'resourceType';
export const BYPASS_PERMISSION_CHECK_KEY = 'bypassPermissionCheck';

/**
 * Require specific permissions to access this endpoint
 * User must have ALL specified permissions
 *
 * @example
 * @RequirePermissions('cases:read', 'cases:update')
 */
export const RequirePermissions = (...permissions: string[]): CustomDecorator<string> =>
  SetMetadata(PERMISSIONS_KEY, permissions);

/**
 * Require all specified permissions to access this endpoint
 * Alias for RequirePermissions for better clarity
 *
 * @example
 * @RequireAllPermissions('cases:read', 'cases:update', 'cases:delete')
 */
export const RequireAllPermissions = (...permissions: string[]): CustomDecorator<string> =>
  SetMetadata(REQUIRE_ALL_PERMISSIONS_KEY, permissions);

/**
 * Require at least one of the specified permissions to access this endpoint
 * User needs ANY ONE of the listed permissions
 *
 * @example
 * @RequireAnyPermission('cases:read:own', 'cases:read:all')
 */
export const RequireAnyPermission = (...permissions: string[]): CustomDecorator<string> =>
  SetMetadata(REQUIRE_ANY_PERMISSION_KEY, permissions);

/**
 * Require user to be the owner of the resource
 * Ownership is determined by comparing user ID with resource creator/owner
 *
 * @param options - Ownership validation options
 * @example
 * @RequireOwnership()
 * @RequireOwnership({ field: 'userId', allowDelegation: true })
 */
export const RequireOwnership = (
  options: {
    field?: string;
    allowDelegation?: boolean;
    allowTeamMembers?: boolean;
  } = {}
): CustomDecorator<string> => {
  const defaultOptions = {
    field: 'createdBy',
    allowDelegation: false,
    allowTeamMembers: false,
    ...options,
  };
  return SetMetadata(REQUIRE_OWNERSHIP_KEY, defaultOptions);
};

/**
 * Require delegation to access this resource
 * User must have been delegated access to the resource
 *
 * @example
 * @RequireDelegation()
 */
export const RequireDelegation = (): CustomDecorator<string> =>
  SetMetadata(REQUIRE_DELEGATION_KEY, true);

/**
 * Apply a custom permission policy to this endpoint
 * Policy will be evaluated by the PolicyService
 *
 * @param policyName - Name of the policy to apply
 * @param policyConfig - Additional policy configuration
 * @example
 * @PermissionPolicy('sensitive-data-access', { requireMfa: true })
 */
export const PermissionPolicy = (
  policyName: string,
  policyConfig?: Record<string, unknown>
): CustomDecorator<string> =>
  SetMetadata(PERMISSION_POLICY_KEY, { name: policyName, config: policyConfig });

/**
 * Specify the resource type for this endpoint
 * Used for resource-level permission checking
 *
 * @param resourceType - Type of resource (e.g., 'cases', 'documents')
 * @example
 * @ResourceType('cases')
 */
export const ResourceType = (resourceType: string): CustomDecorator<string> =>
  SetMetadata(RESOURCE_TYPE_KEY, resourceType);

/**
 * Bypass permission checks for this endpoint
 * Use with extreme caution - only for public or pre-authorized endpoints
 *
 * @example
 * @BypassPermissionCheck()
 */
export const BypassPermissionCheck = (): CustomDecorator<string> =>
  SetMetadata(BYPASS_PERMISSION_CHECK_KEY, true);

/**
 * Combine multiple permission decorators into one
 * Provides a clean way to apply complex permission rules
 *
 * @example
 * @PermissionRules({
 *   anyOf: ['cases:read:own', 'cases:read:all'],
 *   requireOwnership: true,
 *   resourceType: 'cases',
 *   policy: { name: 'standard-access', config: { requireMfa: false } }
 * })
 */
export const PermissionRules = (rules: {
  allOf?: string[];
  anyOf?: string[];
  requireOwnership?: boolean | { field?: string; allowDelegation?: boolean };
  requireDelegation?: boolean;
  resourceType?: string;
  policy?: { name: string; config?: Record<string, unknown> };
}): MethodDecorator => {
  return (target: object, propertyKey: string | symbol, descriptor: PropertyDescriptor) => {
    if (rules.allOf && rules.allOf.length > 0) {
      RequireAllPermissions(...rules.allOf)(target, propertyKey, descriptor);
    }
    if (rules.anyOf && rules.anyOf.length > 0) {
      RequireAnyPermission(...rules.anyOf)(target, propertyKey, descriptor);
    }
    if (rules.requireOwnership) {
      const ownershipOptions =
        typeof rules.requireOwnership === 'object' ? rules.requireOwnership : {};
      RequireOwnership(ownershipOptions)(target, propertyKey, descriptor);
    }
    if (rules.requireDelegation) {
      RequireDelegation()(target, propertyKey, descriptor);
    }
    if (rules.resourceType) {
      ResourceType(rules.resourceType)(target, propertyKey, descriptor);
    }
    if (rules.policy) {
      PermissionPolicy(rules.policy.name, rules.policy.config)(target, propertyKey, descriptor);
    }
    return descriptor;
  };
};
