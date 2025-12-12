import { JwtModuleOptions } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

export const getJwtConfig = (
  configService: ConfigService,
): JwtModuleOptions => ({
  secret: configService.get('jwt.secret'),
  signOptions: {
    expiresIn: `${configService.get('jwt.expiresIn')}s`,
  },
});

export const getJwtRefreshConfig = (
  configService: ConfigService,
): JwtModuleOptions => ({
  secret: configService.get('jwt.refreshSecret'),
  signOptions: {
    expiresIn: `${configService.get('jwt.refreshExpiresIn')}s`,
  },
});
