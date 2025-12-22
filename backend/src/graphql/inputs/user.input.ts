import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class LoginInput {
  @Field()
  email!: string;

  @Field()
  password!: string;

  @Field({ nullable: true })
  mfaCode?: string;
}

@InputType()
export class RegisterInput {
  @Field()
  email!: string;

  @Field()
  password!: string;

  @Field()
  firstName!: string;

  @Field()
  lastName!: string;

  @Field({ nullable: true })
  phone?: string;

  @Field({ nullable: true })
  barNumber?: string;
}

@InputType()
export class UpdateUserInput {
  @Field({ nullable: true })
  firstName?: string;

  @Field({ nullable: true })
  lastName?: string;

  @Field({ nullable: true })
  phone?: string;

  @Field({ nullable: true })
  avatar?: string;

  @Field({ nullable: true })
  title?: string;

  @Field({ nullable: true })
  department?: string;

  @Field({ nullable: true })
  bio?: string;

  @Field({ nullable: true })
  barNumber?: string;
}

@InputType()
export class UserFilterInput {
  @Field(() => [String], { nullable: true })
  role?: string[];

  @Field(() => [String], { nullable: true })
  status?: string[];

  @Field({ nullable: true })
  search?: string;

  @Field({ nullable: true })
  department?: string;
}

@InputType()
export class ChangePasswordInput {
  @Field()
  currentPassword!: string;

  @Field()
  newPassword!: string;
}
