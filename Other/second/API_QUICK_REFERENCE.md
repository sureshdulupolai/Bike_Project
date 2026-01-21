# BikeHub API - Quick Reference

## 1. User Registration API

### Endpoint
```
POST /api/auth/register/
```

### Request
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "mobile": "9876543210",
  "password": "SecurePass@123",
  "password_confirm": "SecurePass@123"
}
```

### Response (201 Created)
```json
{
  "success": true,
  "message": "Registration successful. OTP sent to email.",
  "user": {
    "id": 1,
    "email": "john@example.com",
    "name": "John Doe",
    "mobile": "9876543210",
    "role": "customer"
  },
  "otp": "123456"
}
```

### Validation Rules
- **Name:** Minimum 2 characters
- **Email:** Valid email format, must be unique
- **Mobile:** 10 digits, must be unique
- **Password:** Minimum 8 characters, must contain numbers and special characters
- **Password Confirm:** Must match password

### Error Responses

**400 Bad Request - Invalid Data**
```json
{
  "success": false,
  "error": "Email already registered."
}
```

**400 Bad Request - Duplicate User**
```json
{
  "success": false,
  "error": "Email or mobile already registered."
}
```

---

## 2. User Login API

### Endpoint
```
POST /api/auth/login/
```

### Request
```json
{
  "email": "john@example.com",
  "password": "SecurePass@123"
}
```

### Response (200 OK)
```json
{
  "success": true,
  "message": "Login successful",
  "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "john@example.com",
    "name": "John Doe",
    "mobile": "9876543210",
    "role": "customer",
    "is_verified": true
  }
}
```

### Token Storage (Frontend)
```javascript
// Store tokens in localStorage
localStorage.setItem('access_token', response.data.access);
localStorage.setItem('refresh_token', response.data.refresh);
```

### Using Access Token (API Requests)
```
GET /api/service/requests/
Authorization: Bearer {access_token}
```

### Error Responses

**401 Unauthorized - Invalid Credentials**
```json
{
  "success": false,
  "error": "Invalid email or password."
}
```

**401 Unauthorized - Not Verified**
```json
{
  "success": false,
  "error": "Please verify your email first using OTP."
}
```

**401 Unauthorized - Inactive User**
```json
{
  "success": false,
  "error": "Your account has been deactivated."
}
```

### Token Refresh
When access token expires (after 1 hour):
```
POST /api/auth/token/refresh/

Body:
{
  "refresh": "refresh_token_here"
}

Response (200):
{
  "access": "new_access_token_here"
}
```

### Logout
```
POST /api/auth/logout/
Authorization: Bearer {access_token}

Body:
{
  "refresh": "refresh_token_here"
}

Response (200):
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

## 3. Service Booking API

### Create Service Request

#### Endpoint
```
POST /api/service/requests/
Authorization: Bearer {access_token}
```

#### Request
```json
{
  "vehicle": 1,
  "description": "Engine making strange noise, needs urgent attention",
  "scheduled_date": "2024-02-15T10:30:00Z",
  "notes": "Please check suspension as well"
}
```

#### Response (201 Created)
```json
{
  "id": 1,
  "customer": 1,
  "customer_details": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "mobile": "9876543210"
  },
  "vehicle": 1,
  "vehicle_details": {
    "id": 1,
    "brand": "Honda",
    "model": "CB350",
    "price": "350000.00",
    "stock_qty": 10
  },
  "description": "Engine making strange noise, needs urgent attention",
  "status": "pending",
  "cost": "0.00",
  "date": "2024-01-21T10:30:00Z",
  "scheduled_date": "2024-02-15T10:30:00Z",
  "completed_date": null,
  "assigned_to": null,
  "assigned_to_details": null,
  "notes": "Please check suspension as well"
}
```

### Get Service Request Details

#### Endpoint
```
GET /api/service/requests/{id}/
Authorization: Bearer {access_token}
```

#### Response (200 OK)
```json
{
  "id": 1,
  "customer": 1,
  "customer_details": {...},
  "vehicle": 1,
  "vehicle_details": {...},
  "description": "Engine making strange noise",
  "status": "in_progress",
  "cost": "2500.00",
  "date": "2024-01-21T10:30:00Z",
  "scheduled_date": "2024-02-15T10:30:00Z",
  "completed_date": null,
  "assigned_to": 2,
  "assigned_to_details": {
    "id": 2,
    "name": "Admin User",
    "email": "admin@example.com"
  },
  "notes": "Checking engine and carburetor"
}
```

### List My Service Requests

#### Endpoint
```
GET /api/service/requests/my_services/
Authorization: Bearer {access_token}
```

#### Response (200 OK)
```json
[
  {
    "id": 1,
    "customer": 1,
    "vehicle": 1,
    "description": "Engine issue",
    "status": "pending",
    "cost": "0.00",
    "date": "2024-01-21T10:30:00Z",
    "scheduled_date": "2024-02-15T10:30:00Z"
  },
  {
    "id": 2,
    "customer": 1,
    "vehicle": 2,
    "description": "Brake pad replacement",
    "status": "completed",
    "cost": "1500.00",
    "date": "2024-01-15T14:20:00Z",
    "completed_date": "2024-01-16T16:00:00Z"
  }
]
```

### Cancel Service Request

#### Endpoint
```
POST /api/service/requests/{id}/cancel/
Authorization: Bearer {access_token}
```

#### Response (200 OK)
```json
{
  "success": true,
  "message": "Service request cancelled successfully"
}
```

#### Error Response (400 Bad Request)
```json
{
  "error": "Cannot cancel completed service request"
}
```

### Update Service Status (Admin Only)

#### Endpoint
```
POST /api/service/requests/{id}/update_status/
Authorization: Bearer {admin_access_token}
```

#### Request
```json
{
  "status": "in_progress",
  "cost": "2500.00",
  "notes": "Checking engine and carburetor"
}
```

#### Valid Status Values
- `pending` - Waiting to be assigned
- `in_progress` - Technician is working
- `completed` - Service finished
- `cancelled` - Service cancelled

#### Response (200 OK)
```json
{
  "id": 1,
  "status": "in_progress",
  "cost": "2500.00",
  "assigned_to": 2,
  "notes": "Checking engine and carburetor",
  ...
}
```

---

## 4. Response Status Codes

| Code | Meaning | Example |
|------|---------|---------|
| 200 | OK - Request successful | Login, Get, Update |
| 201 | Created - Resource created | Registration, Create booking |
| 400 | Bad Request - Invalid data | Missing required field |
| 401 | Unauthorized - Auth required | No token provided |
| 403 | Forbidden - Permission denied | User trying to access admin endpoint |
| 404 | Not Found - Resource doesn't exist | Invalid service request ID |
| 500 | Server Error | Database error |

---

## 5. Common Implementation Patterns

### Frontend - Login & Store Tokens
```javascript
const login = async (email, password) => {
  try {
    const response = await api.post('/auth/login/', {
      email,
      password
    });
    
    // Store tokens
    localStorage.setItem('access_token', response.data.access);
    localStorage.setItem('refresh_token', response.data.refresh);
    
    // Store user data
    localStorage.setItem('user', JSON.stringify(response.data.user));
    
    // Redirect to dashboard
    navigate('/dashboard');
  } catch (error) {
    showNotification('error', error.response?.data?.error);
  }
};
```

### Frontend - Make Authenticated Request
```javascript
const bookService = async (serviceData) => {
  try {
    const token = localStorage.getItem('access_token');
    
    const response = await api.post('/service/requests/', serviceData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    showNotification('success', 'Service booked successfully!');
    return response.data;
  } catch (error) {
    showNotification('error', error.response?.data?.error);
  }
};
```

### Frontend - Auto Refresh Token
```javascript
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      const refreshToken = localStorage.getItem('refresh_token');
      const response = await api.post('/auth/token/refresh/', {
        refresh: refreshToken
      });
      
      localStorage.setItem('access_token', response.data.access);
      originalRequest.headers.Authorization = `Bearer ${response.data.access}`;
      
      return api(originalRequest);
    }
    
    return Promise.reject(error);
  }
);
```

---

## 6. Error Handling Checklist

✅ Validate user input on frontend before sending  
✅ Display user-friendly error messages  
✅ Handle network errors gracefully  
✅ Implement token refresh for expired tokens  
✅ Log errors in development mode  
✅ Redirect to login on 401 Unauthorized  
✅ Show permission error for 403 Forbidden  
✅ Handle server errors with generic message  

---

## 7. Security Best Practices

🔒 Never store passwords in localStorage  
🔒 Use HTTPS in production  
🔒 Set secure cookie flags (HTTPOnly, Secure, SameSite)  
🔒 Validate all inputs on backend  
🔒 Implement rate limiting on login endpoint  
🔒 Use strong password requirements  
🔒 Implement CORS properly  
🔒 Rotate refresh tokens periodically  
🔒 Blacklist tokens on logout  
🔒 Never expose sensitive data in responses  

---

## 8. Database Schema for Service Booking

```sql
-- Service Request Table
CREATE TABLE service_serviceRequest (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    customer_id INT NOT NULL FOREIGN KEY,
    vehicle_id INT NOT NULL FOREIGN KEY,
    description TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    cost DECIMAL(10, 2) DEFAULT 0,
    date DATETIME AUTO_SET,
    scheduled_date DATETIME,
    completed_date DATETIME NULL,
    assigned_to_id INT NULL FOREIGN KEY,
    notes TEXT,
    FOREIGN KEY (customer_id) REFERENCES accounts_user(id),
    FOREIGN KEY (vehicle_id) REFERENCES inventory_vehicle(id),
    FOREIGN KEY (assigned_to_id) REFERENCES accounts_user(id)
);
```

---

## References

- Django REST Framework: https://www.django-rest-framework.org/
- Simple JWT: https://django-rest-framework-simplejwt.readthedocs.io/
- REST API Best Practices: https://restfulapi.net/
- HTTP Status Codes: https://httpwg.org/specs/rfc7231.html
