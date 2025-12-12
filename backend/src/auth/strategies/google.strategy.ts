import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/users.service';
import { Role } from '../../common/enums/role.enum';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
  ) {
    super({
      clientID: configService.get<string>('GOOGLE_CLIENT_ID') || 'default-client-id',
      clientSecret: configService.get<string>('GOOGLE_CLIENT_SECRET') || 'default-secret',
      callbackURL: configService.get<string>('GOOGLE_CALLBACK_URL') || 'http://localhost:3000/auth/google/callback',
      scope: ['email', 'profile'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    const { id, emails, name, photos } = profile;

    if (!emails || emails.length === 0) {
      throw new UnauthorizedException('No email associated with Google account');
    }

    const email = emails[0].value;

    // Check if user exists
    let user = await this.usersService.findByEmail(email);

    if (!user) {
      // Auto-register user with Google OAuth
      user = await this.usersService.create({
        email,
        firstName: name.givenName,
        lastName: name.familyName,
        password: '', // No password for OAuth users
        role: Role.CLIENT_USER,
        isActive: true,
        mfaEnabled: false,
        googleId: id,
        avatar: photos?.[0]?.value,
      });
    } else if (!user.googleId) {
      // Link Google account to existing user
      await this.usersService.update(user.id, {
        googleId: id,
        avatar: user.avatar || photos?.[0]?.value,
      });
    }

    done(null, user);
  }
}
