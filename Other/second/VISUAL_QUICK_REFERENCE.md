# BikeHub API - Visual Quick Reference Card

## 🎯 Three Main APIs at a Glance

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    USER REGISTRATION API                                │
├─────────────────────────────────────────────────────────────────────────┤
│ METHOD:  POST                                                           │
│ URL:     /api/auth/register/                                           │
│ AUTH:    None (Public)                                                 │
│                                                                         │
│ REQUEST:                          RESPONSE (201):                       │
│ {                                 {                                     │
│   "name": "John Doe",              "success": true,                     │
│   "email": "john@...",             "message": "Registration...",       │
│   "mobile": "9876543210",          "user": {                           │
│   "password": "Pass@123",            "id": 1,                          │
│   "password_confirm": "Pass@123"     "email": "john@...",              │
│ }                                    "name": "John Doe",               │
│                                      "role": "customer"                │
│                                    },                                   │
│                                    "otp": "123456"                     │
│                                  }                                      │
│                                                                         │
│ VALIDATION:                                                             │
│  ✓ Email format + uniqueness                                          │
│  ✓ Mobile: 10 digits + uniqueness                                     │
│  ✓ Password: 8+ chars, numbers, special chars                         │
│  ✓ Password confirmation must match                                   │
└─────────────────────────────────────────────────────────────────────────┘
```

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      USER LOGIN API (JWT)                               │
├─────────────────────────────────────────────────────────────────────────┤
│ METHOD:  POST                                                           │
│ URL:     /api/auth/login/                                              │
│ AUTH:    None (Public)                                                 │
│                                                                         │
│ REQUEST:                          RESPONSE (200):                       │
│ {                                 {                                     │
│   "email": "john@example.com",     "success": true,                    │
│   "password": "Pass@123"           "message": "Login successful",       │
│ }                                  "access": "eyJ....[1 hour]",        │
│                                    "refresh": "eyJ....[7 days]",       │
│                                    "user": {                           │
│                                      "id": 1,                          │
│                                      "email": "john@...",              │
│                                      "name": "John Doe",               │
│                                      "role": "customer",               │
│                                      "is_verified": true               │
│                                    }                                    │
│                                  }                                      │
│                                                                         │
│ STORAGE (Frontend):                                                    │
│ localStorage.setItem('access_token', response.data.access)            │
│ localStorage.setItem('refresh_token', response.data.refresh)          │
└─────────────────────────────────────────────────────────────────────────┘
```

```
┌─────────────────────────────────────────────────────────────────────────┐
│                   BIKE SERVICE BOOKING API                              │
├─────────────────────────────────────────────────────────────────────────┤
│ METHOD:  POST                                                           │
│ URL:     /api/service/requests/                                        │
│ AUTH:    Bearer {access_token}                                        │
│                                                                         │
│ REQUEST:                          RESPONSE (201):                       │
│ {                                 {                                     │
│   "vehicle": 1,                    "id": 1,                            │
│   "description": "Engine noise",   "customer": 1,                      │
│   "scheduled_date": "2024-02-15",  "vehicle": 1,                       │
│   "notes": "Check suspension"      "vehicle_details": {...},           │
│ }                                  "description": "Engine noise",       │
│                                    "status": "pending",                │
│                                    "cost": "0.00",                     │
│                                    "date": "2024-01-21T10:30:00Z",   │
│                                    "scheduled_date": "2024-02-15"      │
│                                  }                                      │
│                                                                         │
│ VALIDATIONS:                                                            │
│  ✓ Description: min 10 characters                                     │
│  ✓ Scheduled date: must be in future, max 30 days                    │
│  ✓ Vehicle must exist and be active                                  │
│  ✓ User must be authenticated                                        │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 📋 HTTP Methods & Status Codes

```
METHOD          STATUS      MEANING
─────────────────────────────────────────────────────
GET             200         ✓ Success, data returned
POST            201         ✓ Created, new resource
PATCH           200         ✓ Updated successfully
DELETE          204         ✓ Deleted successfully

400             ✗ Bad request (invalid data)
401             ✗ Unauthorized (no token/invalid)
403             ✗ Forbidden (no permission)
404             ✗ Not found (resource doesn't exist)
500             ✗ Server error
```

---

## 🔐 JWT Token Flow

```
┌─────────────┐         ┌──────────────┐         ┌──────────────┐
│   Client    │         │   Backend    │         │   Database   │
│  (Frontend) │         │   (Django)   │         │   (SQLite)   │
└─────┬───────┘         └──────┬───────┘         └──────┬───────┘
      │                         │                       │
      │ 1. POST /login          │                       │
      ├────────────────────────>│                       │
      │    (email, password)    │                       │
      │                         │ 2. Query User        │
      │                         ├──────────────────────>│
      │                         │ 3. User Data         │
      │                         │<──────────────────────┤
      │                         │                       │
      │                         │ 4. Generate JWT      │
      │                         │ (access + refresh)   │
      │                         │                       │
      │ 5. {access, refresh}    │                       │
      │<────────────────────────┤                       │
      │ 6. Store in localStorage                       │
      │                         │                       │
      │ 7. GET /api/service/    │                       │
      │    Bearer {access}      │                       │
      ├────────────────────────>│                       │
      │                         │ 8. Verify Token     │
      │                         │ (Check signature)    │
      │                         │                       │
      │ 9. Response Data        │                       │
      │<────────────────────────┤                       │
      │                         │                       │
      │ After 1 hour:           │                       │
      │ 10. POST /token/refresh │                       │
      │     {refresh: token}    │                       │
      ├────────────────────────>│                       │
      │                         │ 11. Generate new     │
      │                         │     access token     │
      │                         │                       │
      │ 12. {new access token}  │                       │
      │<────────────────────────┤                       │
      │                         │                       │
```

---

## 🔑 Token Information

```
┌─────────────────────────────────────────┐
│         ACCESS TOKEN                    │
├─────────────────────────────────────────┤
│ ✓ Lifetime: 1 hour                     │
│ ✓ Usage: API requests                  │
│ ✓ Header: Authorization: Bearer {token}│
│ ✓ Storage: localStorage                │
│ ✓ Contains: user_id, role              │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│         REFRESH TOKEN                   │
├─────────────────────────────────────────┤
│ ✓ Lifetime: 7 days                     │
│ ✓ Usage: Get new access token          │
│ ✓ Endpoint: /api/auth/token/refresh/  │
│ ✓ Storage: localStorage                │
│ ✓ On logout: Blacklisted              │
└─────────────────────────────────────────┘
```

---

## 🎫 Service Request Statuses

```
PENDING ──────> IN_PROGRESS ──────> COMPLETED
  │                  │                   │
  │                  └──────────────────→│
  └─────────────────────────────────────>│
                                    │
                              (End State)

Special: CANCELLED (from any state)
```

---

## 📐 User Roles & Permissions

```
┌─────────────────────────────────────────────────────────┐
│ CUSTOMER                                                │
├─────────────────────────────────────────────────────────┤
│ ✓ View own profile                                     │
│ ✓ Create service requests                             │
│ ✓ View own service requests                           │
│ ✓ Cancel own pending requests                         │
│ ✗ Cannot manage other customers' data                │
│ ✗ Cannot access admin endpoints                       │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ ADMIN                                                   │
├─────────────────────────────────────────────────────────┤
│ ✓ View all users                                       │
│ ✓ View all service requests                           │
│ ✓ Update service status                               │
│ ✓ Assign technicians                                  │
│ ✓ Update cost estimates                               │
│ ✓ Manage vehicles                                     │
│ ✓ View analytics & reports                            │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ DEVELOPER                                               │
├─────────────────────────────────────────────────────────┤
│ ✓ All admin privileges                                │
│ ✓ System configuration access                         │
│ ✓ Special security key required for registration      │
└─────────────────────────────────────────────────────────┘
```

---

## 🛠️ API Header Examples

```
Register/Login (No Auth Required):
─────────────────────────────────
Content-Type: application/json

Authenticated Request (With Token):
────────────────────────────────────
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

Refresh Token:
──────────────
Content-Type: application/json
```

---

## 💾 Database Quick Schema

```
USER Table:
  id (PK) | email | name | mobile | role | is_verified | created_at
  
OTP Table:
  id (PK) | user_id (FK) | code | expires_at | is_verified
  
SERVICE_REQUEST Table:
  id (PK) | customer_id (FK) | vehicle_id (FK) | description
  status | cost | date | scheduled_date | assigned_to_id (FK)
```

---

## 🧪 Testing Endpoints (curl)

### 1. Register
```bash
curl -X POST http://localhost:8000/api/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John",
    "email": "john@example.com",
    "mobile": "9876543210",
    "password": "Pass@123",
    "password_confirm": "Pass@123"
  }'
```

### 2. Login
```bash
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "Pass@123"
  }'
```

### 3. Book Service
```bash
curl -X POST http://localhost:8000/api/service/requests/ \
  -H "Authorization: Bearer {access_token}" \
  -H "Content-Type: application/json" \
  -d '{
    "vehicle": 1,
    "description": "Engine noise",
    "scheduled_date": "2024-02-15T10:30:00Z"
  }'
```

---

## ⚠️ Common Errors & Fixes

```
401 Unauthorized
─────────────────
Problem: Token missing or expired
Solution: 
  1. Check Authorization header
  2. Refresh token if expired
  3. Re-login if refresh fails

400 Bad Request
───────────────
Problem: Invalid data provided
Solution:
  1. Check field types
  2. Validate email format
  3. Check password requirements
  4. Verify mobile format (10 digits)

403 Forbidden
─────────────
Problem: User doesn't have permission
Solution:
  1. Check user role
  2. Verify ownership of resource
  3. Use admin token for admin endpoints

404 Not Found
─────────────
Problem: Resource doesn't exist
Solution:
  1. Check resource ID
  2. Verify resource is active
  3. Check user access

500 Server Error
────────────────
Problem: Server error
Solution:
  1. Check Django logs
  2. Verify database connection
  3. Restart server
```

---

## 📊 Documentation File Selection

```
NEED?                           → USE FILE
────────────────────────────────────────────────────
Quick overview                  → API_DOCUMENTATION_SUMMARY.md
5-minute setup                  → API_DOCUMENTATION_SUMMARY.md
Understand architecture         → API_IMPLEMENTATION_GUIDE.md
Project report content          → API_IMPLEMENTATION_GUIDE.md
Copy-paste implementation       → COMPLETE_CODE_SNIPPETS.md
API endpoint details            → API_QUICK_REFERENCE.md
Testing examples (curl)         → API_QUICK_REFERENCE.md
Need help finding something     → README_DOCUMENTATION_INDEX.md
```

---

## 🎯 Implementation Checklist

```
□ Install Django & DRF
□ Create app structure
□ Copy User model
□ Copy serializers
□ Copy views
□ Copy URLs
□ Configure settings
□ Run migrations
□ Test Registration
□ Test Login
□ Test Service Booking
□ Implement frontend
□ Write documentation
□ Deploy to production
```

---

## 📞 Quick Reference URLs

```
LOCAL DEVELOPMENT:  http://localhost:8000/api/

Endpoints:
────────────────────────────────────────
Registration:   POST   /auth/register/
Login:         POST   /auth/login/
Logout:        POST   /auth/logout/
OTP Verify:    POST   /auth/verify-otp/
Token Refresh: POST   /auth/token/refresh/
Profile:       GET    /auth/me/

Service:
────────────────────────────────────────
List:          GET    /service/requests/
Create:        POST   /service/requests/
Details:       GET    /service/requests/{id}/
Update:        PATCH  /service/requests/{id}/
Cancel:        POST   /service/requests/{id}/cancel/
Update Status: POST   /service/requests/{id}/update_status/
My Services:   GET    /service/requests/my_services/
```

---

## 🚀 Ready to Implement?

**Next Steps:**
1. Open **README_DOCUMENTATION_INDEX.md**
2. Choose your path (College Project / Implementation)
3. Follow the recommended reading order
4. Start coding!

**Total Setup Time: ~1 hour**
**Total Learning Time: ~2-3 hours**

---

**BikeHub API - Complete Implementation Guide v1.0**
**Last Updated: January 21, 2026**
