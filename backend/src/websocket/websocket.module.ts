import { Module, OnModuleInit } from '@nestjs/common';
import { WebSocketGateway as WSGateway } from './websocket.gateway';
import { WebSocketService } from './websocket.service';

/**
 * WebSocket Module
 * Provides real-time communication capabilities for LexiFlow
 *
 * Features:
 * - Socket.IO integration
 * - JWT authentication
 * - Room-based subscriptions
 * - Event broadcasting
 * - Presence tracking
 * - Offline message queuing
 *
 * Usage:
 * Import this module in your feature modules to use WebSocketService
 *
 * @example
 * @Module({
 *   imports: [WebSocketModule],
 *   ...
 * })
 * export class CasesModule {}
 *
 * @Injectable()
 * export class CasesService {
 *   constructor(private websocketService: WebSocketService) {}
 *
 *   async createCase(data: CreateCaseDto) {
 *     const case = await this.caseRepository.save(data);
 *
 *     // Broadcast real-time event
 *     this.websocketService.broadcastCaseCreated({
 *       caseId: case.id,
 *       title: case.title,
 *       ...
 *     });
 *
 *     return case;
 *   }
 * }
 */
@Module({
  providers: [WSGateway, WebSocketService],
  exports: [WebSocketService],
})
export class WebSocketModule implements OnModuleInit {
  constructor(
    private websocketGateway: WSGateway,
    private websocketService: WebSocketService,
  ) {}

  /**
   * Initialize module
   * Register gateway with service
   */
  onModuleInit() {
    this.websocketService.setGateway(this.websocketGateway);
  }
}
