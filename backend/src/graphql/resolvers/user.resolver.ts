import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { UserType, AuthPayload } from '@graphql/types/user.type';
import { LoginInput, RegisterInput, UpdateUserInput, UserFilterInput, ChangePasswordInput } from '@graphql/inputs/user.input';
import { CurrentUser } from '@auth/decorators/current-user.decorator';
import { GqlAuthGuard } from '@auth/guards/gql-auth.guard';
import { Public } from '@auth/decorators/public.decorator';
import { UsersService } from '@users/users.service';
import { AuthService } from '@auth/auth.service';
import { AuthenticatedUser } from '@auth/interfaces/authenticated-user.interface';

@Resolver(() => UserType)
export class UserResolver {
  constructor(
    private userService: UsersService,
    private authService: AuthService,
  ) {}

  @Query(() => [UserType], { name: 'users' })
  @UseGuards(GqlAuthGuard)
  async getUsers(@Args('filter', { nullable: true }) filter?: UserFilterInput): Promise<UserType[]> {
    const result = await this.userService.findAll();
    const users = result.data;
    // Apply filter if provided
    if (filter?.role && filter.role.length > 0) {
      return users.filter(u => filter.role?.includes(u.role)) as unknown as UserType[];
    }
    if (filter?.isActive !== undefined) {
      return users.filter(u => u.isActive === filter.isActive) as unknown as UserType[];
    }
    return users as unknown as UserType[];
  }

  @Query(() => UserType, { name: 'user', nullable: true })
  @UseGuards(GqlAuthGuard)
  async getUser(@Args('id', { type: () => ID }) id: string): Promise<UserType | null> {
    const user = await this.userService.findById(id);
    return user as UserType | null;
  }

  @Query(() => UserType, { name: 'me' })
  @UseGuards(GqlAuthGuard)
  async getCurrentUser(@CurrentUser() user: AuthenticatedUser): Promise<UserType> {
    const currentUser = await this.userService.findById(user.id);
    if (!currentUser) {
      throw new Error('User not found');
    }
    return currentUser as unknown as UserType;
  }

  @Mutation(() => AuthPayload)
  @Public()
  async login(@Args('input') input: LoginInput): Promise<AuthPayload> {
    const loginDto = { email: input.email, password: input.password };
    const result = await this.authService.login(loginDto);
    if ('requiresMfa' in result) {
      throw new Error('MFA required - not yet supported in GraphQL API');
    }
    return {
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      user: result.user as unknown as UserType,
      expiresIn: 3600, // Default 1 hour
    };
  }

  @Mutation(() => AuthPayload)
  @Public()
  async register(@Args('input') input: RegisterInput): Promise<AuthPayload> {
    const registerDto = {
      email: input.email,
      password: input.password,
      firstName: input.firstName,
      lastName: input.lastName,
      role: (input as any).role,
    };
    const result = await this.authService.register(registerDto);
    return {
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      user: result.user as unknown as UserType,
      expiresIn: 3600, // Default 1 hour
    };
  }

  @Mutation(() => UserType)
  @UseGuards(GqlAuthGuard)
  async updateUser(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateUserInput,
  ): Promise<UserType> {
    // Verify user has permission to update (simplified for now)
    const updateDto = {
      email: (input as any).email,
      firstName: input.firstName,
      lastName: input.lastName,
      role: (input as any).role,
      isActive: (input as any).isActive,
      mfaEnabled: (input as any).mfaEnabled,
    };
    const updatedUser = await this.userService.update(id, updateDto);
    return updatedUser as unknown as UserType;
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  async changePassword(
    @Args('input') input: ChangePasswordInput,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<boolean> {
    await this.authService.changePassword(user.id, input.currentPassword, input.newPassword);
    return true;
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  async enableMfa(@CurrentUser() user: AuthenticatedUser): Promise<boolean> {
    // Note: This requires a verification code in production.
    // For now, just set up MFA which returns a QR code
    await this.authService.setupMfa(user.id);
    // In a real implementation, client would scan QR and provide verification code
    throw new Error('MFA setup requires QR code scanning - use REST API endpoint');
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  async disableMfa(): Promise<boolean> {
    // Note: This requires a verification code for security
    throw new Error('MFA disable requires verification code - use REST API endpoint');
  }

  @Mutation(() => String)
  @UseGuards(GqlAuthGuard)
  async refreshToken(@Args('refreshToken') refreshToken: string): Promise<string> {
    const tokens = await this.authService.refresh(refreshToken);
    return tokens.accessToken;
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  async logout(@CurrentUser() user: AuthenticatedUser): Promise<boolean> {
    // Note: logout with token tracking requires jti and exp from the JWT payload
    // For GraphQL, we'll just invalidate by user ID
    await this.authService.logout(user.id, '', 0);
    return true;
  }
}
