# React-Django Communication: Architecture & Design Patterns

## Overview: Component Communication Strategies

### The Three API Communication Patterns

```
Pattern 1: DIRECT COMPONENT API CALLS
────────────────────────────────────

Component.jsx:
  useEffect(() => {
    // Directly call API inside component
    api.get('/endpoint')
      .then(response => setData(response.data))
      .catch(error => setError(error))
  }, [])

Pros: Simple, localized, no dependencies
Cons: Code duplication, hard to share data, hard to manage


Pattern 2: CENTRALIZED SERVICE LAYER
────────────────────────────────────

authService.js:
  export const login = async (email, password) => {
    const response = await api.post('/auth/login/', {email, password})
    return response.data
  }

Component.jsx:
  const { login } = useAuth()
  const result = await login(email, password)

Pros: Reusable, centralized logic, testable
Cons: Need to manage responses, still component state


Pattern 3: CONTEXT + SERVICE LAYER (YOUR APP USES THIS)
──────────────────────────────────────────────────────

AuthContext.jsx:
  export const login = async (email, password) => {
    const response = await authService.login(email, password)
    setUser(response.user)  // Store globally
    return response
  }

Component.jsx:
  const { user, login } = useAuth()  // Get from context
  await login(email, password)
  // User automatically updates everywhere

Pros: Global state, automatic UI updates, clean components
Cons: More boilerplate, context updates can be expensive
```

---

## Authentication Architecture Details

### JWT Token Lifecycle

```
TIME PROGRESSION:

T=0 (Login)
  ├─ User submits credentials
  ├─ Backend generates JWT tokens
  │  ├─ Access token: expires in 1 hour
  │  ├─ Refresh token: expires in 7 days
  │
  └─ Frontend stores both in localStorage

T=30 minutes
  ├─ User browses dashboard (making API calls)
  ├─ Access token still valid
  ├─ Every request includes: Authorization: Bearer {access_token}
  └─ Backend accepts request (token not expired)

T=50 minutes (Token about to expire)
  ├─ User makes another API call
  ├─ Access token is now invalid (expired 50 minutes in)
  ├─ Backend returns 401 Unauthorized
  └─ Interceptor sees 401

T=50 minutes (Interceptor runs)
  ├─ Intercepts the 401 response
  ├─ Gets refresh_token from localStorage
  ├─ Sends: POST /api/auth/token/refresh/ {refresh: token}
  ├─ Backend validates refresh token
  ├─ Refresh token still valid (7 days, only 50 min passed)
  ├─ Backend generates NEW access_token
  ├─ Frontend receives new access_token
  ├─ localStorage updated with new access_token
  ├─ Original request retried with new token
  └─ Request succeeds

T=8 days (Refresh token expired)
  ├─ User was away for 8 days
  ├─ Makes API call with old access_token
  ├─ Backend returns 401 (expired)
  ├─ Interceptor tries to refresh
  ├─ Sends refresh_token (but it's 8 days old)
  ├─ Backend returns 401 (refresh also expired)
  ├─ Interceptor gives up
  ├─ Clears localStorage
  ├─ Redirects to /login
  └─ User must log in again
```

### Token Structure Conceptually

```
Access Token (JWT Format):
  header.payload.signature
  
  header: { alg: "HS256", typ: "JWT" }
  
  payload (encoded, not encrypted):
    {
      "user_id": 1,
      "role": "customer",
      "email": "john@example.com",
      "iat": 1705843200,        (issued at)
      "exp": 1705846800         (expires in)
    }
  
  signature: HMAC-SHA256 hash (Backend has secret key)
  
When backend receives token:
  1. Decode payload (base64)
  2. Verify signature using secret key
  3. Check expiration (current time > exp?)
  4. If all valid → accept request
  5. If signature mismatch → 401 (tampered)
  6. If expired → 401 (refresh needed)

Frontend doesn't need to decode (let backend do it)
Frontend just stores as string and sends in header
```

---

## API Request-Response Cycle in Detail

### Complete Request Flow with Interceptors

```
STEP 1: Component Makes Request
────────────────────────────────

Code:
  api.get('/api/service/requests/')

What Axios Does:
  Calls request interceptor first


STEP 2: Request Interceptor Runs
─────────────────────────────────

Pseudocode:
  interceptor.request = (config) => {
    // config = { method, url, headers, data, ... }
    
    // Step A: Set Content-Type if not set
    if (!config.headers['Content-Type']) {
      config.headers['Content-Type'] = 'application/json'
    }
    
    // Step B: Get token from localStorage
    const token = localStorage.getItem('access_token')
    
    // Step C: If token exists, add to header
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    // Step D: Return modified config
    return config
  }

Result:
  Request now includes Authorization header
  Ready to send to backend


STEP 3: Network Request Sent
─────────────────────────────

Actual HTTP Request:
  POST /api/auth/login/
  
  Headers:
    Content-Type: application/json
    Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
  
  Body:
    { email: "john@...", password: "Pass@123!" }


STEP 4: Backend Processes
──────────────────────────

Django REST Framework:
  1. Receives request
  2. Checks Authorization header
  3. Extracts JWT token
  4. Verifies signature (using secret key)
  5. Checks expiration
  6. If valid → Extracts user_id from token
  7. Loads user from database
  8. Processes request with user context
  9. Returns response


STEP 5: Backend Sends Response
───────────────────────────────

Success Response (200):
  HTTP 200 OK
  
  Body:
    {
      "success": true,
      "access": "eyJ...",
      "refresh": "eyJ...",
      "user": { "id": 1, "email": "..." }
    }

Error Response (401):
  HTTP 401 Unauthorized
  
  Body:
    {
      "detail": "Token has invalid signature."
    }


STEP 6: Response Interceptor Runs
──────────────────────────────────

Pseudocode:
  interceptor.response.success = (response) => {
    // Status 2xx
    return response
  }
  
  interceptor.response.error = async (error) => {
    // Status 4xx, 5xx
    const status = error.response?.status
    
    if (status === 401 && !error.config._retry) {
      error.config._retry = true
      
      // Try to refresh token
      const refreshToken = localStorage.getItem('refresh_token')
      
      const newResponse = await api.post(
        '/api/auth/token/refresh/',
        { refresh: refreshToken }
      )
      
      const newAccessToken = newResponse.data.access
      localStorage.setItem('access_token', newAccessToken)
      
      // Retry original request
      error.config.headers.Authorization = `Bearer ${newAccessToken}`
      return api(error.config)
    }
    
    return Promise.reject(error)
  }

Result:
  If 401 → Auto-refresh attempt
  If refresh succeeds → Retry original request
  If refresh fails → Return error
  If not 401 → Return error as-is


STEP 7: Component Receives Response
────────────────────────────────────

Success Code:
  api.get('/endpoint')
    .then(response => {
      // response.data has the actual data
      setData(response.data)
    })

Error Code:
  api.get('/endpoint')
    .catch(error => {
      // error.response has error details
      setError(error.response?.data?.message)
    })
```

---

## State Management Deep Dive

### Component State vs Context State

```
COMPONENT STATE (useState)
──────────────────────────

Purpose: Manage data specific to one component

Example - Register.jsx:
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    password: '',
    password_confirm: ''
  })

Properties:
  - Local to component only
  - Other components can't access
  - Cleared when component unmounts
  - Fast updates (component re-renders)

Lifecycle:
  Mount → Initialize state
  Update → setFormData(...) triggers re-render
  Unmount → State destroyed

Good for:
  - Form inputs
  - Temporary UI state (dropdowns, modals)
  - Component-specific data


CONTEXT STATE (useContext)
──────────────────────────

Purpose: Share data across many components

Example - AuthContext:
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

Properties:
  - Global across entire app
  - Any component can access via useAuth()
  - Persists until explicitly cleared
  - Updates trigger re-render of all subscribers

Lifecycle:
  Create context → Wrap app in provider
  useAuth() in any component → Get current value
  setUser(data) → All subscribers get notified
  Logout → setUser(null) → All see new value

Good for:
  - User authentication state
  - Global app settings
  - Data needed by many components


LOCALSTORAGE (Persistent)
─────────────────────────

Purpose: Persist data across page reloads

What lives here:
  localStorage.setItem('access_token', token)
  localStorage.setItem('refresh_token', token)
  localStorage.setItem('user', JSON.stringify(user))

Properties:
  - Survives page reload
  - Survives closing browser
  - Browser-specific (not shared between tabs)
  - Can store ~5-10 MB per domain

Lifecycle:
  Set on login → Stays until explicitly removed
  Retrieved on app mount → Populate context
  Cleared on logout → User data gone

Risk:
  - Vulnerable to XSS (if JS is compromised)
  - Can be accessed by any script on page
  - Not encrypted (visible in dev tools)

Mitigation:
  - Use HTTPS (prevent network sniffing)
  - Input validation (prevent XSS)
  - Short token expiration (limit damage)


THE FLOW TOGETHER:
──────────────────

Page Load:
  1. App mounts
  2. AuthProvider reads from localStorage
  3. If tokens exist → call API to verify user
  4. setUser(user) → context updates
  5. All useAuth() hooks now see user

Register:
  1. formData (component state) ← User input
  2. Click Submit → API call → Backend response
  3. Success → Navigate away → Component unmounts → formData destroyed
  4. Note: User NOT in context yet (not logged in)

Login:
  1. formData (component state) ← User input
  2. Click Submit → API call → Backend response
  3. Response includes tokens
  4. localStorage.setItem(tokens)
  5. setUser(user) → AuthContext updates
  6. All subscribers see user = loggedInUser
  7. Navigate to dashboard

Dashboard:
  1. const { user } = useAuth() → Get from context
  2. userProfile (component state) ← Fetch from API
  3. serviceRequests (component state) ← Fetch from API
  4. Render with all data

Logout:
  1. Click Logout
  2. localStorage.removeItem(all tokens)
  3. setUser(null) → AuthContext updates
  4. All subscribers see user = null
  5. ProtectedRoute redirects to /login
  6. Dashboard component unmounts → state destroyed
```

---

## API Endpoint Patterns

### CRUD Operations with Authorization

```
CREATE (Registration)
─────────────────────
POST /api/auth/register/
  Authorization: None (public endpoint)
  Payload: { name, email, mobile, password, password_confirm }
  Response: { user, otp }
  Status: 201 Created
  Idempotent: No (creates new resource)


CREATE (Service Request)
────────────────────────
POST /api/service/requests/
  Authorization: Bearer {access_token}
  Payload: { vehicle, description, scheduled_date }
  Response: { id, customer, vehicle, status, ... }
  Status: 201 Created
  Idempotent: No


READ (Get All)
──────────────
GET /api/service/requests/
  Authorization: Bearer {access_token}
  Payload: None
  Query: ?status=pending&vehicle=1
  Response: { results: [...], count: X }
  Status: 200 OK
  Idempotent: Yes (safe to call multiple times)


READ (Get One)
──────────────
GET /api/service/requests/1/
  Authorization: Bearer {access_token}
  Payload: None
  Response: { id, customer, vehicle, status, ... }
  Status: 200 OK
  Idempotent: Yes


UPDATE
──────
PATCH /api/service/requests/1/
  Authorization: Bearer {access_token}
  Payload: { status: "in_progress", cost: "500" }
  Response: { id, customer, ..., status: "in_progress", cost: "500" }
  Status: 200 OK
  Idempotent: Depends on backend logic
  
  Note: PATCH = partial update
        PUT = replace entire resource


DELETE
──────
DELETE /api/service/requests/1/
  Authorization: Bearer {access_token}
  Payload: None
  Response: {} (empty body)
  Status: 204 No Content
  Idempotent: Yes (deleting again = same result)


CUSTOM ACTIONS
──────────────
POST /api/service/requests/1/cancel/
  Authorization: Bearer {access_token}
  Payload: {} or { reason: "..." }
  Response: { id, status: "cancelled", ... }
  Status: 200 OK
  Idempotent: No (might fail if already cancelled)

POST /api/auth/token/refresh/
  Authorization: None
  Payload: { refresh: "token_string" }
  Response: { access: "new_token" }
  Status: 200 OK
  Idempotent: Yes (always returns new token)
```

---

## Error Response Patterns

### Standard Backend Error Format

```
400 Bad Request (Client Error)
───────────────────────────────

Case 1: Validation Error
  {
    "field_name": ["Error message"],
    "another_field": ["Error message 1", "Error message 2"]
  }
  
  Frontend handling:
    error.response.data.field_name
    = ["Error message"]

Case 2: Form-level Error
  {
    "non_field_errors": ["Error message"]
  }
  
  Frontend handling:
    error.response.data.non_field_errors


401 Unauthorized (Authentication Failed)
─────────────────────────────────────────

Case 1: Missing Token
  {
    "detail": "Authentication credentials were not provided."
  }

Case 2: Invalid Token
  {
    "detail": "Given token not valid for any token type"
  }

Case 3: Expired Token
  {
    "detail": "Token has invalid signature."
  }

Frontend handling:
  Interceptor catches this
  Automatically refreshes token
  Retries request
  If refresh fails → Redirect to /login


403 Forbidden (Authorization Failed)
─────────────────────────────────────

Case 1: Role Check Failed
  {
    "detail": "You do not have permission to perform this action."
  }

Frontend handling:
  Check error.response.status === 403
  Show: "You don't have access to this feature"


404 Not Found
──────────────

Case 1: Resource Doesn't Exist
  {
    "detail": "Not found."
  }

Frontend handling:
  Check error.response.status === 404
  Show: "Resource not found"


500 Internal Server Error
──────────────────────────

Case 1: Unhandled Exception
  {
    "detail": "Internal server error"
  }

Frontend handling:
  Check error.response.status === 500
  Show: "Server error. Please try again later."
  Log error for debugging


Network Error (No response)
───────────────────────────

Case 1: No internet
  error.response = undefined
  error.message = "Network error"

Case 2: CORS issue
  error.response = undefined
  error.code = "ERR_CORS_DISABLED"

Frontend handling:
  Check !error.response
  Show: "Cannot connect to server"
```

---

## Performance Considerations

### Optimization Patterns

```
PROBLEM 1: Too Many API Calls
──────────────────────────────

Bad:
  useEffect(() => {
    api.get('/users')  // Call 1
    api.get('/posts')  // Call 2
    api.get('/comments')  // Call 3
  }, [])
  
  Sequential → Slow (each waits for previous)

Good:
  useEffect(() => {
    Promise.all([
      api.get('/users'),
      api.get('/posts'),
      api.get('/comments')
    ])
  }, [])
  
  Parallel → Fast (all start together)


PROBLEM 2: Component Re-renders Too Often
──────────────────────────────────────────

Bad:
  const [user, setUser] = useState(null)
  const [posts, setPosts] = useState([])
  
  api.get('/users').then(r => setUser(r.data))  // Triggers re-render
  api.get('/posts').then(r => setPosts(r.data))  // Triggers another re-render

Solution:
  const [data, setData] = useState({
    user: null,
    posts: []
  })
  
  Promise.all([...]).then(results => {
    setData({  // Single re-render
      user: results[0].data,
      posts: results[1].data
    })
  })


PROBLEM 3: Infinite Re-render Loop
───────────────────────────────────

Bad:
  useEffect(() => {
    api.get('/data').then(r => setState(r.data))
  })  // No dependency array!
  
  Effect runs → setState → component re-renders
  Re-render → Effect runs again → setState again
  LOOP!

Good:
  useEffect(() => {
    api.get('/data').then(r => setState(r.data))
  }, [])  // Empty dependency array
  
  Effect runs once on mount
  No loop


PROBLEM 4: Stale Data
────────────────────

Bad:
  const [data, setData] = useState(null)
  
  useEffect(() => {
    // Data fetched at T=0
    api.get('/data').then(r => setData(r.data))
  }, [])
  
  User browses page
  Real data changes on backend
  Frontend never knows (still showing old data)

Solution 1: Refresh Button
  <button onClick={() => {
    api.get('/data').then(r => setData(r.data))
  }}>Refresh</button>

Solution 2: Polling
  useEffect(() => {
    const interval = setInterval(() => {
      api.get('/data').then(r => setData(r.data))
    }, 30000)  // Every 30 seconds
    
    return () => clearInterval(interval)
  }, [])

Solution 3: WebSockets
  Real-time connection to server
  Server pushes updates automatically
```

---

## Debugging API Communication

### Common Issues & Solutions

```
Issue 1: 401 Unauthorized on Every Request
────────────────────────────────────────────

Symptoms:
  - Login works fine
  - Dashboard immediately gets 401
  - Can't fetch any data

Causes:
  1. Token not being added to header
     Fix: Check request interceptor is registered
     
  2. Token corrupted/invalid in localStorage
     Fix: Check localStorage in dev tools
     
  3. Token used before server restarted
     Fix: Clear localStorage, login again

Debug:
  console.log('Token:', localStorage.getItem('access_token'))
  In Network tab, check request headers include Authorization


Issue 2: CORS Error
──────────────────

Symptoms:
  - Browser console shows CORS error
  - No response from backend

Causes:
  1. Backend doesn't allow frontend origin
  Fix: Check Django settings for CORS configuration
     CORS_ALLOWED_ORIGINS = ['http://localhost:5173']
     
  2. Frontend using wrong origin
  Fix: Check VITE_API_BASE_URL in .env
     Should match backend's allowed origins

Debug:
  Browser console: Check full error message
  Network tab: Response status shows preflight failure


Issue 3: Token Refresh Not Working
───────────────────────────────────

Symptoms:
  - First request works
  - After 1 hour, requests fail with 401
  - Doesn't automatically redirect to /login

Causes:
  1. Refresh endpoint not configured
  Fix: Check API_ENDPOINTS.REFRESH_TOKEN in config
     '/auth/token/refresh/'
     
  2. Refresh token missing from localStorage
  Fix: Check login stores both access + refresh tokens
     localStorage.setItem('refresh_token', token)
     
  3. Refresh token also expired
  Fix: Check token lifetimes
     If both < 1 hour, will fail after 1 hour
     Refresh should be longer than access

Debug:
  In interceptor, add console.log
  Check if refresh attempt is made
  Check refresh endpoint returns new token


Issue 4: Infinite 401 Loop
───────────────────────────

Symptoms:
  - Page keeps showing "401 Unauthorized"
  - Doesn't redirect to /login
  - Error repeats endlessly

Causes:
  1. Refresh token is also invalid
  2. Interceptor catches 401, tries refresh, fails, retries, fails...

Solution:
  In interceptor, add safeguard:
    if (!refreshToken || maxRetries > 3) {
      logout()  // Stop trying, just logout
    }

Debug:
  Check interceptor logic
  Add console.log at each step
  Verify logout clears tokens


Issue 5: State Not Updating After API Call
────────────────────────────────────────────

Symptoms:
  - API call succeeds (200 OK in Network tab)
  - Response has data
  - But component doesn't show data

Causes:
  1. setState not called
  Fix: Make sure .then(r => setState(r.data))
  
  2. setState with wrong path
  Fix: Check response structure
     response.data vs response.data.results
     
  3. Dependency array missing
  Fix: Add [] dependency array to useEffect

Debug:
  console.log('Response:', response.data)
  console.log('State:', state)
  Check if setState was called
  Check if component re-rendered
```

---

## Testing API Communication

### Manual Testing Checklist

```
1. AUTHENTICATION FLOW
   ☐ Register new user → receive OTP email
   ☐ Verify OTP → user is_verified = true
   ☐ Login with email/password → receive tokens
   ☐ Check localStorage has access + refresh tokens
   ☐ Check useAuth() returns user object
   ☐ Logout → tokens cleared, redirected to /login

2. PROTECTED ROUTES
   ☐ Without token → redirect to /login
   ☐ With expired token → auto-refresh → request succeeds
   ☐ With invalid token → redirect to /login
   ☐ Refresh token expired → redirect to /login

3. API CALLS
   ☐ GET requests include Authorization header
   ☐ POST requests include Authorization + Content-Type
   ☐ Request body is valid JSON
   ☐ Response is properly parsed

4. LOADING STATES
   ☐ Form disabled while loading
   ☐ Spinner shown while fetching data
   ☐ Loading state cleared on error
   ☐ Loading state cleared on success

5. ERROR HANDLING
   ☐ 400 errors show field-specific messages
   ☐ 401 errors trigger refresh or redirect
   ☐ 403 errors show "Access denied"
   ☐ 500 errors show "Try again later"
   ☐ Network errors show "No connection"

6. FORM VALIDATION
   ☐ Email format validated
   ☐ Mobile 10 digits validated
   ☐ Password strength validated
   ☐ Duplicate email/mobile caught by backend

7. DATA PERSISTENCE
   ☐ Close browser, reopen → still logged in
   ☐ Refresh page → data still there
   ☐ New tab → sees same login state
   ☐ Clear localStorage → logged out

8. SECURITY
   ☐ Token not in URL (only header)
   ☐ Tokens not logged to console
   ☐ HTTPS in production
   ☐ Password not sent in plaintext (HTTPS required)
```

---

**This document explains ARCHITECTURE and PATTERNS.**
**Code examples are CONCEPTUAL, not for copying.**
**Refer to actual implementation files for details.**
