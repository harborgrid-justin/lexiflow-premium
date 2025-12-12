import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-microsoft';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/users.service';
import { Role } from '../../common/enums/role.enum';

@Injectable()
export class MicrosoftStrategy extends PassportStrategy(Strategy, 'microsoft') {
  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
  ) {
    super({
      clientID: configService.get<string>('MICROSOFT_CLIENT_ID') || 'default-client-id',
      clientSecret: configService.get<string>('MICROSOFT_CLIENT_SECRET') || 'default-secret',
      callbackURL: configService.get<string>('MICROSOFT_CALLBACK_URL') || 'http://localhost:3000/auth/microsoft/callback',
      scope: ['user.read'],
      tenant: configService.get<string>('MICROSOFT_TENANT') || 'common',
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    const { id, emails, displayName, _json } = profile;

    if (!emails || emails.length === 0) {
      throw new UnauthorizedException('No email associated with Microsoft account');
    }

    const email = emails[0].value;
    const nameParts = displayName.split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    // Check if user exists
    let user = await this.usersService.findByEmail(email);

    if (!user) {
      // Auto-register user with Microsoft OAuth
      user = await this.usersService.create({
        email,
        firstName,
        lastName,
        password: '', // No password for OAuth users
        role: Role.CLIENT_USER,
        isActive: true,
        mfaEnabled: false,
        microsoftId: id,
        avatar: _json.picture,
      });
    } else if (!user.microsoftId) {
      // Link Microsoft account to existing user
      await this.usersService.update(user.id, {
        microsoftId: id,
        avatar: user.avatar || _json.picture,
      });
    }

    done(null, user);
  }
}
