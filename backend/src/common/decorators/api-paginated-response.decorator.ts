import { applyDecorators, Type } from '@nestjs/common';
import { ApiOkResponse, getSchemaPath } from '@nestjs/swagger';

export const ApiPaginatedResponse = <TModel extends Type<unknown>>(
  model: TModel,
) => {
  return applyDecorators(
    ApiOkResponse({
      description: 'Paginated response',
      schema: {
        allOf: [
          {
            properties: {
              items: {
                type: 'array',
                items: { $ref: getSchemaPath(model) },
              },
              total: {
                type: 'number',
                description: 'Total number of items',
              },
              page: {
                type: 'number',
                description: 'Current page number',
              },
              limit: {
                type: 'number',
                description: 'Items per page',
              },
              totalPages: {
                type: 'number',
                description: 'Total number of pages',
              },
              hasNextPage: {
                type: 'boolean',
                description: 'Whether there is a next page',
              },
              hasPreviousPage: {
                type: 'boolean',
                description: 'Whether there is a previous page',
              },
            },
          },
        ],
      },
    }),
  );
};
