/**
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║                         BASE SERVICE                                      ║
 * ║              Re-export from ServiceLifecycle                              ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 *
 * @module services/core/BaseService
 * @description Re-export BaseService from ServiceLifecycle for convenience
 */

export { BaseService, ServiceError, ServiceState } from "./ServiceLifecycle";
export type { IService, ServiceConfig } from "./ServiceLifecycle";
