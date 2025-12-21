/**
 * errorHandler.test.ts
 * Tests for the centralized error handling utility
 */

import { ErrorHandler, errorHandler, AppError } from '../../utils/errorHandler';

describe('ErrorHandler', () => {
  let consoleErrorSpy: jest.SpyInstance;
  let consoleWarnSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
    consoleWarnSpy.mockRestore();
    jest.clearAllTimers();
  });

  describe('getInstance', () => {
    it('should return singleton instance', () => {
      const instance1 = ErrorHandler.getInstance();
      const instance2 = ErrorHandler.getInstance();
      expect(instance1).toBe(instance2);
      expect(instance1).toBeInstanceOf(ErrorHandler);
    });

    it('should return same instance as exported errorHandler', () => {
      const instance = ErrorHandler.getInstance();
      expect(errorHandler).toBe(instance);
    });
  });

  describe('logError', () => {
    it('should log error with context', () => {
      const error = new Error('Test error message');
      errorHandler.logError(error, 'TestContext');
      
      expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
      const logCall = consoleErrorSpy.mock.calls[0];
      expect(logCall[0]).toContain('[TestContext]');
      expect(logCall[1]).toMatchObject({
        message: 'Test error message',
        context: 'TestContext'
      });
    });

    it('should log error without context', () => {
      const error = new Error('Another test error');
      errorHandler.logError(error);
      
      expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
      const logCall = consoleErrorSpy.mock.calls[0];
      expect(logCall[0]).toContain('[General]');
      expect(logCall[1]).toMatchObject({
        message: 'Another test error',
        context: 'General'
      });
    });

    it('should include stack trace in log', () => {
      const error = new Error('Stack test');
      errorHandler.logError(error, 'StackContext');
      
      const logCall = consoleErrorSpy.mock.calls[0];
      expect(logCall[1]).toHaveProperty('stack');
      expect(logCall[1].stack).toBeDefined();
    });

    it('should handle AppError with code and meta', () => {
      const appError: AppError = new Error('App error') as AppError;
      appError.code = 'ERR_001';
      appError.context = { userId: '123', action: 'test' };
      
      errorHandler.logError(appError, 'AppContext');
      
      const logCall = consoleErrorSpy.mock.calls[0];
      expect(logCall[1]).toMatchObject({
        message: 'App error',
        code: 'ERR_001',
        meta: { userId: '123', action: 'test' }
      });
    });

    it('should aggregate repeated errors within time window', () => {
      jest.useFakeTimers();
      const error = new Error('Repeated error');
      
      // Log same error multiple times within aggregation window
      errorHandler.logError(error, 'TestContext');
      errorHandler.logError(error, 'TestContext');
      errorHandler.logError(error, 'TestContext');
      
      // Should only log once (first occurrence)
      expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
      
      jest.useRealTimers();
    });

    it('should log summary when aggregated errors expire', () => {
      jest.useFakeTimers();
      const error = new Error('Repeated error with summary');
      
      // Log same error 3 times
      errorHandler.logError(error, 'SummaryContext');
      errorHandler.logError(error, 'SummaryContext');
      errorHandler.logError(error, 'SummaryContext');
      
      // Advance time beyond aggregation window (5 seconds)
      jest.advanceTimersByTime(6000);
      
      // Log again - should trigger summary
      errorHandler.logError(error, 'SummaryContext');
      
      // Should have 2 console.error (first + after window) and 1 console.warn (summary)
      expect(consoleErrorSpy).toHaveBeenCalledTimes(2);
      expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
      expect(consoleWarnSpy.mock.calls[0][0]).toContain('repeated 3 times');
      
      jest.useRealTimers();
    });
  });

  describe('handleFatalError', () => {
    it('should log error with FATAL context', () => {
      const fatalError = new Error('Fatal error occurred');
      errorHandler.handleFatalError(fatalError);
      
      expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
      const logCall = consoleErrorSpy.mock.calls[0];
      expect(logCall[0]).toContain('[FATAL]');
      expect(logCall[1]).toMatchObject({
        message: 'Fatal error occurred',
        context: 'FATAL'
      });
    });
  });

  describe('formatErrorMessage', () => {
    it('should format Error instance', () => {
      const error = new Error('Test error message');
      const formatted = errorHandler.formatErrorMessage(error);
      expect(formatted).toBe('Test error message');
    });

    it('should format string error', () => {
      const errorString = 'This is a string error';
      const formatted = errorHandler.formatErrorMessage(errorString);
      expect(formatted).toBe('This is a string error');
    });

    it('should format object error', () => {
      const errorObj = { code: 'ERR_001', details: 'Something went wrong' };
      const formatted = errorHandler.formatErrorMessage(errorObj);
      expect(formatted).toBe(JSON.stringify(errorObj));
    });

    it('should handle circular object references', () => {
      const circularObj: any = { name: 'test' };
      circularObj.self = circularObj; // Create circular reference
      
      const formatted = errorHandler.formatErrorMessage(circularObj);
      // Should fall back to String() conversion
      expect(formatted).toContain('[object Object]');
    });

    it('should handle null', () => {
      const formatted = errorHandler.formatErrorMessage(null);
      expect(formatted).toBe('An unexpected error occurred.');
    });

    it('should handle undefined', () => {
      const formatted = errorHandler.formatErrorMessage(undefined);
      expect(formatted).toBe('An unexpected error occurred.');
    });

    it('should handle number', () => {
      const formatted = errorHandler.formatErrorMessage(404);
      expect(formatted).toBe('An unexpected error occurred.');
    });
  });
});
