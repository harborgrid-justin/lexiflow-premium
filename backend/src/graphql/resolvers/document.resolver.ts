import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { DocumentType, DocumentConnection } from '../types/document.type';
import {
  UploadDocumentInput,
  UpdateDocumentInput,
  DocumentFilterInput,
  CreateDocumentVersionInput,
} from '../inputs/document.input';
import { PaginationInput } from '../inputs/pagination.input';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { GqlAuthGuard } from '../../auth/guards/gql-auth.guard';

@Resolver(() => DocumentType)
export class DocumentResolver {
  // Inject DocumentService here
  // constructor(private documentService: DocumentService) {}

  @Query(() => DocumentConnection, { name: 'documents' })
  @UseGuards(GqlAuthGuard)
  async getDocuments(
    @Args('filter', { nullable: true }) filter?: DocumentFilterInput,
    @Args('pagination', { nullable: true }) pagination?: PaginationInput,
  ): Promise<DocumentConnection> {
    // TODO: Implement with DocumentService
    // return this.documentService.findAll(filter, pagination);
    return {
      edges: [],
      pageInfo: {
        hasNextPage: false,
        hasPreviousPage: false,
      },
      totalCount: 0,
    };
  }

  @Query(() => DocumentType, { name: 'document', nullable: true })
  @UseGuards(GqlAuthGuard)
  async getDocument(@Args('id', { type: () => ID }) id: string): Promise<DocumentType | null> {
    // TODO: Implement with DocumentService
    // return this.documentService.findOne(id);
    return null;
  }

  @Mutation(() => DocumentType)
  @UseGuards(GqlAuthGuard)
  async uploadDocument(
    @Args('input') input: UploadDocumentInput,
    @CurrentUser() user: any,
  ): Promise<DocumentType> {
    // TODO: Implement with DocumentService
    // return this.documentService.upload(input, user);
    throw new Error('Not implemented');
  }

  @Mutation(() => DocumentType)
  @UseGuards(GqlAuthGuard)
  async updateDocument(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateDocumentInput,
    @CurrentUser() user: any,
  ): Promise<DocumentType> {
    // TODO: Implement with DocumentService
    // return this.documentService.update(id, input, user);
    throw new Error('Not implemented');
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  async deleteDocument(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: any,
  ): Promise<boolean> {
    // TODO: Implement with DocumentService
    // await this.documentService.delete(id, user);
    // return true;
    throw new Error('Not implemented');
  }

  @Mutation(() => DocumentType)
  @UseGuards(GqlAuthGuard)
  async createDocumentVersion(
    @Args('input') input: CreateDocumentVersionInput,
    @CurrentUser() user: any,
  ): Promise<DocumentType> {
    // TODO: Implement with DocumentService
    // return this.documentService.createVersion(input, user);
    throw new Error('Not implemented');
  }

  @Mutation(() => String)
  @UseGuards(GqlAuthGuard)
  async generateDocumentDownloadUrl(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: any,
  ): Promise<string> {
    // TODO: Implement with DocumentService
    // return this.documentService.generateDownloadUrl(id, user);
    throw new Error('Not implemented');
  }
}
