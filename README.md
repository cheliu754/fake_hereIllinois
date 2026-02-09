# Attendance API

## Prerequisites

- Node.js >= 24.0.0
- Yarn 1.22.x
- MongoDB (local or remote)

## Getting Started

### Install Dependencies

```bash
# From the project root
yarn install
```

### Start Development Servers

```bash
# Start both frontend and backend together (from project root)
yarn dev

# Or start them separately:

# Start API server only (default: http://localhost:3000)
yarn api dev

# Start frontend only (default: http://localhost:5173)
yarn frontend dev
```

### Build for Production

```bash
# Build all workspaces
yarn build

# Start API in production mode
yarn api start
```

## Running Tests

```bash
# Run all tests
yarn test

# Frontend tests
yarn frontend test
yarn frontend test:watch

# Backend tests
yarn api test
```

## API Endpoints

### POST /attendance
Create a new attendance record.

**Request body:** `{ uin, sessionId, takenBy, date? }`

| Status | Description |
|--------|-------------|
| 201 | Created successfully |
| 400 | Missing required fields (uin, sessionId, takenBy) |
| 409 | "This student's attendance has already been taken for this session" |

### PUT /attendance/:id
Full replacement of an existing attendance record. `operationUser` becomes the new `takenBy`. `date` is preserved.

**Request body:** `{ uin, sessionId, operationUser }`

| Status | Description |
|--------|-------------|
| 200 | Updated successfully |
| 400 | Missing required fields (uin, sessionId, operationUser) |
| 404 | Attendance record not found |
| 409 | "This student's attendance has already been taken for this session" (duplicate uin+sessionId) |

### GET /attendance
Returns all attendance records.

### GET /attendance/:id
Returns a single attendance record by ID.

### GET /logs
Returns all audit logs sorted by operationTime descending.

### GET /logs/uin/:uin
Returns logs for a specific UIN.

### GET /logs/session/:sessionId
Returns logs for a specific session.

## Test Coverage Summary

### Unit Tests (Service Layer)

| Service | Test Cases |
|---------|------------|
| **AttendanceService** | create, update (full replacement), findById, findByUinAndSession, findAll |
| **LogService** | createLog, getAllLogs, getLogsByUin, getLogsBySessionId |

### Integration/API Tests

| API | Edge Cases Covered |
|-----|-------------------|
| **POST /attendance** | ✅ Success, ✅ Missing uin (400), ✅ Missing sessionId (400), ✅ Missing takenBy (400), ✅ Duplicate (409), ✅ Optional date |
| **PUT /attendance/:id** | ✅ Full replacement, ✅ Missing required fields (400), ✅ Not found (404), ✅ Replace all fields + preserve date, ✅ operationUser becomes takenBy, ✅ Duplicate uin+sessionId (409) |
| **GET /attendance** | ✅ Returns all, ✅ Empty array |
| **GET /attendance/:id** | ✅ Found, ✅ Not found (404) |
| **GET /logs** | ✅ Returns all, ✅ Sorted descending, ✅ Empty array |
| **GET /logs/uin/:uin** | ✅ Found, ✅ Not found |
| **GET /logs/session/:sessionId** | ✅ Found, ✅ Not found |

### Functional Tests

| Scenario | Description |
|----------|-------------|
| **Instructor Editing Scenario** | Jack adds Adam's attendance → Edits Bob's record (PUT full replacement) → Views logs |
| **Rejection Scenario** | Missing required fields causes 400 errors |
| **Logging Accountability** | Complete audit trail with multiple EDIT operations |
| **Snapshot Verification** | Before/after states correctly recorded |
