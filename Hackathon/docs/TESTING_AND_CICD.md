# Testing Strategy & CI/CD Documentation

## 1. Test Pyramid
- **Unit Tests (JUnit 5 + Mockito)**: Verify isolated business logic (e.g. `ShipmentServiceTest.java`) ensuring status transitions, filtering, and validation behave deterministically without a database.
- **Integration Tests (@SpringBootTest)**: Ensure Spring context loads cleanly and services coordinate through web layers.
- **Contract Tests**: Validate that REST payloads conform to defined DTO contracts.

## 2. GitHub Actions CI/CD Pipeline
Defined in `.github/workflows/ci.yml`:
- Triggered on every commit/PR to `main`.
- **Backend Job**: Sets up Temurin JDK 21, caches Maven repository, compiles all 9 modules, and runs automated unit tests.
- **Frontend Job**: Sets up Node.js 20, runs `npm ci`, and executes `npm run build` with strict TypeScript compilation.

