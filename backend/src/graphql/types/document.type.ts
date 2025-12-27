import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';
import { UserType } from './user.type';
import { DocumentStatus, DocumentAccessLevel } from '@common/enums/document.enum';

registerEnumType(DocumentStatus, { name: 'DocumentStatus' });
registerEnumType(DocumentAccessLevel, { name: 'DocumentAccessLevel' });

// Define PageInfo first since it's used by other types
@ObjectType()
export class PageInfo {
  @Field()
  hasNextPage!: boolean;

  @Field()
  hasPreviousPage!: boolean;

  @Field({ nullable: true })
  startCursor?: string;

  @Field({ nullable: true })
  endCursor?: string;
}

@ObjectType()
export class DocumentVersionType {
  @Field(() => ID)
  id!: string;

  @Field()
  versionNumber!: number;

  @Field()
  fileName!: string;

  @Field()
  fileSize!: number;

  @Field()
  mimeType!: string;

  @Field({ nullable: true })
  storageKey?: string;

  @Field({ nullable: true })
  changeDescription?: string;

  @Field(() => UserType)
  createdBy!: UserType;

  @Field(() => Date)
  createdAt!: Date;
}

@ObjectType()
export class ClauseType {
  @Field(() => ID)
  id!: string;

  @Field()
  title!: string;

  @Field()
  content!: string;

  @Field({ nullable: true })
  category?: string;

  @Field(() => Date)
  createdAt!: Date;
}

@ObjectType()
export class DocumentType {
  @Field(() => ID)
  id!: string;

  @Field()
  title!: string;

  @Field()
  documentType!: string;

  @Field(() => DocumentStatus)
  status!: DocumentStatus;

  @Field(() => DocumentAccessLevel)
  accessLevel!: DocumentAccessLevel;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  fileName?: string;

  @Field({ nullable: true })
  fileSize?: number;

  @Field({ nullable: true })
  mimeType?: string;

  @Field({ nullable: true })
  storageKey?: string;

  @Field({ nullable: true })
  s3Url?: string;

  @Field({ nullable: true })
  extractedText?: string;

  @Field({ nullable: true })
  ocrProcessed?: boolean;

  @Field(() => [String], { nullable: true })
  tags?: string[];

  @Field(() => [DocumentVersionType], { nullable: true })
  versions?: DocumentVersionType[];

  @Field(() => [ClauseType], { nullable: true })
  clauses?: ClauseType[];

  @Field(() => UserType)
  createdBy!: UserType;

  @Field(() => Date)
  createdAt!: Date;

  @Field(() => Date)
  updatedAt!: Date;
}

@ObjectType()
export class DocumentEdge {
  @Field(() => DocumentType)
  node!: DocumentType;

  @Field()
  cursor!: string;
}

@ObjectType()
export class DocumentConnection {
  @Field(() => [DocumentEdge])
  edges!: DocumentEdge[];

  @Field(() => PageInfo)
  pageInfo!: PageInfo;

  @Field()
  totalCount!: number;
}
