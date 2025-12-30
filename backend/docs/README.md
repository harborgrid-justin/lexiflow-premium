# LexiFlow Enterprise Backend - Document Management System

A comprehensive document management system built with NestJS for legal professionals.

## Features

- **Document Management**: Upload, version, download, and manage legal documents
- **Version Control**: Full document versioning with history tracking
- **Clause Library**: Reusable clause templates and snippets
- **Pleading Management**: Specialized pleading document tracking
- **OCR Processing**: Optical Character Recognition for scanned documents
- **File Storage**: Organized local file storage with checksums
- **Processing Jobs**: Background job processing with Bull/Redis
- **REST API**: Comprehensive REST API with Swagger documentation

## Tech Stack

- **Framework**: NestJS 11.x
- **Database**: PostgreSQL with TypeORM
- **Queue**: Bull with Redis
- **OCR**: Tesseract.js
- **API Documentation**: Swagger/OpenAPI
- **Validation**: class-validator & class-transformer

## Project Structure

```
backend/src/
├── documents/              # Document management module
│   ├── dto/               # Data transfer objects
│   ├── entities/          # Document entity
│   ├── interfaces/        # TypeScript interfaces
│   ├── documents.controller.ts
│   ├── documents.service.ts
│   └── documents.module.ts
├── document-versions/      # Version control module
│   ├── dto/
│   ├── entities/
│   ├── document-versions.controller.ts
│   ├── document-versions.service.ts
│   └── document-versions.module.ts
├── clauses/               # Clause library module
│   ├── dto/
│   ├── entities/
│   ├── clauses.controller.ts
│   ├── clauses.service.ts
│   └── clauses.module.ts
├── pleadings/             # Pleading management module
│   ├── dto/
│   ├── entities/
│   ├── pleadings.controller.ts
│   ├── pleadings.service.ts
│   └── pleadings.module.ts
├── file-storage/          # File storage service
│   ├── interfaces/
│   ├── file-storage.service.ts
│   └── file-storage.module.ts
├── ocr/                   # OCR integration
│   ├── dto/
│   ├── ocr.service.ts
│   └── ocr.module.ts
├── processing-jobs/       # Background job processing
│   ├── dto/
│   ├── entities/
│   ├── processors/
│   ├── processing-jobs.controller.ts
│   ├── processing-jobs.service.ts
│   └── processing-jobs.module.ts
├── app.module.ts          # Main application module
└── main.ts                # Bootstrap file
```

## Prerequisites

- Node.js 18+ 
- PostgreSQL 14+
- Redis 6+

## Installation

1. Install dependencies:
```bash
npm install
```

2. Copy environment file:
```bash
cp .env.example .env
```

3. Update `.env` with your configuration:
```env
PORT=3000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=lexiflow

REDIS_HOST=localhost
REDIS_PORT=6379

JWT_SECRET=your-secret-key
JWT_EXPIRATION=1d

MAX_FILE_SIZE=52428800
UPLOAD_DIR=./uploads

OCR_ENABLED=true
OCR_LANGUAGES=eng
```

4. Create PostgreSQL database:
```sql
CREATE DATABASE lexiflow;
```

5. Start development server:
```bash
npm run start:dev
```

## API Endpoints

### Documents
- `GET /api/v1/documents` - List documents with filtering
- `GET /api/v1/documents/:id` - Get document metadata
- `GET /api/v1/documents/:id/download` - Download document file
- `POST /api/v1/documents` - Upload document
- `PUT /api/v1/documents/:id` - Update document metadata
- `DELETE /api/v1/documents/:id` - Delete document
- `POST /api/v1/documents/:id/ocr` - Trigger OCR processing
- `POST /api/v1/documents/:id/redact` - Create redaction job

### Document Versions
- `GET /api/v1/documents/:documentId/versions` - Get version history
- `GET /api/v1/documents/:documentId/versions/:version` - Get specific version
- `GET /api/v1/documents/:documentId/versions/:version/download` - Download version
- `POST /api/v1/documents/:documentId/versions` - Create new version
- `POST /api/v1/documents/:documentId/versions/:version/restore` - Restore version

### Clauses
- `GET /api/v1/clauses` - List clauses
- `GET /api/v1/clauses/:id` - Get clause
- `POST /api/v1/clauses` - Create clause
- `PUT /api/v1/clauses/:id` - Update clause
- `DELETE /api/v1/clauses/:id` - Delete clause
- `GET /api/v1/clauses/most-used` - Get most used clauses

### Pleadings
- `GET /api/v1/pleadings` - List pleadings
- `GET /api/v1/pleadings/:id` - Get pleading
- `POST /api/v1/pleadings` - Create pleading
- `PUT /api/v1/pleadings/:id` - Update pleading
- `POST /api/v1/pleadings/:id/file` - File pleading
- `GET /api/v1/pleadings/upcoming-hearings` - Get upcoming hearings

### Processing Jobs
- `GET /api/v1/processing-jobs` - List processing jobs
- `GET /api/v1/processing-jobs/:id` - Get job status
- `POST /api/v1/processing-jobs/:id/cancel` - Cancel job
- `GET /api/v1/processing-jobs/statistics` - Get job statistics

## API Documentation

Once the server is running, visit:
- Swagger UI: `http://localhost:5000/api/docs`

## File Storage

Files are stored locally in the following structure:
```
uploads/
└── {caseId}/
    └── {documentId}/
        └── {version}/
            └── filename.ext
```

## Document Types

- Motion
- Brief
- Complaint
- Answer
- Discovery Request
- Discovery Response
- Exhibit
- Contract
- Letter
- Memo
- Pleading
- Order
- Transcript

## Development

```bash
# Development mode with hot reload
npm run start:dev

# Build for production
npm run build

# Run production build
npm run start:prod

# Run tests
npm run test

# Format code
npm run format

# Lint code
npm run lint
```

## Architecture

### File Upload Flow
1. Client uploads file via multipart/form-data
2. Multer processes the upload
3. FileStorageService stores file with checksum
4. Document entity is created with metadata
5. File path is stored in database

### OCR Processing Flow
1. Client triggers OCR via POST /documents/:id/ocr
2. ProcessingJobsService creates a job record
3. Job is added to Bull queue
4. DocumentProcessor picks up the job
5. OcrService processes the document
6. Results are stored in document entity
7. Job status is updated to completed

### Version Control Flow
1. Client uploads new version
2. FileStorageService stores file in versioned path
3. DocumentVersion entity is created
4. Document's currentVersion is incremented
5. Full version history is maintained

## License

ISC
