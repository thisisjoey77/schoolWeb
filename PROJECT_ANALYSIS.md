## School Web Forum Project – Comprehensive Technical Analysis (2025-09-06)

### Executive Summary
The project consists of:
1. A Next.js 15 (App Router) frontend deployed on Vercel.
2. A monolithic FastAPI backend (single 1,000+ line file) deployed on AWS Lightsail, using a MySQL-compatible database via a custom `get_connection()` utility.

Current functionality covers student/teacher login, signup, posting, replies, class management, and teacher moderation (block/validate posts). The MVP works but has critical security, design, correctness, and maintainability concerns that will block reliable scaling unless addressed.

Severity summary:
- Critical (needs immediate action): Plaintext passwords, flawed FastAPI request body parsing, inconsistent HTTP methods, no authentication tokens/sessions, over‑broad CORS, teacher privilege inference via repeated DB queries, potential data leakage of anonymous posters to teachers without audit, unbounded query patterns.
- High: Monolithic backend file, repeated SQL logic, N+1 queries (posts → replies), missing input normalization, inconsistent naming (`user_id` vs `username`), GET with body misuse, missing rate limiting, lack of error codes (all 200-style JSON), weak validation regexes, lack of migrations/schema mgmt.
- Medium: Mixed JS + TS without strict typing for API helpers, UI state hydration flicker, fragile localStorage auth, no SSR guards, duplicate category arrays in multiple files, no caching.
- Low: Missing lint/test automation, no CI, no logging strategy, no accessibility review, no dark mode / theming abstraction.

---
## 1. Architecture Overview
Frontend (Vercel):
- Next.js 15 App Router, client-heavy pages (`"use client"` everywhere) – little server component leverage.
- API access goes only through a custom proxy at `/api/proxy?endpoint=...` which serializes REST calls to the backend.
- Uses localStorage for auth state (`isLoggedIn`, `currentUser`). No cookies / tokens; no server trust boundary.

Backend (Lightsail):
- Single FastAPI app in `SchoolWebServer_Sep6.py` implementing all routes.
- No models (Pydantic) – Body params incorrectly defined using `username=Body("user_id")` (this sets default literal values rather than parsing JSON keys). It “works” only if the framework tolerates it, but it's semantically wrong and fragile.
- Direct SQL with `cursor.execute` each time; some protection via parameterization, but no abstraction layer.
- Repeated open/close of connections per request; unknown pooling (depends on `pool.get_connection`).
- No structured logging or observability.

Data Flow:
Browser → Next.js page → fetch to `/api/proxy` → fetch to FastAPI backend → DB.

Pain Points:
- Double hop increases latency (Vercel edge → Lightsail) without added auth or caching logic.
- No separation into domains (auth, posts, classes, moderation).
- Repeated teacher detection queries per request.

---
## 2. Frontend Code Quality
Observations:
- API functions in `/app/api/*.js` are JS (not TS) inside a TypeScript project; loses type safety despite strict TS config.
- `loginCheckTeacher` uses `method: 'GET'` with a body (invalid per HTTP spec) while backend expects POST → latent bug.
- Duplicate category arrays in multiple pages (`page.tsx`, `new-post/page.tsx`). Risk of divergence.
- Client components everywhere; opportunities for server components (initial post lists) are unused → slower TTFB and SEO limitations.
- Anonymous logic duplicated (`getAuthorDisplay`) in multiple files.
- Local fallback `centralData.ts` is an empty array but referenced in fallback logic; may hide API failures silently.
- Lack of loading/error boundary standardization; ad-hoc alert() usage.
- Security: Direct reliance on localStorage values for teacher privileges (can be tampered with in DevTools).

Recommendations (frontend):
1. Convert `/app/api/*.js` to `.ts` and export typed interfaces (Post, Reply, etc). Reuse existing `types.ts`.
2. Replace proxy pattern with direct server actions or Route Handlers that add auth validation (if token-based).
3. Extract shared constants (categories, helpers) into `app/lib`.
4. Add a lightweight global state (Zustand or React Context) for user + role; validate role via backend each session refresh.
5. Introduce optimistic UI for post/reply submission; show skeleton loaders.
6. Use environment variable (`NEXT_PUBLIC_API_BASE_URL`) instead of hardcoded IP in proxy.
7. Implement proper redirect logic server-side (middleware) instead of client-only `useEffect` checks.

---
## 3. Backend Code Quality
Issues:
- Single file >1000 lines; violates separation of concerns.
- No Pydantic schemas → no automatic validation or OpenAPI clarity.
- Body parsing misuse (Body("field")) – should be `Body(..., embed=False)` or Pydantic model attributes read from JSON keys.
- Plaintext password storage and transmission. Must move to hashed (bcrypt/argon2) + salted.
- Authorization decisions rely on presence of `teacher_data` row; no signed credential.
- Anonymous posts: teachers see identity, but logging/audit is absent.
- Repeated code blocks for: opening/closing connections, teacher check, reply assembly.
- N+1 query pattern: For each post → open a new cursor and query replies.
- Some endpoints POST where GET would suffice (`/my-post-list` could be GET with query param) – consistency lacking.
- No pagination anywhere – potential scaling issue when posts grow.
- No rate limiting; open to abuse / denial-of-service.
- CORS `*` with `allow_credentials=True` (insecure combination; browsers will ignore credentials but intent is unclear).

Recommendations (backend):
1. Modularize into packages: `routers/`, `schemas/`, `services/`, `db/`, `security/`.
2. Introduce SQLAlchemy ORM or at least a repository layer; add Alembic migrations.
3. Implement password hashing (bcrypt) + JWT issuance (access + refresh) + role claim (student/teacher).
4. Introduce unified response model pattern (success/error) with HTTP status codes.
5. Add pagination params (`limit`, `offset`) to list endpoints.
6. Add prefetch with `JOIN` for replies OR single grouped query to remove N+1.
7. Centralize teacher check & role extraction (dependency function in FastAPI `Depends`).
8. Add structured logging (loguru / stdlib logging) and correlation IDs.
9. Add rate limiting (e.g., slowapi) and request size limits.
10. Replace raw regex validation with Pydantic field validators and more precise constraints.

---
## 4. API Contract Mismatches
| Concern | Frontend | Backend | Impact |
|---------|----------|---------|--------|
| Teacher login method | `loginCheckTeacher` uses GET with body | Endpoint expects POST | Failing / undefined behavior in production |
| Student login body keys | `{ username, password }` in login page | Backend expects `user_id`, `password` (mis-declared) | Student login may fail depending on Body parsing |
| Anonymous flag type | Sent as number 0/1 | Treated as truthy/falsy | OK but implicit casting risk |
| No tokens issued | localStorage only | Backend stateless | Users can forge teacher role in UI |
| `/my-post-list` | POST | Could be GET | REST inconsistency |

Fix approach:
1. Define OpenAPI spec (manually or via FastAPI Pydantic) → generate a TypeScript client.
2. Add contract tests (backend) + integration tests (frontend using Playwright).

---
## 5. Security Assessment
Category | Issue | Severity | Action
---------|-------|----------|-------
Auth | Plaintext password storage | Critical | Hash & salt (bcrypt) immediately
Auth | No token/session mechanism | Critical | Add JWT or cookie session
Input | Missing Pydantic schema validation | High | Define models
Transport | Hardcoded IP (HTTP) | High | Use HTTPS + env var; restrict origin
CORS | `*` origins with credentials allowed | High | Restrict to Vercel domain(s)
AuthZ | Role inference each request w/out signing | High | Include role claim in token
Data Privacy | Teachers see anonymous author IDs without audit trail | Medium | Add audit logs & purpose limitation
Enumeration | `/search-students` can enumerate names & IDs | Medium | Add auth + rate limit
Abuse | No rate limiting / captcha for signup/login | Medium | Implement limiter
Info Leak | Error messages echo raw exception strings | Medium | Return generic user messages, log details server-side
Session | Client-only localStorage trust | Medium | Server must enforce all restrictions

---
## 6. Performance & Scalability
Aspect | Current | Risk | Recommendation
-------|---------|------|--------------
DB Queries | N+1 for replies | Latency growth O(P+R) | Use aggregated query or JOIN
Pagination | None | Large responses | Add limit/offset + cursors
Caching | None | Repeated identical fetches | Add CDN/edge cache for public, Redis for hot queries
Connection Mgmt | Each endpoint opens/closes | Overhead | Use pooled connections / async driver (aiomysql)
Proxy Layer | Always hits proxy | Double latency | Allow direct server fetch from server components
Bundle Size | All in client components | Slower hydration | Use server components for initial lists

---
## 7. Data Modeling Observations
- `student_data` and `personal_info` both store password fields (duplication risk).
- `post.validated` used for moderation; replies also have `validated` in TypeScript model but backend never sets/uses it.
- `classes.students` stores comma-separated IDs (violates normalization). Should be a join table `class_students(class_id, school_id)`.
- Missing auditing tables (moderation actions, login attempts).
- Suggest adding `created_at`, `updated_at` metadata columns uniformly.

---
## 8. Developer Experience & Tooling
Missing:
- ESLint + Prettier config (Next default lint exists but not visible in repo root customization).
- No test harness (Jest/Testing Library for components, Pytest for backend).
- No CI (GitHub Actions) for lint/build/test.
- No environment variable examples (`.env.example`).
- No migration management (Alembic) or schema docs.

---
## 9. Observability & Ops
Absent: metrics, tracing, structured logs, health endpoints (`/healthz`).
Add: Prometheus exporter or FastAPI middleware for timing; log request IDs; integrate with OpenTelemetry.

---
## 10. Accessibility & UX (High-Level)
- Color contrast appears acceptable but not audited.
- No ARIA labels for interactive icon-only toggle.
- Modals lack focus trapping and ESC close handling.
- Alerts use `alert()` (blocking, poor UX); replace with toast system.

---
## 11. Risk Matrix (Simplified)
Risk | Likelihood | Impact | Priority
-----|------------|--------|---------
Password compromise | High | Critical | P0
Privilege escalation (forged teacher) | Medium | High | P0
DB performance degradation | Medium | Medium | P1
Data leakage via search | Medium | Medium | P1
Operational outage (uncaught exceptions) | Low | High | P1
Scaling failure (no pagination) | High | Medium | P1

---
## 12. Recommended Refactor Roadmap
Phase 0 (Immediate Hotfixes):
1. Fix teacher login method mismatch (use POST, send correct `user_id`).
2. Lock CORS to prod domains; remove `allow_credentials` if using `*`.
3. Sanitize error responses (never return raw exception string).

Phase 1 (Security Foundations):
1. Introduce password hashing (bcrypt), migrate existing passwords (force reset if needed).
2. Implement JWT auth (access + refresh) with role claims.
3. Replace localStorage-only trust: store access token in memory + httpOnly refresh cookie.
4. Add rate limiting & basic logging.

Phase 2 (API & Domain Layer):
1. Split backend into routers: `auth`, `posts`, `replies`, `classes`, `moderation`, `students`.
2. Add Pydantic schemas for request/response – auto-generate docs.
3. Implement pagination and consolidated post+replies query.
4. Normalize classes → join table.

Phase 3 (Frontend Hardening):
1. Convert API layer to TypeScript, generate client from OpenAPI.
2. Use server components to pre-render post lists (SEO + faster initial load).
3. Centralize categories & helper functions.
4. Introduce React Query / TanStack Query for caching & stale revalidation.

Phase 4 (Observability & Quality):
1. Add CI (lint, type-check, tests) + smoke Playwright test.
2. Add structured logging + metrics.
3. Add audit log for moderation actions.

Phase 5 (Enhancements):
1. Add notifications (websocket or SSE) for new replies/posts.
2. Implement full-text search (Elastic / Meilisearch) instead of client filtering.
3. Introduce tagging + user profiles with avatars.

---
## 13. Sample Improved Login Contract (Illustrative Only)
Backend (Pydantic schema):
```python
class LoginRequest(BaseModel):
    user_id: constr(min_length=3, max_length=50)
    password: SecretStr

@router.post("/auth/login", response_model=LoginResponse)
def login(data: LoginRequest, db=Depends(get_db)):
    user = user_repo.get_by_user_id(db, data.user_id)
    if not user or not verify_pwd(data.password.get_secret_value(), user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_access_token({"sub": user.user_id, "role": user.role})
    return {"access_token": token, "user": UserOut.from_orm(user)}
```

Frontend (typed function):
```ts
export async function login(user_id: string, password: string): Promise<LoginResponse> {
  const res = await fetch('/api/auth/login', { method: 'POST', body: JSON.stringify({ user_id, password }) });
  if (!res.ok) throw new Error('Login failed');
  return res.json();
}
```

---
## 14. Quick Wins You Can Do Today
- Unify category list in one module.
- Fix `loginCheckTeacher` to POST.
- Add pagination to `/post-list` (limit default 20).
- Abstract teacher check into helper to reduce duplication.
- Return HTTP status codes (e.g., 401/403) instead of always `{"status": "error"}` with 200.
- Add `try/except` wrapper decorator for consistent error responses.

---
## 15. Suggested Folder Restructure (Target State)
```
backend/
  app/
    core/ (config, security)
    db/ (session, models)
    schemas/
    routers/
      auth.py
      posts.py
      replies.py
      classes.py
      moderation.py
    services/
    utils/
  tests/
frontend/
  app/
    (Next.js routes)
  lib/
    api/ (generated client)
    constants/
  components/
  types/
```

---
## 16. Deployment & Ops Recommendations
- Use environment variables: `BACKEND_BASE_URL`, `NODE_ENV`, `JWT_SECRET` (never commit).
- Add health check endpoint `/healthz` for Lightsail load balancer.
- Consider containerization (Docker) for reproducible backend deploys; orchestrate with ECS/Fargate or Fly.io for simpler scaling.
- Add automated backup for database; define RPO/RTO.

---
## 17. Monitoring & Alerts
- Metrics: request latency, error rate, DB query time, post/reply volume.
- Alerts: 5xx rate > 2%, auth failures spike, slow query log threshold.

---
## 18. Conclusion
Core functionality is in place, but security and structural debt is high. Prioritize authentication hardening, backend modularization, and contract correctness before adding new features. Adopting a cleaner layered architecture and typed API client will significantly reduce defects and speed future feature work.

---
### Need Help Implementing?
I can begin by (a) fixing the teacher login mismatch, (b) introducing a minimal Pydantic schema for auth, or (c) converting the API utilities to TypeScript—just say which to start with.
