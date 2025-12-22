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
import { DocumentsService } from '../../documents/documents.service';
import { AuthenticatedUser } from '../../auth/interfaces/authenticated-user.interface';

@Resolver(() => DocumentType)
export class DocumentResolver {
  constructor(private documentService: DocumentsService) {}

  @Query(() => DocumentConnection, { name: 'documents' })
  @UseGuards(GqlAuthGuard)
  async getDocuments(
    @Args('filter', { nullable: true }) filter?: DocumentFilterInput,
    @Args('pagination', { nullable: true }) pagination?: PaginationInput,
  ): Promise<DocumentConnection> {
    const result = await this.documentService.findAll({
      ...filter,
      page: pagination?.page,
      limit: pagination?.limit,
      sortBy: pagination?.sortBy,
      sortOrder: pagination?.sortOrder,
    } as any);

    return {
      edges: result.data.map(doc => ({
        node: doc as any,
        cursor: doc.id,
      })),
      pageInfo: {
        hasNextPage: result.page < result.totalPages,
        hasPreviousPage: result.page > 1,
        startCursor: result.data[0]?.id,
        endCursor: result.data[result.data.length - 1]?.id,
      },
      totalCount: result.total,
    };
  }

  @Query(() => DocumentType, { name: 'document', nullable: true })
  @UseGuards(GqlAuthGuard)
  async getDocument(@Args('id', { type: () => ID }) id: string): Promise<DocumentType | null> {
    try {
      const document = await this.documentService.findOne(id);
      return document as any;
    } catch (error) {
      return null;
    }
  }

  @Mutation(() => DocumentType)
  @UseGuards(GqlAuthGuard)
  async uploadDocument(
    @Args('input') input: UploadDocumentInput,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<DocumentType> {
    // Note: File upload through GraphQL requires multipart form data
    // This creates document metadata only, actual file should be uploaded via REST API
    const document = await this.documentService.create(input as any, undefined, user.id);
    return document as any;
  }

  @Mutation(() => DocumentType)
  @UseGuards(GqlAuthGuard)
  async updateDocument(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateDocumentInput,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<DocumentType> {
    const document = await this.documentService.update(id, input as any, user.id);
    return document as any;
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  async deleteDocument(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() _user: AuthenticatedUser,
  ): Promise<boolean> {
    await this.documentService.remove(id);
    return true;
  }

  @Mutation(() => DocumentType)
  @UseGuards(GqlAuthGuard)
  async createDocumentVersion(
    @Args('input') input: CreateDocumentVersionInput,
    @CurrentUser() _user: AuthenticatedUser,
  ): Promise<DocumentType> {
    // Note: Creating versions would require updating the document with new version info
    // This would need additional service methods for full implementation
    const document = await this.documentService.findOne(input.documentId);
    return document as any;
  }

  @Mutation(() => String)
  @UseGuards(GqlAuthGuard)
  async generateDocumentDownloadUrl(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() _user: AuthenticatedUser,
  ): Promise<string> {
    // Generate a temporary download URL
    // In production, this would generate a signed URL with expiration
    return `/api/v1/documents/${id}/download`;
  }
}
