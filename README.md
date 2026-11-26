# Student Management System

Mobile app (React Native / Expo + Redux Toolkit) ⇄ REST API (Spring Boot 3 + JPA + JWT) ⇄ PostgreSQL/MySQL.
Roles: **STUDENT** (read-only leaderboard + own standing) and **TEACHER** (award / adjust points).

```
student-management-system/
├── backend/            Spring Boot 3.3 (Controller → Service → Repository)
├── mobile/             Expo app (feature-sliced Redux, ThemeContext, AuthProvider)
├── database/schema.sql Reference SQL schema
└── docker-compose.yml  One-command PostgreSQL
```

## 1. Run the backend

Prerequisites: JDK 17+, Maven 3.9+.

**Option A – PostgreSQL (recommended)**
```bash
docker compose up -d                 # starts postgres on :5432 (db: student_db, user/pass: postgres)
cd backend
mvn spring-boot:run
```
**Option B – MySQL**: create a DB, then
`DB_URL=jdbc:mysql://localhost:3306/student_db DB_USER=root DB_PASSWORD=secret mvn spring-boot:run`
**Option C – zero setup (in-memory H2)**: `mvn spring-boot:run -Dspring-boot.run.profiles=h2`

On first start the DB is seeded (set `SEED_DEMO_DATA=false` to disable):

| Role    | Email                                   | Password      |
|---------|-----------------------------------------|---------------|
| TEACHER | teacher@school.com                      | password123   |
| STUDENT | student1@school.com … student8@school.com | password123 |

The API listens on `0.0.0.0:8080`. Make sure your firewall allows port 8080 on the local network.

## 2. Run the mobile app

Prerequisites: Node 18+, Expo Go on your phone (or an emulator).
```bash
cd mobile
npm install
npx expo install --fix     # aligns package versions with your installed Expo SDK
npx expo start
```
Scan the QR code with Expo Go. The phone and the computer must be on the **same Wi-Fi**.
The API URL is auto-detected from the Expo dev host (`http://<your-LAN-IP>:8080/api`; Android emulator → `10.0.2.2`).
If you use `expo start --tunnel` or auto-detection is wrong, create `mobile/.env`:
```
EXPO_PUBLIC_API_URL=http://<your-computer-LAN-IP>:8080/api
```
(Tunnel option for the backend: `ngrok http 8080`, then use `https://<id>.ngrok-free.app/api`.)

## 3. REST API

Base path `/api`. Errors always look like
`{"timestamp","status","error","message","path","fieldErrors"?}`.

| Method | Path                              | Access    | Description                                   | Success |
|--------|-----------------------------------|-----------|-----------------------------------------------|---------|
| POST   | `/auth/register`                  | public    | `{name,email,password,role}` → token + user   | 201     |
| POST   | `/auth/login`                     | public    | `{email,password}` → `{token,user}`           | 200     |
| GET    | `/auth/me`                        | any user  | Current profile (used to validate a session)  | 200     |
| GET    | `/leaderboard?page&size&sortBy&direction` | any user | Paginated ranks. `sortBy`=points\|name, `direction`=asc\|desc, `size`≤100 | 200 |
| GET    | `/leaderboard/me`                 | STUDENT   | Caller's own `{rank, points}`                 | 200     |
| GET    | `/leaderboard/{studentId}`        | any user  | One student's entry                           | 200     |
| POST   | `/leaderboard/{studentId}/points` | TEACHER   | `{points: -1000..1000}` add/deduct → updated entry | 200 |

Status codes: 400 validation / bad params / points below 0 · 401 missing/invalid token or bad credentials ·
403 wrong role · 404 unknown student · 409 duplicate email.

Quick curl test:
```bash
TOKEN=$(curl -s localhost:8080/api/auth/login -H 'Content-Type: application/json' \
  -d '{"email":"teacher@school.com","password":"password123"}' | python3 -c 'import sys,json;print(json.load(sys.stdin)["token"])')
curl -s "localhost:8080/api/leaderboard?page=0&size=5&sortBy=points&direction=desc" -H "Authorization: Bearer $TOKEN"
curl -s -X POST localhost:8080/api/leaderboard/4/points -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' -d '{"points":30}'
```

## 4. Design notes (maps to the evaluation criteria)

**Authentication & RBAC (20%)** – BCrypt-hashed passwords, stateless JWT (HS256, 24h). `SecurityConfig` enforces
roles server-side (`POST …/points` → TEACHER, `/leaderboard/me` → STUDENT) and returns JSON 401/403.
In the app the token+profile is stored in **expo-secure-store** (AsyncStorage on web) and revalidated via `/auth/me`
on every launch (kept if offline, cleared on 401). The navigator only registers `Login/Register` when logged out
and only registers `AwardPoints` for teachers; any API 401 triggers an automatic logout.

**Redux & state (20%)** – `authSlice` (login/register/restore/logout thunks) and `leaderboardSlice`
(pagination metadata, sort, `myStanding`, optimistic award with rollback). `AuthProvider` bootstraps the session;
`ThemeContext` provides light/dark palettes (persisted, follows system by default) with a switch in every header/login screen.

**Rank list & points (20%)** – Rank = position by **points DESC, id ASC** (deterministic ties). Rank is computed in SQL
(`countAhead`), so it is correct on any page and under any sort order. On award the Redux store updates *immediately*
(optimistic, re-sorted and re-ranked locally), is reconciled with the server response, then a background refresh
re-syncs all loaded pages. Students get a read-only list with their own row highlighted and a standing card.

**Backend & SQL (20%)** – `users` (unique email) 1—1 `student_profiles` (FK, unique user_id, `points` default 0, index on points).
Server-side `Pageable`/`PageRequest` with whitelisted sort fields and a stable `id` tie-breaker; teacher awards use a
pessimistic row lock to avoid lost updates.

**API design & demo (20%)** – Validation with `@Valid/@NotBlank/@Email/@Size/@Min/@Max`; one `@RestControllerAdvice`
(`GlobalExceptionHandler`) for consistent errors. Every UI feature has an endpoint (see table above).

## 5. Suggested live-demo script
1. Register a new student → lands on the leaderboard with a standing card (rank last, 0 pts).
2. Toggle Day/Night — all screens restyle instantly; kill and reopen the app → still logged in, theme remembered.
3. Log out, log in as `teacher@school.com` → tap a student → award +30 → list reorders instantly.
4. Switch sort chips (Top / Lowest / Name), scroll to load more pages (page size 15; add students to see paging).
5. On a second device log in as that student → rank/points updated (pull to refresh).
6. Show a 403 (curl a student token against `POST …/points`) and a 400 validation error JSON.
