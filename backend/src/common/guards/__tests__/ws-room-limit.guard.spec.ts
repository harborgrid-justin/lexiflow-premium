import { ConfigService } from '@nestjs/config';
import { WsRoomLimitGuard } from '../ws-room-limit.guard';
import { Socket } from 'socket.io';

describe('WsRoomLimitGuard', () => {
  let guard: WsRoomLimitGuard;
  let configService: ConfigService;
  let mockClient: Partial<Socket>;

  beforeEach(() => {
    // Mock ConfigService
    configService = {
      get: jest.fn((key: string, defaultValue: any) => {
        const config: Record<string, any> = {
          'resourceLimits.websocket.maxRoomsPerUser': 5,
        };
        return config[key] !== undefined ? config[key] : defaultValue;
      }),
    } as any;

    guard = new WsRoomLimitGuard(configService);

    // Mock Socket.io client
    mockClient = {
      id: 'socket-123',
      handshake: {
        query: {},
      } as any,
    };
  });

  describe('canJoinRoom', () => {
    it('should allow joining room within limit', () => {
      (mockClient as any).userId = 'user-1';

      const result = guard.canJoinRoom(mockClient as Socket, 'room-1');

      expect(result.allowed).toBe(true);
      expect(result.currentCount).toBe(1);
    });

    it('should allow joining multiple rooms up to limit', () => {
      (mockClient as any).userId = 'user-1';

      for (let i = 1; i <= 5; i++) {
        const result = guard.canJoinRoom(mockClient as Socket, `room-${i}`);
        expect(result.allowed).toBe(true);
        expect(result.currentCount).toBe(i);
      }
    });

    it('should reject joining room when limit is reached', () => {
      (mockClient as any).userId = 'user-1';

      // Join 5 rooms (the limit)
      for (let i = 1; i <= 5; i++) {
        guard.canJoinRoom(mockClient as Socket, `room-${i}`);
      }

      // Try to join 6th room
      const result = guard.canJoinRoom(mockClient as Socket, 'room-6');

      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('5 concurrent room subscriptions');
      expect(result.currentCount).toBe(5);
    });

    it('should allow rejoining the same room', () => {
      (mockClient as any).userId = 'user-1';

      guard.canJoinRoom(mockClient as Socket, 'room-1');
      const result = guard.canJoinRoom(mockClient as Socket, 'room-1');

      expect(result.allowed).toBe(true);
      expect(result.currentCount).toBe(1);
    });

    it('should allow anonymous users', () => {
      // No userId set
      const result = guard.canJoinRoom(mockClient as Socket, 'room-1');

      expect(result.allowed).toBe(true);
      expect(result.currentCount).toBeUndefined();
    });

    it('should track rooms independently per user', () => {
      (mockClient as any).userId = 'user-1';
      guard.canJoinRoom(mockClient as Socket, 'room-1');

      const mockClient2 = { ...mockClient, id: 'socket-456', userId: 'user-2' };
      const result = guard.canJoinRoom(mockClient2 as Socket, 'room-1');

      expect(result.allowed).toBe(true);
      expect(result.currentCount).toBe(1);
    });

    it('should extract userId from handshake query', () => {
      mockClient.handshake!.query.userId = 'user-from-query';

      const result = guard.canJoinRoom(mockClient as Socket, 'room-1');

      expect(result.allowed).toBe(true);
      expect(result.currentCount).toBe(1);

      const stats = guard.getStats();
      expect(stats.userStats).toContainEqual({
        userId: 'user-from-query',
        roomCount: 1,
      });
    });

    it('should handle null userId', () => {
      (mockClient as any).userId = null;

      const result = guard.canJoinRoom(mockClient as Socket, 'room-1');

      expect(result.allowed).toBe(true);
      expect(result.currentCount).toBeUndefined();
    });
  });

  describe('leaveRoom', () => {
    it('should remove room from user tracking', () => {
      (mockClient as any).userId = 'user-1';

      guard.canJoinRoom(mockClient as Socket, 'room-1');
      guard.canJoinRoom(mockClient as Socket, 'room-2');

      guard.leaveRoom(mockClient as Socket, 'room-1');

      const result = guard.canJoinRoom(mockClient as Socket, 'room-1');
      expect(result.currentCount).toBe(2);
    });

    it('should remove user entry when all rooms are left', () => {
      (mockClient as any).userId = 'user-1';

      guard.canJoinRoom(mockClient as Socket, 'room-1');
      guard.leaveRoom(mockClient as Socket, 'room-1');

      const stats = guard.getStats();
      expect(stats.totalUsers).toBe(0);
    });

    it('should handle leaving non-existent room', () => {
      (mockClient as any).userId = 'user-1';

      expect(() => {
        guard.leaveRoom(mockClient as Socket, 'room-1');
      }).not.toThrow();
    });

    it('should handle leaving room for anonymous user', () => {
      expect(() => {
        guard.leaveRoom(mockClient as Socket, 'room-1');
      }).not.toThrow();
    });

    it('should handle leaving room for non-existent user', () => {
      (mockClient as any).userId = 'non-existent-user';

      expect(() => {
        guard.leaveRoom(mockClient as Socket, 'room-1');
      }).not.toThrow();
    });

    it('should allow rejoining room after leaving', () => {
      (mockClient as any).userId = 'user-1';

      // Join and leave same room
      guard.canJoinRoom(mockClient as Socket, 'room-1');
      guard.leaveRoom(mockClient as Socket, 'room-1');

      // Should be able to join again
      const result = guard.canJoinRoom(mockClient as Socket, 'room-1');
      expect(result.allowed).toBe(true);
      expect(result.currentCount).toBe(1);
    });
  });

  describe('cleanupUser', () => {
    it('should remove all rooms for a user', () => {
      (mockClient as any).userId = 'user-1';

      guard.canJoinRoom(mockClient as Socket, 'room-1');
      guard.canJoinRoom(mockClient as Socket, 'room-2');
      guard.canJoinRoom(mockClient as Socket, 'room-3');

      guard.cleanupUser(mockClient as Socket);

      const stats = guard.getStats();
      expect(stats.totalUsers).toBe(0);
    });

    it('should handle cleanup for anonymous user', () => {
      expect(() => {
        guard.cleanupUser(mockClient as Socket);
      }).not.toThrow();
    });

    it('should handle cleanup for non-existent user', () => {
      (mockClient as any).userId = 'non-existent-user';

      expect(() => {
        guard.cleanupUser(mockClient as Socket);
      }).not.toThrow();
    });

    it('should allow user to join rooms after cleanup', () => {
      (mockClient as any).userId = 'user-1';

      guard.canJoinRoom(mockClient as Socket, 'room-1');
      guard.cleanupUser(mockClient as Socket);

      const result = guard.canJoinRoom(mockClient as Socket, 'room-1');
      expect(result.allowed).toBe(true);
    });

    it('should not affect other users when cleaning up one user', () => {
      (mockClient as any).userId = 'user-1';
      guard.canJoinRoom(mockClient as Socket, 'room-1');

      const mockClient2 = { ...mockClient, id: 'socket-456', userId: 'user-2' };
      guard.canJoinRoom(mockClient2 as Socket, 'room-2');

      guard.cleanupUser(mockClient as Socket);

      const stats = guard.getStats();
      expect(stats.totalUsers).toBe(1);
      expect(stats.userStats[0].userId).toBe('user-2');
    });
  });

  describe('getUserRoomCount', () => {
    it('should return current room count for user', () => {
      (mockClient as any).userId = 'user-1';

      guard.canJoinRoom(mockClient as Socket, 'room-1');
      guard.canJoinRoom(mockClient as Socket, 'room-2');

      const count = guard.getUserRoomCount(mockClient as Socket);
      expect(count).toBe(2);
    });

    it('should return 0 for user with no rooms', () => {
      (mockClient as any).userId = 'user-1';

      const count = guard.getUserRoomCount(mockClient as Socket);
      expect(count).toBe(0);
    });

    it('should return 0 for anonymous user', () => {
      const count = guard.getUserRoomCount(mockClient as Socket);
      expect(count).toBe(0);
    });

    it('should update count after joining rooms', () => {
      (mockClient as any).userId = 'user-1';

      expect(guard.getUserRoomCount(mockClient as Socket)).toBe(0);

      guard.canJoinRoom(mockClient as Socket, 'room-1');
      expect(guard.getUserRoomCount(mockClient as Socket)).toBe(1);

      guard.canJoinRoom(mockClient as Socket, 'room-2');
      expect(guard.getUserRoomCount(mockClient as Socket)).toBe(2);
    });

    it('should update count after leaving rooms', () => {
      (mockClient as any).userId = 'user-1';

      guard.canJoinRoom(mockClient as Socket, 'room-1');
      guard.canJoinRoom(mockClient as Socket, 'room-2');

      guard.leaveRoom(mockClient as Socket, 'room-1');
      expect(guard.getUserRoomCount(mockClient as Socket)).toBe(1);
    });
  });

  describe('getStats', () => {
    it('should return correct statistics', () => {
      (mockClient as any).userId = 'user-1';
      guard.canJoinRoom(mockClient as Socket, 'room-1');
      guard.canJoinRoom(mockClient as Socket, 'room-2');

      const stats = guard.getStats();

      expect(stats).toEqual({
        totalUsers: 1,
        maxRoomsPerUser: 5,
        userStats: [
          {
            userId: 'user-1',
            roomCount: 2,
          },
        ],
      });
    });

    it('should return empty stats initially', () => {
      const stats = guard.getStats();

      expect(stats).toEqual({
        totalUsers: 0,
        maxRoomsPerUser: 5,
        userStats: [],
      });
    });

    it('should track multiple users', () => {
      (mockClient as any).userId = 'user-1';
      guard.canJoinRoom(mockClient as Socket, 'room-1');

      const mockClient2 = { ...mockClient, id: 'socket-456', userId: 'user-2' };
      guard.canJoinRoom(mockClient2 as Socket, 'room-2');

      const stats = guard.getStats();

      expect(stats.totalUsers).toBe(2);
      expect(stats.userStats).toHaveLength(2);
      expect(stats.userStats).toContainEqual({
        userId: 'user-1',
        roomCount: 1,
      });
      expect(stats.userStats).toContainEqual({
        userId: 'user-2',
        roomCount: 1,
      });
    });

    it('should reflect changes after room operations', () => {
      (mockClient as any).userId = 'user-1';

      guard.canJoinRoom(mockClient as Socket, 'room-1');
      guard.canJoinRoom(mockClient as Socket, 'room-2');

      let stats = guard.getStats();
      expect(stats.userStats[0].roomCount).toBe(2);

      guard.leaveRoom(mockClient as Socket, 'room-1');

      stats = guard.getStats();
      expect(stats.userStats[0].roomCount).toBe(1);
    });
  });

  describe('Configuration', () => {
    it('should use custom config values', () => {
      const customConfig = {
        get: jest.fn((key: string, defaultValue: any) => {
          const config: Record<string, any> = {
            'resourceLimits.websocket.maxRoomsPerUser': 10,
          };
          return config[key] !== undefined ? config[key] : defaultValue;
        }),
      } as any;

      const customGuard = new WsRoomLimitGuard(customConfig);
      const stats = customGuard.getStats();

      expect(stats.maxRoomsPerUser).toBe(10);
    });

    it('should use default value when config returns undefined', () => {
      const emptyConfig = {
        get: jest.fn((key: string, defaultValue: any) => defaultValue),
      } as any;

      const customGuard = new WsRoomLimitGuard(emptyConfig);
      const stats = customGuard.getStats();

      expect(stats.maxRoomsPerUser).toBe(50); // Default value
    });
  });

  describe('Edge Cases', () => {
    it('should handle rapid room join attempts', () => {
      (mockClient as any).userId = 'user-1';

      for (let i = 1; i <= 10; i++) {
        guard.canJoinRoom(mockClient as Socket, `room-${i}`);
      }

      const count = guard.getUserRoomCount(mockClient as Socket);
      expect(count).toBe(5); // Only 5 allowed
    });

    it('should handle same room joined multiple times', () => {
      (mockClient as any).userId = 'user-1';

      guard.canJoinRoom(mockClient as Socket, 'room-1');
      guard.canJoinRoom(mockClient as Socket, 'room-1');
      guard.canJoinRoom(mockClient as Socket, 'room-1');

      const count = guard.getUserRoomCount(mockClient as Socket);
      expect(count).toBe(1);
    });

    it('should handle room IDs with special characters', () => {
      (mockClient as any).userId = 'user-1';

      const result = guard.canJoinRoom(
        mockClient as Socket,
        'room:special-chars_123.456'
      );

      expect(result.allowed).toBe(true);
    });

    it('should handle empty room ID', () => {
      (mockClient as any).userId = 'user-1';

      const result = guard.canJoinRoom(mockClient as Socket, '');

      expect(result.allowed).toBe(true);
    });

    it('should handle concurrent operations from same user', () => {
      (mockClient as any).userId = 'user-1';

      const promises = [];
      for (let i = 1; i <= 10; i++) {
        promises.push(
          Promise.resolve(guard.canJoinRoom(mockClient as Socket, `room-${i}`))
        );
      }

      return Promise.all(promises).then(() => {
        const count = guard.getUserRoomCount(mockClient as Socket);
        expect(count).toBeLessThanOrEqual(5);
      });
    });
  });
});
