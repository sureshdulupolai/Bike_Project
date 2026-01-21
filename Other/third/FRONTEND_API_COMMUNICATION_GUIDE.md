# BikeHub Frontend-Backend Communication Guide

## Overview: How React Talks to Django REST API

### Big Picture
```
┌─────────────────┐          ┌──────────────┐          ┌──────────────┐
│   React         │  HTTP    │   Axios      │  HTTP    │  Django REST │
│   Component     │◄────────►│  (Client)    │◄────────►│   API        │
│                 │  JSON    │              │  JSON    │              │
└─────────────────┘          └──────────────┘          └──────────────┘
   Form Input                Request/Response             Process
   State Update              Interceptors               Serialize
   Redirect                  Error Handling              Database
```

---

## 1. REGISTER PAGE FLOW

### What Happens When User Registers?

```
USER ACTION                    REACT COMPONENT              BACKEND
─────────────────────────────────────────────────────────────────────

1. User enters form      ──►  Form state updates         (no API yet)
                              (name, email, mobile,
                               password, confirm)

2. User clicks Register  ──►  Frontend validation        (no API yet)
                              - Email format?
                              - Mobile 10 digits?
                              - Password strong?
                              - Passwords match?

3. If valid              ──►  setLoading(true)           (no API yet)
   Disable form

4. Create payload:            {
                                "name": "John Doe",
                                "email": "john@example.com",
                                "mobile": "9876543210",
                                "password": "Pass@123!",
                                "password_confirm": "Pass@123!"
                              }

5. Send request                                      ──►  POST /api/auth/register/
   (POST HTTP)                                            Validates on backend:
                                                          - Email unique?
                                                          - Mobile unique?
                                                          - Password strength?

6. Backend creates                                  ──►  1. Creates User row
   user record                                            (is_verified = false)
                                                          2. Generates 6-digit OTP
                                                          3. Sends OTP via email
                                                          4. Returns response

7. Response received      ◄──  {
                                  "success": true,
                                  "user": {
                                    "id": 1,
                                    "name": "John Doe",
                                    "email": "john@example.com",
                                    "role": "customer"
                                  },
                                  "otp": "123456"  (testing only)
                                }

8. Check response         ──►  if (response.success)     (no further API)
                                  - Save email to
                                    sessionStorage
                                  - Clear form
                                  - Show success msg
                                  - Wait 2 seconds
                                  - Redirect to
                                    /verify-otp page

9. Handle errors          ──►  if (response.error)       (no further API)
                                  - Validation error?
                                  - Duplicate email/mobile?
                                  - Server error?
                                  - Show error message
                                  - Keep form filled
                                  - Keep form enabled
```

### Key Concepts for Register

#### **Axios Instance**
- Single axios instance configured once
- Base URL: `http://localhost:8000/api`
- Headers: `Content-Type: application/json`
- Used for: `api.post(endpoint, data)`

#### **Form Validation (Frontend)**
- Email: `regex check` for valid format
- Mobile: `regex check` for exactly 10 digits
- Password: `regex check` for 8+ chars + number + special character
- Passwords: `direct comparison` (this === confirm)
- Purpose: Fail fast before hitting backend

#### **Backend Validation (Server)**
- Email uniqueness: Check if already exists
- Mobile uniqueness: Check if already exists  
- Password strength: Verify requirements
- Purpose: Final security check, catch edge cases

#### **OTP Generation Flow**
```
Backend Process:
  1. Generate random 6-digit code
  2. Create OTP record in database (expires after 10 min)
  3. Send OTP via email service
  4. Return OTP in response (for testing/development)
  5. Frontend logs OTP to console
  6. Frontend redirects user to OTP verification page
```

#### **State Stored After Register**
- **sessionStorage**: Email (temporary, for OTP verification)
- **localStorage**: Nothing yet (user not logged in)
- **Component state**: Form data cleared after successful submit
- **Component state**: Loading flag toggled off
- **Component state**: Success message shown briefly

#### **Error Scenarios**
```
Error Type              HTTP Status    Frontend Action
─────────────────────────────────────────────────────
Email already exists    400            Show inline error
Mobile already exists   400            Show inline error
Password too weak       400            Show inline error
Validation failed       400            Show field errors
Server error           500            Show general error
Network error          (no status)    Show connection error
```

---

## 2. LOGIN PAGE FLOW

### What Happens When User Logs In?

```
USER ACTION                    REACT COMPONENT              BACKEND
─────────────────────────────────────────────────────────────────────

1. User enters           ──►  Form state updates         (no API yet)
   email & password            (email, password)

2. User clicks Login     ──►  Basic validation:          (no API yet)
                              - Email looks valid?
                              - Password not empty?

3. If valid              ──►  setLoading(true)           (no API yet)
   Disable form

4. Create payload:            {
                                "email": "john@example.com",
                                "password": "Pass@123!"
                              }

5. Send request                                      ──►  POST /api/auth/login/
   (POST HTTP)                                            1. Find user by email
                                                          2. Check password hash
                                                          3. Check is_verified?
                                                          4. Generate JWT tokens

6. Backend creates JWT                               ──►  1. Access token
   tokens                                                 (expires: 1 hour)
                                                          2. Refresh token
                                                          (expires: 7 days)

7. Response received      ◄──  {
                                  "success": true,
                                  "access": "eyJ...abc...",
                                  "refresh": "eyJ...xyz...",
                                  "user": {
                                    "id": 1,
                                    "email": "john@example.com",
                                    "name": "John Doe",
                                    "role": "customer"
                                  }
                                }

8. Store tokens          ──►  localStorage.setItem(     (no API yet)
                                  "access_token",
                                  response.access
                                )
                                localStorage.setItem(
                                  "refresh_token",
                                  response.refresh
                                )

9. Store user data       ──►  localStorage.setItem(     (no API yet)
                                  "user",
                                  JSON.stringify(user)
                                )

10. Update context       ──►  setUser(response.user)    (no API yet)
    (global auth state)       (AuthContext updates)
                              All components see:
                              useAuth() → returns user

11. Redirect             ──►  if (user.role ===         (no API yet)
                                  "customer")
                                navigate("/dashboard")
                              else if (role === "admin")
                                navigate("/admin")

12. Handle errors        ──►  if (error.response)        (no API yet)
                              - Invalid email?
                              - Wrong password?
                              - User not verified?
                              - Show error message
                              - Keep form filled
                              - Keep form enabled
```

### Key Concepts for Login

#### **JWT Token Structure**
```
Access Token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.payload.signature
  - Contains: user_id, role, expiration time
  - Used for: API requests
  - Lifetime: 1 hour (expires quickly)
  - Storage: localStorage (accessed frequently)

Refresh Token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.payload.signature
  - Contains: user_id, token_version
  - Used for: Getting new access token when expired
  - Lifetime: 7 days
  - Storage: localStorage (accessed rarely)
```

#### **How Axios Uses Tokens (Interceptor Pattern)**
```
BEFORE EVERY REQUEST:
  1. Check if access_token exists in localStorage
  2. If yes, add to header: "Authorization: Bearer {access_token}"
  3. If no, skip (it's a public endpoint like /login)
  4. Send request

AFTER EVERY RESPONSE:
  1. If status = 401 (Unauthorized)
     → Token expired, try to refresh
  2. Get refresh_token from localStorage
  3. Send: POST /api/auth/token/refresh/ {refresh: token}
  4. Backend returns new access_token
  5. Save new access_token to localStorage
  6. Retry original request with new token
  7. If refresh fails → Logout user, redirect to /login

  If status = 200-299 (Success)
     → Just return response to component

  If status = 400, 403, 500, etc.
     → Return error to component's catch block
```

#### **AuthContext (Global State)**
```
What it stores:
  - user: { id, email, name, role }
  - loading: boolean (checking if user still logged in)

Methods it provides:
  - useAuth() → hook to access user anywhere
  - login(email, password) → call API, store tokens, update context
  - logout() → clear tokens, clear localStorage, redirect
  - updateUser() → refresh user data from context

Usage in components:
  const { user, loading, login, logout } = useAuth();
  
  if (loading) return <div>Checking auth...</div>;
  if (!user) return <Redirect to="/login" />;
  return <Dashboard user={user} />;
```

#### **Token Storage & Security**
```
Storage Location: localStorage (persists across browser refresh)
  Pros:
    - Survives page reload
    - User stays logged in even after closing browser
    - Easy to access from any component
  
  Cons:
    - Vulnerable to XSS attacks (if JS is compromised)
    - Cannot be httpOnly (server doesn't send it)
  
Security Mitigation:
    - Input validation on all forms
    - No sensitive data in tokens
    - HTTPS only (in production)
    - Token expiration (1 hour for access, 7 days for refresh)
    - CSRF protection via Django settings
```

#### **Error Scenarios**
```
Error Type              HTTP Status    Frontend Action
─────────────────────────────────────────────────────
Email not found         400            "Email not found"
Wrong password          400            "Incorrect password"
User not verified       400            "Please verify email first"
Token expired           401            Auto-refresh or logout
Server error           500            "Server error, try later"
Network error          (none)         "Cannot connect to server"
CORS issue            (CORS error)    Check backend settings
```

---

## 3. DASHBOARD PAGE FLOW

### What Happens When User Opens Dashboard?

```
USER ACTION                    REACT COMPONENT              BACKEND
─────────────────────────────────────────────────────────────────────

1. User navigates         ──►  <ProtectedRoute>          (no API yet)
   to /dashboard               checks: is user logged in?
                               if no → redirect to /login
                               if yes → render Dashboard

2. Dashboard mounts       ──►  useEffect runs:           (no API yet)
   (component loads)           1. Get access_token from
                                  localStorage
                               2. Check Axios interceptor
                                  ready? (yes)
                               3. Prepare API calls

3. Fetch user profile     ──►  Call: GET /api/auth/me/ ──►  1. Verify token
                               (with Authorization        2. Find user by
                                header)                       user_id in token
                                                           3. Return user data
                                                              (email, name,
                                                               role, etc.)

4. Response received      ◄──  {
                                  "id": 1,
                                  "email": "john@...",
                                  "name": "John Doe",
                                  "role": "customer",
                                  "is_verified": true
                                }

5. Update component       ──►  setUserProfile(response) (no further API)
   state                        Display:
                                - "Welcome, John Doe"
                                - Email, mobile, etc.

6. Fetch service          ──►  Call: GET                ──►  1. Verify token
   requests (customer)          /api/service/requests/      2. User is customer?
                                ?my_services=true           3. Filter by
                               (with Authorization           customer_id
                                header)                      4. Return only
                                                               their requests

7. Response received      ◄──  {
                                  "results": [
                                    {
                                      "id": 1,
                                      "vehicle": 2,
                                      "status": "pending",
                                      "description": "Oil change",
                                      "scheduled_date": "2026-02-15",
                                      "cost": "500.00"
                                    }
                                  ]
                                }

8. Update component       ──►  setServiceRequests(      (no further API)
   state                        response.results)
                                Display in table:
                                - Status badge
                                - Service date
                                - Cost estimate
                                - Action buttons

9. Handle loading         ──►  if (loading)              (no API yet)
   states                       show <Loading /> spinner
                                else show data

10. Handle errors         ──►  if (error)                (no API yet)
                               - 401: Token expired
                                      → Auto-refresh or logout
                               - 403: No permission
                                      → Show "Access denied"
                               - 500: Server error
                                      → Show "Try again later"
                               - Network: Connection lost
                                      → Show offline message
```

### Key Concepts for Dashboard

#### **Protected Routes Pattern**
```
Component Structure:
  <ProtectedRoute>
    - Check localStorage for access_token
    - Check if user exists in AuthContext
    - If both yes → Render <Dashboard />
    - If no → <Redirect to="/login" />
    - If checking → <Loading /> spinner

Purpose:
  - Prevent unauthenticated users from seeing dashboard
  - Redirect to login if token missing or expired
  - Show loading while verifying auth status
```

#### **API Calls with Authentication**
```
Every dashboard API call includes:
  
  Axios Request:
    Headers: {
      "Authorization": "Bearer {access_token}",
      "Content-Type": "application/json"
    }
    
Backend validates:
  1. Is header present?
  2. Is format correct? (Bearer token)
  3. Is token valid? (Check signature)
  4. Is token expired? (Check timestamp)
  5. Is user active? (Check is_active flag)
  
If all pass → Process request
If any fail → Return 401, frontend catches and refreshes
```

#### **Multiple Simultaneous API Calls**
```
Dashboard might need data from multiple endpoints:

Approach 1: Sequential (one after another)
  1. GET /api/auth/me/
  2. Wait for response
  3. GET /api/service/requests/
  4. Wait for response
  5. Render (slower, but simpler)

Approach 2: Parallel (all at same time)
  Promise.all([
    api.get("/api/auth/me/"),
    api.get("/api/service/requests/")
  ])
  Both start together, wait for all to finish, then render
  (faster, more efficient)

Best practice: Use Promise.all for independent requests
```

#### **Real-Time Data Updates**
```
When dashboard loads:
  Data is fetched once
  State is set
  Component renders with that data

If data changes on backend:
  Frontend doesn't know automatically
  Options to update:
  
  1. User clicks "Refresh" button
     → Manually call GET again
  
  2. Polling (every 30 seconds)
     → useEffect with interval
     → Call GET again
     → Compare with current state
     → Update if different
  
  3. WebSockets (real-time)
     → Persistent connection
     → Server pushes updates
     → Instant UI update
     (not implemented in basic version)
```

#### **Error Handling in Dashboard**
```
Scenario 1: Token Expired During Load
  1. User is logged in (token in localStorage)
  2. User opens dashboard
  3. Backend returns 401 (token expired)
  4. Axios interceptor catches 401
  5. Intercepts tries to refresh token
  6. Backend returns new access_token
  7. Axios retries original request
  8. Dashboard renders with fresh data
  
Scenario 2: Refresh Token Also Expired
  1. Access token expired
  2. Intercepts tries to refresh
  3. Backend returns 401 (refresh also expired)
  4. Interceptor logs user out:
     - Clear localStorage (tokens, user)
     - Redirect to /login
  5. User must log in again
  
Scenario 3: User Role Change (Admin Logs In as Customer)
  1. Dashboard loads for customer
  2. API returns "user.role = admin"
  3. Frontend detects role mismatch
  4. Redirects to /admin/dashboard instead
  5. Shows admin-specific data
```

---

## 4. STATE MANAGEMENT ARCHITECTURE

### Where Data Lives in React App

```
┌────────────────────────────────────────────────────────┐
│                   REACT APP                            │
├────────────────────────────────────────────────────────┤
│                                                        │
│  ┌──────────────────────────────────────┐             │
│  │      localStorage (Browser)          │             │
│  │  ────────────────────────────────  │             │
│  │  - access_token (JWT)              │             │
│  │  - refresh_token (JWT)             │             │
│  │  - user { id, email, name, role }  │             │
│  │  - registeredEmail (temp)          │             │
│  │                                    │             │
│  │  Persists across page reloads      │             │
│  │  Cleared on logout                 │             │
│  └──────────────────────────────────────┘             │
│                      ↓                                │
│  ┌──────────────────────────────────────┐             │
│  │     AuthContext (Global State)       │             │
│  │  ────────────────────────────────  │             │
│  │  - user object                     │             │
│  │  - loading boolean                 │             │
│  │  - login() method                  │             │
│  │  - logout() method                 │             │
│  │  - register() method               │             │
│  │                                    │             │
│  │  Accessible everywhere:            │             │
│  │  const { user } = useAuth()         │             │
│  └──────────────────────────────────────┘             │
│                      ↓                                │
│  ┌──────────────────────────────────────┐             │
│  │    Component-Level State             │             │
│  │  ────────────────────────────────  │             │
│  │  Register.jsx:                     │             │
│  │    - formData (name, email, etc.)  │             │
│  │    - errors (validation)           │             │
│  │    - loading (button state)        │             │
│  │                                    │             │
│  │  Dashboard.jsx:                    │             │
│  │    - userProfile (API response)    │             │
│  │    - serviceRequests (API list)    │             │
│  │    - selectedRequest (current)     │             │
│  │                                    │             │
│  │  Only used within component        │             │
│  │  Reset when component unmounts     │             │
│  └──────────────────────────────────────┘             │
│                                                        │
└────────────────────────────────────────────────────────┘
```

### State Flow During Authentication

```
Initial Load:
  1. App.jsx mounts
  2. AuthProvider checks localStorage
  3. If tokens + user exist → setUser(user), loading=false
  4. If not → setUser(null), loading=false
  5. Components can now use useAuth()

During Registration:
  1. User fills form → Component state updated
  2. Submit → API call → Response
  3. Response stored in sessionStorage (email only)
  4. Navigate to /verify-otp
  5. AuthContext NOT updated yet (not logged in)

After OTP Verification:
  1. OTP verified
  2. Still not logged in
  3. User needs to go to /login page

During Login:
  1. User fills email + password → Component state
  2. Submit → API call → Response with tokens
  3. localStorage.setItem("access_token", ...)
  4. localStorage.setItem("refresh_token", ...)
  5. localStorage.setItem("user", ...)
  6. AuthContext updated: setUser(response.user)
  7. All components using useAuth() now see user
  8. Navigate to /dashboard

During Dashboard:
  1. Component mounts
  2. useEffect fetches data from /api/auth/me/
  3. Response sets component state: setUserProfile(...)
  4. Component re-renders with data
  5. Display user info, service requests, etc.

During Logout:
  1. User clicks logout button
  2. API call to POST /api/auth/logout/
  3. Clear localStorage (all tokens + user)
  4. Clear AuthContext: setUser(null)
  5. All components see user=null
  6. ProtectedRoute redirects to /login
```

---

## 5. AXIOS INTERCEPTORS EXPLAINED

### What Are Interceptors?

```
"Hooks" that run automatically before/after every API request

┌────────────────────────────────────────────────────────┐
│             EVERY API REQUEST FLOW                     │
├────────────────────────────────────────────────────────┤
│                                                        │
│  Component Code:                                       │
│    api.post("/api/auth/login/", data)                │
│              ↓                                         │
│  REQUEST INTERCEPTOR (runs BEFORE sending)            │
│    1. Get access_token from localStorage             │
│    2. Add to header: "Authorization: Bearer token"  │
│    3. Set "Content-Type: application/json"          │
│    4. Pass modified request to network              │
│              ↓                                        │
│  NETWORK REQUEST                                      │
│    POST http://localhost:8000/api/auth/login/        │
│    Headers: { Authorization: Bearer ..., ... }       │
│    Body: { email: "...", password: "..." }           │
│              ↓                                        │
│  BACKEND PROCESSES                                    │
│    Django REST Framework handles request             │
│    Verifies token (if provided)                      │
│    Returns response (200, 401, 400, 500, etc.)       │
│              ↓                                        │
│  RESPONSE INTERCEPTOR (runs AFTER receiving)         │
│    Check status code:                                │
│                                                       │
│    if status 200-299:                                │
│      Return response to component                    │
│                                                       │
│    if status 401 (Unauthorized):                     │
│      1. Get refresh_token from localStorage          │
│      2. Call POST /api/auth/token/refresh/           │
│      3. Receive new access_token                     │
│      4. Save to localStorage                         │
│      5. Retry original request with new token       │
│      6. Return new response to component             │
│                                                       │
│    if status 400, 403, 500:                          │
│      Return error to component's catch block        │
│              ↓                                        │
│  Component's .catch(error) handles error            │
│    Show error message to user                        │
│    Keep form enabled for retry                       │
│                                                       │
└────────────────────────────────────────────────────────┘
```

### Why Interceptors Matter

```
WITHOUT interceptors:
  Every component must:
    1. Get token from localStorage manually
    2. Add to request headers manually
    3. Check for 401 and refresh manually
    4. Retry request manually
    
  = Lots of repeated code in many components

WITH interceptors (centralized):
  1. Set up once in axios configuration
  2. ALL requests automatically use it
  3. ALL responses automatically handled
  4. Components just write simple: api.get("/endpoint")
  
  = DRY principle (Don't Repeat Yourself)
```

---

## 6. ERROR HANDLING STRATEGY

### Different Errors at Different Layers

```
┌────────────────────────────────────────────────────────┐
│         WHERE ERRORS CAN HAPPEN                        │
├────────────────────────────────────────────────────────┤
│                                                        │
│  Layer 1: VALIDATION (Frontend)                       │
│  ─────────────────────────────────                   │
│  Error: User enters invalid email format              │
│  Detection: Regex check in component                 │
│  Action: Show error below email field                │
│  API Call: NEVER SENT                                │
│                                                       │
│         ↓                                             │
│                                                       │
│  Layer 2: VALIDATION (Backend)                       │
│  ─────────────────────────────────                   │
│  Error: Email already registered                      │
│  Detection: Database query finds match               │
│  Response: HTTP 400 with message                     │
│  Action: Show error message to user                  │
│  API Call: SENT, rejected                            │
│                                                       │
│         ↓                                             │
│                                                       │
│  Layer 3: AUTHENTICATION (Backend)                   │
│  ──────────────────────────────────                  │
│  Error: Token invalid or expired                     │
│  Detection: JWT verification fails                  │
│  Response: HTTP 401 Unauthorized                     │
│  Action: Intercepts, refreshes, retries              │
│  API Call: SENT, interceptor handles                │
│                                                       │
│         ↓                                             │
│                                                       │
│  Layer 4: AUTHORIZATION (Backend)                    │
│  ──────────────────────────────────                  │
│  Error: User tries to access admin endpoint          │
│  Detection: Check user.role != "admin"              │
│  Response: HTTP 403 Forbidden                        │
│  Action: Show "Access Denied" message                │
│  API Call: SENT, rejected                            │
│                                                       │
│         ↓                                             │
│                                                       │
│  Layer 5: SERVER ERROR (Backend)                     │
│  ────────────────────────────────                    │
│  Error: Database connection lost                     │
│  Detection: Unhandled exception in Django            │
│  Response: HTTP 500 Internal Server Error            │
│  Action: Show "Try again later" message              │
│  API Call: SENT, error not caught                    │
│                                                       │
│         ↓                                             │
│                                                       │
│  Layer 6: NETWORK ERROR (Frontend)                   │
│  ────────────────────────────────────               │
│  Error: User offline / no internet                   │
│  Detection: Network request times out                │
│  Response: No HTTP status (connection failed)        │
│  Action: Show "Cannot connect to server"             │
│  API Call: NOT SENT / no response                    │
│                                                       │
└────────────────────────────────────────────────────────┘
```

### Error Handling Pseudo-Code Pattern

```
Conceptual (NOT real code):

TRY:
  1. Validate form locally
  2. If invalid → show errors, return early
  3. If valid → set loading=true
  4. Send API request with axios
  5. Wait for response
  6. If 2xx status → update state, show success
  7. If 3xx status → redirect
  
CATCH errors:
  8. If 400 (Bad request) → show field errors
  9. If 401 (Unauthorized) → auto-refresh
  10. If 403 (Forbidden) → show "Access Denied"
  11. If 500 (Server error) → show "Try later"
  12. If network error → show "Cannot connect"
  
FINALLY:
  13. Set loading=false (regardless of success/failure)
  14. Re-enable form
```

---

## 7. SECURITY BEST PRACTICES

### Frontend Security Considerations

```
┌────────────────────────────────────────────────────────┐
│             SECURITY CHECKLIST                         │
├────────────────────────────────────────────────────────┤
│                                                        │
│  ✅ Input Validation                                  │
│     - Validate all form inputs before sending         │
│     - Check email format, password strength, etc.    │
│     - Prevent obviously invalid data from hitting API │
│                                                       │
│  ✅ XSS Prevention (Cross-Site Scripting)             │
│     - React auto-escapes text in JSX (not strings)   │
│     - Never use dangerouslySetInnerHTML              │
│     - Never render user input as HTML                │
│     - Example bad: <div>{userInput}</div>            │
│     - Example good: <div>{escapeHTML(userInput)}</div>│
│                                                       │
│  ✅ HTTPS Only (Production)                           │
│     - In development: http://localhost:8000/api ✓   │
│     - In production: https://api.example.com ✓      │
│     - Never send tokens over HTTP (unencrypted)     │
│                                                       │
│  ✅ Token Expiration                                 │
│     - Access token: 1 hour (expires quickly)         │
│     - Refresh token: 7 days (slower expiration)      │
│     - Limits damage if token is stolen               │
│                                                       │
│  ✅ Token Storage                                    │
│     - localStorage: Accessible to JavaScript        │
│     - Vulnerable to XSS attacks                      │
│     - Alternative: httpOnly cookies (more secure,    │
│       but can't access from JS)                       │
│                                                       │
│  ✅ CSRF Protection (Cross-Site Request Forgery)     │
│     - Django sends CSRF token in responses           │
│     - Frontend includes it in state-changing requests │
│     - Backend validates CSRF token on POST/PATCH     │
│                                                       │
│  ✅ Password Handling                                │
│     - Never log passwords                           │
│     - Send over HTTPS only                          │
│     - Backend hashes before storing                 │
│     - Show password toggle for UX (show/hide icon)  │
│                                                       │
│  ✅ Error Messages                                   │
│     - Don't expose internal server details           │
│     - Bad: "User not found" (reveals if email exists)│
│     - Good: "Email or password incorrect"           │
│     - Generic message for security                  │
│                                                       │
│  ✅ API Key Security                                 │
│     - Never commit API keys to git                  │
│     - Use environment variables (.env file)         │
│     - Example: VITE_API_BASE_URL=http://localhost   │
│                                                       │
│  ✅ Logout Cleanup                                  │
│     - Clear ALL sensitive data on logout:           │
│       * localStorage (tokens, user data)            │
│       * Session storage (temporary data)            │
│       * Component state (form data)                 │
│     - Invalidate tokens on backend (blacklist)      │
│                                                       │
└────────────────────────────────────────────────────────┘
```

### Token Security Flow

```
How tokens prevent unauthorized access:

┌─────────────────────────────────────────────────────┐
│  Without Token: Anyone can access API                │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Hacker: GET /api/service/requests/123             │
│  Response: All data (no authentication)            │
│  Problem: Anyone can fetch anyone's data           │
│                                                     │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│  With Token: Only authenticated users access       │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Hacker: GET /api/service/requests/123             │
│  Header: (no Authorization)                        │
│  Backend: Returns 401 Unauthorized                 │
│                                                     │
│  Hacker: GET /api/service/requests/123             │
│  Header: Authorization: Bearer invalid_token       │
│  Backend: Verifies token → Invalid → 401           │
│                                                     │
│  Legitimate User: GET /api/service/requests/123    │
│  Header: Authorization: Bearer valid_token         │
│  Backend: Verifies token → Valid → Returns data   │
│           But only USER'S data (filtered by user_id)│
│                                                     │
│  Problem solved: Hacker can't access data          │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## 8. COMPLETE COMMUNICATION FLOW SUMMARY

### All Three Pages in One Diagram

```
USER JOURNEY                   FRONTEND                  BACKEND
─────────────────────────────────────────────────────────────────

Start                          Visit website
                               → No tokens in localStorage
                               → useAuth() returns null
                               → Redirect to /login
                                    ↓

LOGIN PAGE                     1. User enters email,
                                  password
                               2. Form validation
                                  (frontend only)
                               3. Click Submit
                                    ↓
                               API: POST /api/auth/login/
                               {email, password}     ──→ 1. Find user
                                                         2. Check password
                                                         3. Generate tokens
                                                            ↓
                               Response: {
                                 access_token,
                                 refresh_token,
                                 user
                               }         ◄──
                                    ↓
                               4. Save tokens to
                                  localStorage
                               5. Update AuthContext
                                  (setUser)
                               6. Redirect to /dashboard
                                    ↓

DASHBOARD PAGE                 1. <ProtectedRoute>
                                  checks if user exists
                               2. Render Dashboard
                               3. useEffect runs:
                                  - Fetch user profile
                                  - Fetch service requests
                                    ↓
                               API: GET /api/auth/me/   ──→ Return user
                               (with Authorization        data
                                header)          ◄──
                                    ↓
                               API: GET /api/service/   ──→ Return user's
                               requests/               service requests
                               (with Authorization  ◄──
                                header)
                                    ↓
                               4. Update component state
                                  with API responses
                               5. Render dashboard
                                  with user info &
                                  service list
                                    ↓

USER INTERACTIONS              User clicks:
                               - "Cancel Service"    ──→ POST /api/service/
                                                        requests/{id}/cancel/
                               - "Update Status"     ──→ PATCH /api/service/
                                                        requests/{id}/
                               - "Refresh Data"      ──→ GET endpoints again
                                    ↓

LOGOUT                         User clicks Logout
                               1. API: POST /api/auth/logout/  ──→ Invalidate
                               2. Clear localStorage             token
                               3. Clear AuthContext
                                  (setUser(null))
                               4. Redirect to /login
                               → Back to start
```

---

## 9. KEY TAKEAWAYS

### How Frontend Talks to Backend

```
1. AXIOS INSTANCE
   - Single HTTP client configured once
   - All components use the same instance
   - Automatically adds auth headers via interceptor
   - Automatically handles token refresh

2. STATE MANAGEMENT
   - Global: AuthContext (user, auth methods)
   - Local: Component state (form data, loading)
   - Persistent: localStorage (tokens, user basics)
   - Temporary: sessionStorage (registration email)

3. AUTHENTICATION FLOW
   Registration → Verification → Login → JWT Tokens → Authenticated
   (Register page) (OTP page)    (Login)  (stored)    (Dashboard)

4. PROTECTED ROUTES
   - Check token exists
   - Check user in context
   - If both present → Render page
   - If missing → Redirect to /login

5. ERROR HANDLING
   - Frontend validation first
   - API catches what frontend misses
   - Interceptor handles 401 (refresh)
   - Components handle other errors
   - Show user-friendly messages

6. SECURITY
   - Validate inputs before sending
   - Never log sensitive data
   - Use HTTPS in production
   - Set token expiration
   - Clear data on logout
   - Don't expose internal errors
```

---

## 10. COMMON PATTERNS IN YOUR APP

### Register Flow Summary
```
Form Input → Frontend Validation → API POST
→ Backend creates user → Backend sends OTP email
→ Response includes OTP (dev only) → Redirect to /verify-otp
```

### Login Flow Summary
```
Form Input → Frontend Validation → API POST
→ Backend verifies credentials → Generate JWT tokens
→ Response includes tokens → Save to localStorage
→ Update AuthContext → Redirect to /dashboard
```

### Dashboard Flow Summary
```
User logged in → <ProtectedRoute> checks auth
→ Component mounts → useEffect triggers
→ Multiple API calls (user, services, etc.)
→ All include Authorization header
→ Interceptor ensures tokens valid
→ Update component state
→ Render dashboard with data
```

---

**This guide explains the CONCEPTS and FLOW.**
**Refer to actual code files for implementation details.**

