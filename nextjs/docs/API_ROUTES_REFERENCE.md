# API Routes Quick Reference

## Authentication Routes (`/api/auth`)

| Method | Endpoint                      | Description       | Auth Required |
| ------ | ----------------------------- | ----------------- | ------------- |
| GET    | `/auth`                       | Health check      | No            |
| POST   | `/auth/register`              | Register new user | No            |
| POST   | `/auth/login`                 | Login             | No            |
| POST   | `/auth/logout`                | Logout            | Yes           |
| POST   | `/auth/refresh`               | Refresh token     | No            |
| GET    | `/auth/profile`               | Get current user  | Yes           |
| PUT    | `/auth/profile`               | Update profile    | Yes           |
| POST   | `/auth/change-password`       | Change password   | Yes           |
| POST   | `/auth/forgot-password`       | Request reset     | No            |
| POST   | `/auth/reset-password`        | Reset password    | No            |
| POST   | `/auth/verify-mfa`            | Verify MFA code   | No            |
| POST   | `/auth/enable-mfa`            | Enable MFA        | Yes           |
| POST   | `/auth/disable-mfa`           | Disable MFA       | Yes           |
| GET    | `/auth/sessions`              | List sessions     | Yes           |
| DELETE | `/auth/sessions`              | Revoke all others | Yes           |
| DELETE | `/auth/sessions/:id`          | Revoke session    | Yes           |
| GET    | `/auth/sessions/stats`        | Session stats     | Yes           |
| POST   | `/auth/sessions/trust-device` | Trust device      | Yes           |

## Users Routes (`/api/users`)

| Method | Endpoint     | Description | Auth Required | Permission  |
| ------ | ------------ | ----------- | ------------- | ----------- |
| GET    | `/users`     | List users  | Yes           | USER_MANAGE |
| POST   | `/users`     | Create user | Yes           | USER_MANAGE |
| GET    | `/users/:id` | Get user    | Yes           | USER_MANAGE |
| PUT    | `/users/:id` | Update user | Yes           | USER_MANAGE |
| DELETE | `/users/:id` | Delete user | Yes           | USER_MANAGE |

## Parties Routes (`/api/parties`)

| Method | Endpoint                | Description      | Auth Required |
| ------ | ----------------------- | ---------------- | ------------- |
| GET    | `/parties`              | List all parties | Yes           |
| POST   | `/parties`              | Create party     | Yes           |
| GET    | `/parties/case/:caseId` | Get by case      | Yes           |
| GET    | `/parties/:id`          | Get party        | Yes           |
| PUT    | `/parties/:id`          | Update party     | Yes           |
| DELETE | `/parties/:id`          | Delete party     | Yes           |

## Case Teams Routes (`/api/cases/:caseId/team`, `/api/case-teams`)

| Method | Endpoint              | Description   | Auth Required |
| ------ | --------------------- | ------------- | ------------- |
| GET    | `/cases/:caseId/team` | Get team      | Yes           |
| POST   | `/cases/:caseId/team` | Add member    | Yes           |
| PUT    | `/case-teams/:id`     | Update member | Yes           |
| DELETE | `/case-teams/:id`     | Remove member | Yes           |

## Case Phases Routes (`/api/case-phases`, `/api/cases/:caseId/phases`)

| Method | Endpoint                | Description  | Auth Required |
| ------ | ----------------------- | ------------ | ------------- |
| GET    | `/case-phases/health`   | Health check | No            |
| GET    | `/cases/:caseId/phases` | Get by case  | Yes           |
| POST   | `/cases/:caseId/phases` | Create phase | Yes           |
| GET    | `/case-phases/:id`      | Get phase    | Yes           |
| PUT    | `/case-phases/:id`      | Update phase | Yes           |
| DELETE | `/case-phases/:id`      | Delete phase | Yes           |

## Motions Routes (`/api/motions`)

| Method | Endpoint                | Description   | Auth Required |
| ------ | ----------------------- | ------------- | ------------- |
| GET    | `/motions`              | List all      | Yes           |
| POST   | `/motions`              | Create motion | Yes           |
| GET    | `/motions/case/:caseId` | Get by case   | Yes           |
| GET    | `/motions/:id`          | Get motion    | Yes           |
| PUT    | `/motions/:id`          | Update motion | Yes           |
| DELETE | `/motions/:id`          | Delete motion | Yes           |

## Matters Routes (`/api/matters`)

| Method | Endpoint              | Description       | Auth Required |
| ------ | --------------------- | ----------------- | ------------- |
| GET    | `/matters`            | List with filters | Yes           |
| POST   | `/matters`            | Create matter     | Yes           |
| GET    | `/matters/statistics` | Get stats         | Yes           |
| GET    | `/matters/kpis`       | Get KPIs          | Yes           |
| GET    | `/matters/pipeline`   | Get pipeline      | Yes           |
| GET    | `/matters/:id`        | Get matter        | Yes           |
| PATCH  | `/matters/:id`        | Update matter     | Yes           |
| DELETE | `/matters/:id`        | Delete matter     | Yes           |

## Documents Routes (`/api/documents`)

| Method | Endpoint                  | Description       | Auth Required |
| ------ | ------------------------- | ----------------- | ------------- |
| GET    | `/documents`              | List with filters | Yes           |
| POST   | `/documents`              | Upload document   | Yes           |
| GET    | `/documents/:id`          | Get metadata      | Yes           |
| PUT    | `/documents/:id`          | Update metadata   | Yes           |
| DELETE | `/documents/:id`          | Delete document   | Yes           |
| GET    | `/documents/:id/download` | Download file     | Yes           |
| POST   | `/documents/:id/ocr`      | Trigger OCR       | Yes           |
| POST   | `/documents/:id/redact`   | Redact document   | Yes           |

## Document Versions Routes (`/api/documents/:documentId/versions`)

| Method | Endpoint                                            | Description             | Auth Required |
| ------ | --------------------------------------------------- | ----------------------- | ------------- |
| GET    | `/documents/:documentId/versions`                   | List versions           | Yes           |
| POST   | `/documents/:documentId/versions`                   | Create version          | Yes           |
| GET    | `/documents/:documentId/versions/:version`          | Get version             | Yes           |
| GET    | `/documents/:documentId/versions/:version/download` | Download                | Yes           |
| POST   | `/documents/:documentId/versions/:version/restore`  | Restore                 | Yes           |
| GET    | `/documents/:documentId/versions/compare`           | Compare (v1, v2 params) | Yes           |

## OCR Routes (`/api/ocr`)

| Method | Endpoint                     | Description     | Auth Required |
| ------ | ---------------------------- | --------------- | ------------- |
| GET    | `/ocr/health`                | Health check    | No            |
| GET    | `/ocr/languages`             | List languages  | Yes           |
| GET    | `/ocr/languages/:lang/check` | Check support   | Yes           |
| GET    | `/ocr/progress/:jobId`       | Job progress    | Yes           |
| POST   | `/ocr/detect-language`       | Detect language | Yes           |
| POST   | `/ocr/extract/:documentId`   | Extract data    | Yes           |
| POST   | `/ocr/batch`                 | Batch process   | Yes           |
| GET    | `/ocr/stats`                 | OCR statistics  | Yes           |

## Common Request Headers

```
Authorization: Bearer <jwt_token>
Content-Type: application/json
Content-Type: multipart/form-data  // for file uploads
```

## Common Response Codes

- `200` - Success (GET, PUT)
- `201` - Created (POST)
- `204` - No Content (DELETE)
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

## Query Parameters

### Matters

- `page`, `pageSize` - Pagination
- `status` - Filter by status
- `matterType` - Filter by type
- `priority` - Filter by priority
- `clientId` - Filter by client
- `leadAttorneyId` - Filter by attorney
- `search` - Text search

### Documents

- `caseId` - Filter by case
- `type` - Filter by type
- `status` - Filter by status
- `tags` - Filter by tags

### Version Compare

- `v1` - First version number
- `v2` - Second version number

## File Upload Example

```typescript
const formData = new FormData();
formData.append("file", file);
formData.append("title", "Document Title");
formData.append("type", "contract");
formData.append("caseId", "case-123");

fetch("/api/documents", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${token}`,
  },
  body: formData,
});
```

## Authentication Flow

1. **Register**: `POST /api/auth/register`
2. **Login**: `POST /api/auth/login` → Returns `accessToken` + `refreshToken`
3. **Use Token**: Add `Authorization: Bearer <accessToken>` to requests
4. **Refresh**: `POST /api/auth/refresh` when token expires
5. **Logout**: `POST /api/auth/logout`

## MFA Flow

1. **Enable**: `POST /api/auth/enable-mfa` → Returns QR code
2. **Scan QR**: User scans with authenticator app
3. **Login**: `POST /api/auth/login` → Returns temp token if MFA enabled
4. **Verify**: `POST /api/auth/verify-mfa` → Returns final tokens

## Session Management

1. **List**: `GET /api/auth/sessions` → All active sessions
2. **Stats**: `GET /api/auth/sessions/stats` → Session statistics
3. **Revoke One**: `DELETE /api/auth/sessions/:id`
4. **Revoke Others**: `DELETE /api/auth/sessions`
5. **Trust Device**: `POST /api/auth/sessions/trust-device`
