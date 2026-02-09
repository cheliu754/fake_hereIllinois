# Attendance API

## Prerequisites

- Node.js >= 20.0.0
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

## Test Coverage Summary

### Unit Tests (Service Layer)

| Service | Test Cases |
|---------|------------|
| **AttendanceService** | 13 tests covering create, update, findById, findByUinAndSession, findAll |
| **LogService** | 8 tests covering createLog, getAllLogs, getLogsByUin, getLogsBySessionId |

### Integration/API Tests

| API | Edge Cases Covered |
|-----|-------------------|
| **POST /attendance** | ✅ Success, ✅ Missing uin (400), ✅ Missing sessionId (400), ✅ Missing takenBy (400), ✅ Duplicate (409), ✅ Optional date |
| **PATCH /attendance/:id** | ✅ Success, ✅ Missing operationUser (400), ✅ Not found (404), ✅ Multiple fields, ✅ Reject takenBy modification (400) |
| **GET /attendance** | ✅ Returns all, ✅ Empty array |
| **GET /attendance/:id** | ✅ Found, ✅ Not found (404) |
| **GET /logs** | ✅ Returns all, ✅ Sorted descending, ✅ Empty array |
| **GET /logs/uin/:uin** | ✅ Found, ✅ Not found |
| **GET /logs/session/:sessionId** | ✅ Found, ✅ Not found |

### Functional Tests

| Scenario | Description |
|----------|-------------|
| **Instructor Editing Scenario** | Jack adds Adam's attendance → Edits Bob's record → Views logs |
| **Rejection Scenario** | Missing required fields causes 400 errors |
| **Logging Accountability** | Complete audit trail with multiple EDIT operations |
| **Snapshot Verification** | Before/after states correctly recorded |

All requirements are met with **47 passing tests** covering unit tests, API edge cases, and functional scenarios including rejection cases.
