# Avatar Upload

## Status

IMPLEMENTED

## Purpose

Upload and manage user profile avatar image.

## Actor

Authenticated users

## Entry Points

- UserSection in Sidebar
- Settings page avatar upload

## Preconditions

- User is authenticated

## Input

- avatar: file (image, typically <5MB)

## Validation

- File type validation (image formats)
- File size limits (typically <5MB)

## Behavior

1. Validate file
2. Upload to Cloudinary
3. Get secure URL
4. Update user.avatar field
5. Return updated user with avatar URL

## Frontend

- SettingsPage component
- Settings avatar upload UI

## API

`POST /api/v1/me/avatar`

## Backend

- me.routes.js
- me.controller.js
- upload.service.js
- User model
- Cloudinary config

## Database

Updates User.avatar field with Cloudinary URL

## Authorization

Authenticated users only

## Errors

- 400: Validation errors (invalid file type/size)
- 401: Not authenticated
- 500: Upload service error

## Side Effects

- Image uploaded to Cloudinary
- User document updated
- Previous avatar (if any) remains in Cloudinary

## Edge Cases

- Avatar image is served from Cloudinary CDN

## Tests

Not found in test suite

## Source Evidence

Frontend:
- frontend/src/pages/SettingsPage.jsx

Backend:
- backend/src/routes/me.routes.js
- backend/src/controllers/me.controller.js
- backend/src/services/upload.service.js
- backend/src/models/User.js
- backend/src/config/cloudinary.config.js

## Unknowns

- Avatar image dimensions
