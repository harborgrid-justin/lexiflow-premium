import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { UserType, AuthPayload } from '../types/user.type';
import { LoginInput, RegisterInput, UpdateUserInput, UserFilterInput, ChangePasswordInput } from '../inputs/user.input';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { GqlAuthGuard } from '../../auth/guards/gql-auth.guard';
import { Public } from '../../auth/decorators/public.decorator';

@Resolver(() => UserType)
export class UserResolver {
  // Inject UserService and AuthService here
  // constructor(
  //   private userService: UserService,
  //   private authService: AuthService,
  // ) {}

  @Query(() => [UserType], { name: 'users' })
  @UseGuards(GqlAuthGuard)
  async getUsers(@Args('filter', { nullable: true }) filter?: UserFilterInput): Promise<UserType[]> {
    // TODO: Implement with UserService
    // return this.userService.findAll(filter);
    return [];
  }

  @Query(() => UserType, { name: 'user', nullable: true })
  @UseGuards(GqlAuthGuard)
  async getUser(@Args('id', { type: () => ID }) id: string): Promise<UserType | null> {
    // TODO: Implement with UserService
    // return this.userService.findOne(id);
    return null;
  }

  @Query(() => UserType, { name: 'me' })
  @UseGuards(GqlAuthGuard)
  async getCurrentUser(@CurrentUser() user: any): Promise<UserType> {
    // TODO: Implement with UserService
    // return this.userService.findOne(user.id);
    throw new Error('Not implemented');
  }

  @Mutation(() => AuthPayload)
  @Public()
  async login(@Args('input') input: LoginInput): Promise<AuthPayload> {
    // TODO: Implement with AuthService
    // return this.authService.login(input);
    throw new Error('Not implemented');
  }

  @Mutation(() => AuthPayload)
  @Public()
  async register(@Args('input') input: RegisterInput): Promise<AuthPayload> {
    // TODO: Implement with AuthService
    // return this.authService.register(input);
    throw new Error('Not implemented');
  }

  @Mutation(() => UserType)
  @UseGuards(GqlAuthGuard)
  async updateUser(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateUserInput,
    @CurrentUser() user: any,
  ): Promise<UserType> {
    // TODO: Implement with UserService
    // Verify user has permission to update
    // return this.userService.update(id, input, user);
    throw new Error('Not implemented');
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  async changePassword(
    @Args('input') input: ChangePasswordInput,
    @CurrentUser() user: any,
  ): Promise<boolean> {
    // TODO: Implement with AuthService
    // await this.authService.changePassword(user.id, input);
    // return true;
    throw new Error('Not implemented');
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  async enableMfa(@CurrentUser() user: any): Promise<boolean> {
    // TODO: Implement with AuthService
    // await this.authService.enableMfa(user.id);
    // return true;
    throw new Error('Not implemented');
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  async disableMfa(@CurrentUser() user: any): Promise<boolean> {
    // TODO: Implement with AuthService
    // await this.authService.disableMfa(user.id);
    // return true;
    throw new Error('Not implemented');
  }

  @Mutation(() => String)
  @UseGuards(GqlAuthGuard)
  async refreshToken(@Args('refreshToken') refreshToken: string): Promise<string> {
    // TODO: Implement with AuthService
    // return this.authService.refreshToken(refreshToken);
    throw new Error('Not implemented');
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  async logout(@CurrentUser() user: any): Promise<boolean> {
    // TODO: Implement with AuthService
    // await this.authService.logout(user.id);
    // return true;
    throw new Error('Not implemented');
  }
}
