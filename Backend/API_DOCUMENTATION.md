# API Documentation

## Base URL
```
http://localhost:8000/api/
```

## Authentication

Most endpoints require JWT authentication. Include the access token in the Authorization header:
```
Authorization: Bearer <access_token>
```

---

## Endpoints Summary

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register/` | Register new user | No |
| POST | `/api/auth/login/` | Login and get tokens | No |
| POST | `/api/auth/token/refresh/` | Refresh access token | No |
| POST | `/api/auth/verify-otp/` | Verify email OTP | No |
| POST | `/api/auth/logout/` | Logout user | Yes |
| GET | `/api/auth/me/` | Get current user profile | Yes |
| PUT/PATCH | `/api/auth/me/` | Update current user profile | Yes |
| GET | `/api/auth/users/` | List all users (Admin) | Yes (Admin) |
| GET | `/api/auth/users/{id}/` | Get user details (Admin) | Yes (Admin) |

### Inventory Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/inventory/vehicles/` | List vehicles | No |
| GET | `/api/inventory/vehicles/{id}/` | Get vehicle details | No |
| POST | `/api/inventory/vehicles/` | Create vehicle | Yes (Admin) |
| PUT/PATCH | `/api/inventory/vehicles/{id}/` | Update vehicle | Yes (Admin) |
| DELETE | `/api/inventory/vehicles/{id}/` | Delete vehicle | Yes (Admin) |
| POST | `/api/inventory/vehicles/{id}/update_stock/` | Update stock | Yes (Admin) |

### Sales Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/sales/sales/` | List sales | Yes |
| GET | `/api/sales/sales/{id}/` | Get sale details | Yes |
| POST | `/api/sales/sales/` | Purchase vehicle | Yes (Customer) |
| PATCH | `/api/sales/sales/{id}/verify/` | Verify sale | Yes (Admin) |
| PATCH | `/api/sales/sales/{id}/cancel/` | Cancel sale | Yes |
| GET | `/api/sales/sales/my_purchases/` | My purchases | Yes (Customer) |

### Service Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/service/requests/` | List service requests | Yes |
| GET | `/api/service/requests/{id}/` | Get service request details | Yes |
| POST | `/api/service/requests/` | Book service | Yes (Customer) |
| PUT/PATCH | `/api/service/requests/{id}/` | Update service request | Yes (Admin) |
| PATCH | `/api/service/requests/{id}/update_status/` | Update status | Yes (Admin) |
| PATCH | `/api/service/requests/{id}/cancel/` | Cancel service | Yes (Customer) |
| GET | `/api/service/requests/my_services/` | My services | Yes (Customer) |

### Reports Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/reports/sales/` | Sales report | Yes (Admin) |
| GET | `/api/reports/inventory/` | Inventory report | Yes (Admin) |
| GET | `/api/reports/service/` | Service report | Yes (Admin) |
| GET | `/api/reports/dashboard/` | Dashboard summary | Yes (Admin) |

---

## Request/Response Examples

### Register User

**Request:**
```bash
POST /api/auth/register/
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "mobile": "9876543210",
  "password": "SecurePassword123",
  "password_confirm": "SecurePassword123"
}
```

**Response:** `201 Created`
```json
{
  "message": "User registered successfully. Please verify your email with OTP.",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "mobile": "9876543210",
    "role": "customer",
    "is_active": true,
    "is_verified": false,
    "created_at": "2024-01-01T10:00:00Z"
  },
  "otp": "123456"
}
```

### Login

**Request:**
```bash
POST /api/auth/login/
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePassword123"
}
```

**Response:** `200 OK`
```json
{
  "message": "Login successful",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "mobile": "9876543210",
    "role": "customer",
    "is_active": true,
    "is_verified": true,
    "created_at": "2024-01-01T10:00:00Z"
  },
  "tokens": {
    "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc...",
    "access": "eyJ0eXAiOiJKV1QiLCJhbGc..."
  }
}
```

### Purchase Vehicle

**Request:**
```bash
POST /api/sales/sales/
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "vehicle": 1,
  "quantity": 1,
  "notes": "Please deliver to my address"
}
```

**Response:** `201 Created`
```json
{
  "message": "Vehicle purchase request created successfully. Waiting for admin verification.",
  "sale": {
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
      "model": "Activa 6G",
      "price": "75000.00",
      "stock_qty": 49,
      "is_in_stock": true
    },
    "amount": "75000.00",
    "quantity": 1,
    "status": "pending",
    "date": "2024-01-01T10:00:00Z",
    "notes": "Please deliver to my address"
  }
}
```

### Book Service

**Request:**
```bash
POST /api/service/requests/
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "vehicle": 1,
  "description": "Regular maintenance service - oil change and brake check",
  "scheduled_date": "2024-01-15T10:00:00Z",
  "notes": "Please call before coming"
}
```

**Response:** `201 Created`
```json
{
  "message": "Service request created successfully.",
  "service_request": {
    "id": 1,
    "customer": 1,
    "vehicle": 1,
    "description": "Regular maintenance service - oil change and brake check",
    "status": "pending",
    "cost": "0.00",
    "date": "2024-01-01T10:00:00Z",
    "scheduled_date": "2024-01-15T10:00:00Z",
    "notes": "Please call before coming"
  }
}
```

### Sales Report

**Request:**
```bash
GET /api/reports/sales/?start_date=2024-01-01&end_date=2024-01-31&status=verified
Authorization: Bearer <admin_access_token>
```

**Response:** `200 OK`
```json
{
  "period": {
    "start_date": "2024-01-01",
    "end_date": "2024-01-31"
  },
  "summary": {
    "total_sales": 100,
    "verified_sales": 85,
    "pending_sales": 10,
    "cancelled_sales": 5,
    "total_revenue": 6375000.00,
    "total_quantity_sold": 85,
    "average_sale_amount": 75000.00
  },
  "top_vehicles": [
    {
      "vehicle__brand": "Honda",
      "vehicle__model": "Activa 6G",
      "total_sold": 30,
      "total_revenue": 2250000.00
    }
  ],
  "sales_by_status": [
    {
      "status": "verified",
      "count": 85,
      "total_amount": 6375000.00
    }
  ]
}
```

---

## Error Responses

### Validation Error (400 Bad Request)
```json
{
  "error": "Invalid input",
  "field_name": ["Error message"]
}
```

### Authentication Error (401 Unauthorized)
```json
{
  "detail": "Authentication credentials were not provided."
}
```

### Permission Error (403 Forbidden)
```json
{
  "error": "You do not have permission to perform this action."
}
```

### Not Found (404 Not Found)
```json
{
  "detail": "Not found."
}
```

---

## Pagination

List endpoints support pagination:
- `page`: Page number (default: 1)
- `page_size`: Items per page (default: 20)

**Response Format:**
```json
{
  "count": 100,
  "next": "http://localhost:8000/api/endpoint/?page=2",
  "previous": null,
  "results": [...]
}
```

---

## Filtering and Searching

### Inventory Vehicles
- `brand`: Filter by brand
- `is_active`: Filter by active status
- `search`: Search in brand, model, description
- `ordering`: Order by `price`, `created_at`, `stock_qty` (prefix with `-` for descending)

### Sales
- `status`: Filter by status (pending, verified, cancelled)
- `vehicle`: Filter by vehicle ID
- `customer`: Filter by customer ID (Admin only)
- `ordering`: Order by `date`, `amount`

### Service Requests
- `status`: Filter by status (pending, in_progress, completed, cancelled)
- `vehicle`: Filter by vehicle ID
- `customer`: Filter by customer ID (Admin only)
- `search`: Search in description, notes
- `ordering`: Order by `date`, `cost`, `scheduled_date`

---

## Rate Limiting

- Anonymous users: 100 requests/hour
- Authenticated users: 1000 requests/hour

Rate limit headers are included in responses:
- `X-RateLimit-Limit`: Maximum requests allowed
- `X-RateLimit-Remaining`: Remaining requests
- `X-RateLimit-Reset`: Time when limit resets
