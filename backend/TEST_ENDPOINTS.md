# Authentication Module - Endpoint Testing Guide

## Base URL
```
http://localhost:3000/api/v1
```

## Test Sequence

### 1. Register a New User
```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@lexiflow.com",
    "password": "SecurePass123!",
    "firstName": "Test",
    "lastName": "User",
    "role": "ASSOCIATE"
  }'
```

**Expected Response:**
```json
{
  "user": {
    "id": "uuid",
    "email": "test@lexiflow.com",
    "firstName": "Test",
    "lastName": "User",
    "role": "ASSOCIATE",
    "permissions": [...],
    "isActive": true,
    "mfaEnabled": false
  },
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc..."
}
```

### 2. Login with Default Admin
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@lexiflow.com",
    "password": "Admin123!"
  }'
```

**Expected Response:**
```json
{
  "user": {
    "id": "uuid",
    "email": "admin@lexiflow.com",
    "firstName": "Super",
    "lastName": "Admin",
    "role": "SUPER_ADMIN",
    "permissions": [...all permissions...],
    "isActive": true,
    "mfaEnabled": false
  },
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc..."
}
```

### 3. Get User Profile
```bash
# Replace YOUR_ACCESS_TOKEN with the token from login response
curl -X GET http://localhost:3000/api/v1/auth/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Expected Response:**
```json
{
  "id": "uuid",
  "email": "admin@lexiflow.com",
  "firstName": "Super",
  "lastName": "Admin",
  "role": "SUPER_ADMIN",
  "permissions": [...],
  "isActive": true,
  "mfaEnabled": false
}
```

### 4. Update Profile
```bash
curl -X PUT http://localhost:3000/api/v1/auth/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Updated",
    "lastName": "Name"
  }'
```

### 5. Refresh Access Token
```bash
curl -X POST http://localhost:3000/api/v1/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "YOUR_REFRESH_TOKEN"
  }'
```

**Expected Response:**
```json
{
  "accessToken": "new_access_token",
  "refreshToken": "new_refresh_token"
}
```

### 6. Change Password
```bash
curl -X POST http://localhost:3000/api/v1/auth/change-password \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "currentPassword": "Admin123!",
    "newPassword": "NewSecure123!"
  }'
```

### 7. Forgot Password
```bash
curl -X POST http://localhost:3000/api/v1/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@lexiflow.com"
  }'
```

**Expected Response:**
```json
{
  "message": "If an account with that email exists, a reset link has been sent",
  "resetToken": "eyJhbGc..." // Only in development
}
```

### 8. Reset Password
```bash
curl -X POST http://localhost:3000/api/v1/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "token": "RESET_TOKEN_FROM_FORGOT_PASSWORD",
    "newPassword": "AnotherSecure123!"
  }'
```

### 9. Logout
```bash
curl -X POST http://localhost:3000/api/v1/auth/logout \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## User Management Endpoints (Require USER_MANAGE Permission)

### 10. List All Users
```bash
curl -X GET http://localhost:3000/api/v1/users \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 11. Get User by ID
```bash
curl -X GET http://localhost:3000/api/v1/users/USER_ID \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 12. Create User
```bash
curl -X POST http://localhost:3000/api/v1/users \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@lexiflow.com",
    "password": "SecurePass123!",
    "firstName": "New",
    "lastName": "User",
    "role": "PARALEGAL",
    "isActive": true,
    "mfaEnabled": false
  }'
```

### 13. Update User
```bash
curl -X PUT http://localhost:3000/api/v1/users/USER_ID \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Updated",
    "role": "ASSOCIATE"
  }'
```

### 14. Delete User
```bash
curl -X DELETE http://localhost:3000/api/v1/users/USER_ID \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## MFA Testing

### 15. Verify MFA (When MFA is enabled)
```bash
curl -X POST http://localhost:3000/api/v1/auth/verify-mfa \
  -H "Content-Type: application/json" \
  -d '{
    "token": "MFA_TOKEN_FROM_LOGIN",
    "code": "123456"
  }'
```

## Error Scenarios

### Unauthorized Access (No Token)
```bash
curl -X GET http://localhost:3000/api/v1/auth/profile
```
**Expected:** 401 Unauthorized

### Invalid Credentials
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@lexiflow.com",
    "password": "WrongPassword"
  }'
```
**Expected:** 401 Unauthorized

### Insufficient Permissions
```bash
# Login as CLIENT_USER and try to access user management
curl -X GET http://localhost:3000/api/v1/users \
  -H "Authorization: Bearer CLIENT_USER_TOKEN"
```
**Expected:** 403 Forbidden

## Notes

- All timestamps are in ISO 8601 format
- Tokens expire based on configuration (default: 15m for access, 7d for refresh)
- Password must be at least 8 characters
- Email must be valid format
- All protected endpoints require valid JWT token in Authorization header
