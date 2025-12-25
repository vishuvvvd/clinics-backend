# Clinics Backend (FHIR-first)

This repository provides a production-ready API surface for clinics/doctors built with Node.js, Express, MongoDB, and FHIR-aligned JSON storage.

## Getting started

1. Copy `.env.example` to `.env` and set `MONGO_URI` and `JWT_SECRET`.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run:
   ```bash
   npm run dev
   ```
4. Swagger docs: `GET /api/docs`

## API surface (high level)
- Auth: `/api/auth/*`
- Clinics (Organization): `/api/clinics/*`
- Doctors (Practitioner): `/api/doctors/*`
- Clinic ↔ Doctor mapping (PractitionerRole): `/api/practitioner-roles/*`
- Specialties (CodeSystem): `/api/specialties/*`
- Engagement (likes, views, rating): `/api/engagement/*`
- Comments/Reviews: `/api/comments/*`
- Media uploads (stubs): `/api/media/*`
- Home collections: `/api/home`
- Search: `/api/search`

Engagement, media, descriptions, videos, and ratings are represented using FHIR extensions so the system stays migration-ready for any FHIR server.
