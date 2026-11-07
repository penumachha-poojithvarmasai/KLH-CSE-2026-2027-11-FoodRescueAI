# Security Architecture & Threat Mitigations

## 1. Authentication & Session Management
- **Stateless JWT**: Tokens signed using HMAC SHA-256 (`Keys.hmacShaKeyFor`). The API Gateway and services validate claims without database sessions.
- **BCrypt Hashing**: Passwords salted and hashed with BCrypt (10 rounds). Plaintext credentials never hit persistent disk.

## 2. Role-Based Access Control (RBAC)
- **CUSTOMER**: Can view personal shipments, search public tracking codes, and file disputes for own shipments.
- **COURIER**: Permitted to update assigned package status to `DELIVERED` and upload cryptographic delivery proof.
- **ADMIN**: Permitted to review arbitrations, inspect system-wide audit records, and resolve/reject disputes.
- Unauthorized calls trigger `403 Forbidden` handled by Spring Security `OncePerRequestFilter`.

## 3. Cryptographic Tamper-Proof Evidence
- When couriers upload a delivery photo, the Evidence Service computes a `SHA-256` checksum over the raw byte stream.
- The hash is permanently stored alongside the filename and metadata, ensuring any subsequent image substitution is immediately detectable.

## 4. Threat Matrix & Defense
| Threat | Mitigation Strategy |
| :--- | :--- |
| **SQL Injection** | Spring Data JPA parameterized queries and ORM entity mapping |
| **Token Theft / Leakage** | 24-hour expiration, Bearer scheme, and sensitive header stripping |
| **Tampered Photos** | SHA-256 evidence hashing computed immediately upon upload |
| **Broken Access Control** | `@EnableMethodSecurity` and explicit role checks on mutation endpoints |
| **CORS Exploits** | Gateway configured to restrict incoming origins to `http://localhost:5173` |

