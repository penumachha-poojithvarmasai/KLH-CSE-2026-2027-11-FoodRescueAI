# Troubleshooting & Common Issues Guide

## 1. Port Conflict (`BindException: Address already in use`)
- **Cause**: A previous service process is still occupying the port.
- **Fix (Windows PowerShell)**:
  ```powershell
  Get-Process -Id (Get-NetTCPConnection -LocalPort 8080).OwningProcess | Stop-Process -Force
  ```

## 2. MySQL Database Connection Refused
- **Cause**: MySQL daemon is not running or credentials differ.
- **Fix**: Verify MySQL service is active or start via Docker:
  ```powershell
  docker compose up -d mysql
  ```
  Ensure database schemas are created using `database/migrations/01-init-schemas.sql`.

## 3. Services Not Discovered in Eureka
- **Cause**: Client service started before Eureka Server finished initializing.
- **Fix**: Always launch `discovery-server` (Port 8761) first. Wait 10 seconds before starting gateway and business services.

## 4. Frontend CORS Error in Browser Console
- **Cause**: Request sent directly to an individual service port instead of the API Gateway.
- **Fix**: Ensure all frontend API calls route through the Gateway on `http://localhost:8080`.

## 5. 401 Unauthorized Error
- **Cause**: JWT token missing or expired.
- **Fix**: Log out and log back in using one of the demo buttons (`customer@demo.com`, `courier@demo.com`, or `admin@demo.com`).

