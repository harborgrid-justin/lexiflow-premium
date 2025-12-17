# LexiFlow API - Swagger Documentation

## 📚 Accessing the API Documentation

Once the backend server is running, access the interactive Swagger UI at:

**Local Development:**
```
http://localhost:5000/api/docs
```

## 🚀 Quick Start

### 1. Start the Backend Server

```bash
cd backend
npm install
npm run start:dev
```

The server will start on port 3000 by default.

### 2. Open Swagger UI

Navigate to `http://localhost:5000/api/docs` in your browser.

### 3. Authenticate

To test protected endpoints:

1. Click the **"Authorize" 🔓** button at the top right
2. Use the test credentials to get a JWT token:
   - POST to `/api/v1/auth/login`
   - Email: `admin@lexiflow.com`
   - Password: `Admin123!`
3. Copy the `access_token` from the response
4. Enter `Bearer <your_token>` in the authorization dialog
5. Click **"Authorize"**

Now all API calls will include your authentication token!

## 📖 API Features

### Comprehensive Coverage

The Swagger documentation covers all 28+ API domains:

- **⚖️ Case Management** - Cases, parties, teams, phases, motions
- **📄 Document Management** - Upload, version control, OCR processing
- **🔍 Discovery** - E-discovery, evidence collection, review
- **💰 Billing & Finance** - Time tracking, invoices, trust accounts
- **✅ Compliance** - Conflict checks, ethical walls, audit trails
- **💬 Communications** - Messaging, email integration, notifications
- **📈 Analytics** - Business intelligence, reporting, insights
- **🔗 Integrations** - External API connections, webhooks

### Interactive Testing

- **Try It Out** - Execute API calls directly from the browser
- **Request Examples** - Pre-filled sample data for all endpoints
- **Response Schemas** - Detailed response structure documentation
- **Error Handling** - Comprehensive error response examples

### Advanced Features

#### Pagination
All list endpoints support pagination:
```
GET /api/v1/cases?page=2&limit=50&sortBy=createdAt&order=DESC
```

#### Filtering
Filter results using query parameters:
```
GET /api/v1/cases?status=active&type=civil&search=contract
```

#### File Uploads
Upload documents with multipart/form-data:
```
POST /api/v1/documents
Content-Type: multipart/form-data

file: [binary data]
title: "Case Brief"
type: "legal-brief"
```

#### Bulk Operations
Perform operations on multiple resources:
```
POST /api/v1/cases/bulk-update
Body: [{ id: "...", status: "active" }, ...]
```

## 🎨 UI Customization

The Swagger UI is fully customized with:

- **Modern Design** - Professional color scheme and typography
- **HTTP Method Colors** - GET (blue), POST (green), PUT (orange), DELETE (red)
- **Emoji Icons** - Visual category identification
- **Collapsible Sections** - Organized by domain/tag
- **Dark Mode Support** - Automatic theme detection
- **Persistent Auth** - Authorization tokens saved in browser

## 🔐 Authentication Methods

### 1. JWT Bearer Token (Primary)
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 2. API Key (Service-to-Service)
```
X-API-Key: your-api-key-here
```

### 3. Refresh Token Cookie
```
Cookie: refresh_token=your-refresh-token
```

## 📊 Response Format

### Success Response
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "Smith v. Jones",
    "status": "active"
  },
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

### Error Response
```json
{
  "statusCode": 400,
  "message": ["title should not be empty"],
  "error": "Bad Request",
  "timestamp": "2025-12-15T10:30:00.000Z",
  "path": "/api/v1/cases"
}
```

## 🛠️ Development

### Custom Swagger Decorators

Use pre-built decorators for consistent documentation:

```typescript
import { ApiCreateOperation, ApiPaginationQuery } from '@/common/decorators/swagger.decorators';

@Controller('api/v1/resources')
export class ResourceController {
  
  @Post()
  @ApiCreateOperation('Create a new resource', ResourceDto)
  create(@Body() dto: CreateResourceDto) {
    // ...
  }

  @Get()
  @ApiReadOperation('List resources', PaginatedResourceDto, true)
  findAll(@Query() filter: FilterDto) {
    // ...
  }
}
```

### Available Decorators

- `@ApiCreateOperation()` - POST endpoints
- `@ApiReadOperation()` - GET endpoints  
- `@ApiUpdateOperation()` - PUT/PATCH endpoints
- `@ApiDeleteOperation()` - DELETE endpoints
- `@ApiFileUploadOperation()` - File upload endpoints
- `@ApiSearchOperation()` - Search endpoints
- `@ApiBulkOperation()` - Bulk operations
- `@ApiExportOperation()` - Export/download endpoints
- `@ApiStandardResponses()` - Common error responses
- `@ApiPaginationQuery()` - Pagination parameters
- `@ApiUuidParam()` - UUID path parameters

### Enhancing DTOs

Add Swagger documentation to DTOs:

```typescript
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCaseDto {
  @ApiProperty({
    description: 'Case title',
    example: 'Smith v. Jones',
    minLength: 3,
    maxLength: 200,
  })
  title: string;

  @ApiPropertyOptional({
    description: 'Case description',
    example: 'Contract dispute involving...',
  })
  description?: string;

  @ApiProperty({
    description: 'Case type',
    enum: ['civil', 'criminal', 'family', 'corporate'],
    example: 'civil',
  })
  type: string;
}
```

## 🌐 Multiple Environments

Switch between environments in the server dropdown:

- **Development** - `http://localhost:5000`
- **Local Production** - `http://localhost:8080`
- **Staging** - `https://api-staging.lexiflow.com`
- **Production** - `https://api.lexiflow.com`

## 📝 Best Practices

### For API Consumers

1. **Always authenticate** before testing protected endpoints
2. **Check rate limits** - 1000 requests per 15 minutes when authenticated
3. **Handle errors gracefully** - Check statusCode and message fields
4. **Use pagination** for large datasets to improve performance
5. **Cache responses** when appropriate (check Cache-Control headers)
6. **Monitor response times** - Report endpoints taking >2 seconds

### For API Developers

1. **Document all endpoints** with `@ApiOperation()` and `@ApiResponse()`
2. **Provide examples** for all DTOs using `@ApiProperty({ example: ... })`
3. **Use standard decorators** from `swagger.decorators.ts`
4. **Add request/response schemas** for file operations
5. **Document error cases** - 400, 401, 403, 404, 500
6. **Keep descriptions clear** - Explain what each endpoint does
7. **Use semantic HTTP methods** - GET (read), POST (create), PUT/PATCH (update), DELETE (remove)

## 🔍 Advanced Usage

### Filtering Examples

```bash
# Filter by status
GET /api/v1/cases?status=active

# Filter by date range
GET /api/v1/cases?createdAfter=2024-01-01&createdBefore=2024-12-31

# Full-text search
GET /api/v1/cases?search=contract+dispute

# Combine filters
GET /api/v1/cases?status=active&type=civil&search=contract&page=2&limit=50
```

### Sorting Examples

```bash
# Sort by creation date (newest first)
GET /api/v1/cases?sortBy=createdAt&order=DESC

# Sort by title alphabetically
GET /api/v1/cases?sortBy=title&order=ASC

# Multiple sort criteria (if supported)
GET /api/v1/cases?sortBy=status,createdAt&order=ASC,DESC
```

### File Upload Examples

```bash
# Upload document with metadata
curl -X POST http://localhost:5000/api/v1/documents \
  -H "Authorization: Bearer <token>" \
  -F "file=@./document.pdf" \
  -F "title=Case Brief" \
  -F "type=legal-brief" \
  -F "caseId=550e8400-e29b-41d4-a716-446655440000"
```

## 📖 Additional Resources

- **Official NestJS Swagger Docs**: https://docs.nestjs.com/openapi/introduction
- **OpenAPI Specification**: https://swagger.io/specification/
- **LexiFlow Developer Portal**: https://developers.lexiflow.com
- **API Status Page**: https://status.lexiflow.com

## 🐛 Troubleshooting

### Swagger UI not loading
- Check that backend is running: `npm run start:dev`
- Verify port 3000 is accessible
- Check browser console for errors

### Authentication failing
- Ensure you're using the correct format: `Bearer <token>`
- Verify token hasn't expired (default: 1 hour)
- Check that user credentials are correct

### 404 on API calls
- Verify the base path is `/api/v1/`
- Check endpoint exists in Swagger docs
- Ensure HTTP method matches (GET, POST, etc.)

### Rate limit exceeded
- Wait for rate limit window to reset (15 minutes)
- Use authenticated requests for higher limits
- Implement exponential backoff in your client

## 📞 Support

For API support and questions:

- **Email**: support@lexiflow.com
- **Developer Slack**: https://lexiflow.slack.com/dev
- **GitHub Issues**: https://github.com/lexiflow/api/issues
- **Documentation**: https://docs.lexiflow.com

---

**Last Updated**: December 15, 2025
**API Version**: 1.0.0
**Swagger Version**: 8.0.7
