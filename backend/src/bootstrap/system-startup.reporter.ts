import { Logger } from '@nestjs/common';

export class SystemStartupReporter {
  private static readonly logger = new Logger('system');
  private static readonly width = 64;

  private static line(char = '─'): void {
    this.logger.log(char.repeat(this.width));
  }

  private static pad(label: string, value: string): string {
    return `${label.padEnd(28)}${value}`;
  }

  static header(): void {
    this.line();
    this.logger.log('SYSTEM BOOTSTRAP SEQUENCE');
    this.line();
  }

  static environment(): void {
    this.logger.log(this.pad('Environment', process.env.NODE_ENV ?? 'development'));
    this.logger.log(this.pad('Demo mode', process.env.DEMO_MODE === 'true' ? 'ENABLED' : 'DISABLED'));
    this.logger.log(this.pad('Redis / Bull', this.redisEnabled() ? 'ENABLED' : 'DISABLED'));
    this.line();
  }

  static section(title: string): void {
    this.logger.log(title.toUpperCase());
    this.line('-');
  }

  static module(entry: { name: string; status: 'ENABLED' | 'DISABLED' }): void {
    this.logger.log(`${entry.name.padEnd(36)} ${entry.status}`);
  }

  static network(bind: { host: string; port: number }): void {
    this.section('Network');
    this.logger.log(this.pad('Bind address', bind.host));
    this.logger.log(this.pad('Port', String(bind.port)));
    this.line();
  }

  static footer(): void {
    this.logger.log('SYSTEM READY');
    this.line();
  }

  private static redisEnabled(): boolean {
    return process.env.REDIS_ENABLED !== 'false' && process.env.DEMO_MODE !== 'true';
  }
}
