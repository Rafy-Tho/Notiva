# Email Verification and Password Reset Implementation Plan

## Overview
Refactor authentication to add email verification and password reset using 6-digit codes stored in email_verification_tokens and password_reset_tokens tables.

---

## Phase 1: Database Schema

### 1.1 Add User Email Verified Field
Add to User model: `emailVerifiedAt DateTime?`

### 1.2 Add Token Tables
Add EmailVerificationToken and PasswordResetToken models with fields: id, userId, tokenHash, expiresAt, usedAt, createdAt. Indexes on (userId, expiresAt).

### 1.3 Migration
`npx prisma migrate dev --name add_email_verification`

---

## Phase 2: Backend Token Repositories

### 2.1 Create email_verification.repository.js
Functions: createToken, findByTokenHash, markAsUsed, deleteToken, markEmailVerified

### 2.2 Create password_reset.repository.js  
Functions: createToken, findByTokenHash, markAsUsed, deleteToken, deleteByUserId

---

## Phase 3: Backend Service Layer

### 3.1 Update auth.service.js
Add:
- generateVerificationCode() - 6-digit code
- hashCode() - SHA-256 hash
- sendVerificationCode(email) - create token, return code
- verifyCode(email, code) - verify, mark email verified, create session, return authenticated response
- sendPasswordResetCode(email) - rate limited, create token
- resetPasswordWithCode(email, code, newPassword) - verify, update password, invalidate token

### 3.2 Update email.service.js
Add: sendVerificationEmail(to, code), sendPasswordResetEmail(to, code)

---

## Phase 4: Backend Controller

### 4.1 auth.controller.js
Add:
- resendVerification() - call service, send email
- verifyEmail() - verify code, set auth cookie, return user/session
- resetPassword() - send reset code
- confirmPasswordReset() - reset password

### 4.2 auth.validation.js
Add validation: resendVerificationV, verifyEmailV, resetPasswordV, confirmPasswordResetV

### 4.3 auth.routes.js
Add routes: /resend-verification, /verify-email, /reset-password, /confirm-password-reset

---

## Phase 5: Frontend Integration

### 5.1 authStore.js
Add methods: sendVerificationCode, resendVerificationCode, resetPassword, confirmPasswordReset

### 5.2 UI Components
Create: VerificationScreen, RegistrationVerification, ResetPasswordScreen

---

## Phase 6: Security

- 15-minute token expiration
- Single-use tokens (usedAt)
- Rate limiting on code requests
- Unverified users blocked from protected routes
- Auto-login after verification

---

## Phase 7: Testing

### 7.1 Backend
auth.service.test.js covering:
- Email verification flow
- Password reset flow  
- Rate limiting
- Token expiration

### 7.2 Integration
- Full registration ? verify ? login
- Password reset flow

---

## Phase 8: Files Summary

### Create
- backend/src/modules/auth/email_verification.repository.js
- backend/src/modules/auth/password_reset.repository.js

### Modify
- backend/prisma/schema.prisma
- backend/src/modules/auth/auth.service.js
- backend/src/modules/auth/auth.controller.js
- backend/src/modules/auth/auth.validation.js
- backend/src/modules/auth/auth.routes.js
- backend/src/modules/email/email.service.js
- backend/src/common/utils/rateLimit.js
- frontend/store/authStore.js

---

## Implementation Order

1. Database schema & migration
2. Backend repositories
3. Backend services
4. Backend controllers/routes
5. Frontend integration
6. Testing
7. Documentation
