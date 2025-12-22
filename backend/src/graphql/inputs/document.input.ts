import { InputType, Field, ID } from '@nestjs/graphql';
import { DateRangeInput } from './pagination.input';

@InputType()
export class UploadDocumentInput {
  @Field()
  title!: string;

  @Field()
  documentType!: string;

  @Field({ nullable: true })
  description?: string;

  @Field()
  fileName!: string;

  @Field()
  fileSize!: number;

  @Field()
  mimeType!: string;

  @Field({ nullable: true })
  storageKey?: string;

  @Field(() => ID, { nullable: true })
  caseId?: string;

  @Field({ nullable: true })
  accessLevel?: string;

  @Field(() => [String], { nullable: true })
  tags?: string[];
}

@InputType()
export class UpdateDocumentInput {
  @Field({ nullable: true })
  title?: string;

  @Field({ nullable: true })
  documentType?: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  status?: string;

  @Field({ nullable: true })
  accessLevel?: string;

  @Field(() => [String], { nullable: true })
  tags?: string[];
}

@InputType()
export class DocumentFilterInput {
  @Field(() => [String], { nullable: true })
  status?: string[];

  @Field(() => [String], { nullable: true })
  documentType?: string[];

  @Field(() => [String], { nullable: true })
  accessLevel?: string[];

  @Field(() => ID, { nullable: true })
  caseId?: string;

  @Field({ nullable: true })
  search?: string;

  @Field(() => [String], { nullable: true })
  tags?: string[];

  @Field(() => DateRangeInput, { nullable: true })
  createdAt?: DateRangeInput;

  @Field(() => [ID], { nullable: true })
  createdBy?: string[];
}

@InputType()
export class CreateDocumentVersionInput {
  @Field(() => ID)
  documentId!: string;

  @Field()
  fileName!: string;

  @Field()
  fileSize!: number;

  @Field()
  mimeType!: string;

  @Field()
  storageKey!: string;

  @Field({ nullable: true })
  changeDescription?: string;
}
