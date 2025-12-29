import { JwtModuleOptions } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

export const getJwtConfig = (
  configService: ConfigService,
): JwtModuleOptions => ({
  secret: configService.get('app.jwt.secret'),
  signOptions: {
    expiresIn: `${configService.get('app.jwt.expiresIn')}s`,
  },
});

export const getJwtRefreshConfig = (
  configService: ConfigService,
): JwtModuleOptions => ({
  secret: configService.get('app.jwt.refreshSecret'),
  signOptions: {
    expiresIn: `${configService.get('app.jwt.refreshExpiresIn')}s`,
  },
});
