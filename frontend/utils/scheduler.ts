/**
 * @module utils/scheduler
 * @category Utils - Performance
 * @description Idle-based task scheduler using requestIdleCallback for non-blocking execution. Defers
 * expensive operations (analytics, seeding, filtering) until browser main thread is idle, dramatically
 * improving Interaction to Next Paint (INP) scores. Provides priority levels (user-blocking, normal,
 * background) with configurable timeouts and fallback to setTimeout for unsupported environments.
 * 
 * SYSTEMS ENGINEERING NOTE:
 * This Scheduler allows us to queue expensive operations (like analytics aggregation, 
 * data seeding, or heavy filtering) to run only when the browser main thread is idle.
 * This dramatically improves Interaction to Next Paint (INP) scores.
 */

// ============================================================================
// TYPES & INTERFACES
// ============================================================================
type TaskPriority = 'user-blocking' | 'normal' | 'background';

// ============================================================================
// SCHEDULER
// ============================================================================
export const Scheduler = {
  /**
   * Defer a task until the browser is idle.
   * Fallback to setTimeout if requestIdleCallback is not supported.
   */
  defer: (task: () => void, priority: TaskPriority = 'normal') => {
    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      const timeout = priority === 'background' ? 5000 : 1000;
      // @ts-expect-error - TS doesn't fully support RIC types in all envs yet
      window.requestIdleCallback(() => {
        task();
      }, { timeout });
    } else {
      setTimeout(task, 1);
    }
  },

  /**
   * Schedule a heavy calculation that returns a promise.
   */
  scheduleTask: <T>(task: () => T, priority: TaskPriority = 'normal'): Promise<T> => {
      return new Promise((resolve) => {
          Scheduler.defer(() => {
              const result = task();
              resolve(result);
          }, priority);
      });
  }
};
