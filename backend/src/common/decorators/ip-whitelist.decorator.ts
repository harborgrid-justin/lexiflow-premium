import { SetMetadata } from '@nestjs/common';

export const IP_WHITELIST_KEY = 'ipWhitelist';

/**
 * IP Whitelist Options
 */
export interface IpWhitelistOptions {
  ips?: string[];
  ranges?: string[];
  allowLocalhost?: boolean;
  allowPrivateNetworks?: boolean;
}

/**
 * IP Whitelist Decorator
 *
 * Restricts endpoint access to specific IP addresses or ranges.
 * Useful for admin endpoints, webhooks, or internal APIs.
 *
 * @example
 * @IpWhitelist({
 *   ips: ['192.168.1.100', '10.0.0.50'],
 *   ranges: ['192.168.1.0/24'],
 *   allowLocalhost: true
 * })
 * @Post('admin/maintenance')
 * async triggerMaintenance() {}
 */
export const IpWhitelist = (options: IpWhitelistOptions) =>
  SetMetadata(IP_WHITELIST_KEY, options);
