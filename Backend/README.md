# 2 Wheeler Sales Management and Maintenance System

A production-ready Django REST Framework backend for managing 2-wheeler sales, inventory, and maintenance services.

## Features

- **User Authentication**: JWT-based authentication with email/mobile registration and OTP verification
- **Role-Based Access Control**: Admin and Customer roles with appropriate permissions
- **Inventory Management**: Complete CRUD operations for vehicle inventory
- **Sales Management**: Purchase vehicles, verify sales, and track purchase history
- **Service Management**: Book services, track service requests, and manage service status
- **Reporting**: Comprehensive reports for sales, inventory, and services
- **Security**: JWT tokens, permissions, throttling, and input validation

## Tech Stack

- Python 3.11+
- Django 4.2.7
- Django REST Framework 3.14.0
- SimpleJWT for authentication
- PostgreSQL (default) / SQLite (fallback)
- django-cors-headers
- django-filter

## Project Structure

```
bike/
├── config/              # Django project settings
├── accounts/           # User authentication and management
├── inventory/          # Vehicle inventory management
├── sales/              # Sales transactions
├── service/            # Service requests
├── reports/            # Reporting APIs
├── manage.py
└── requirements.txt
```

## Installation

1. **Clone the repository**
```bash
cd bike
```

2. **Create virtual environment**
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. **Install dependencies**
```bash
pip install -r requirements.txt
```

4. **Configure database**

   For PostgreSQL:
   ```bash
   # Set environment variables or update config/settings.py
   export DB_NAME=bike_sales_db
   export DB_USER=postgres
   export DB_PASSWORD=postgres
   export DB_HOST=localhost
   export DB_PORT=5432
   ```

   For SQLite (development):
   ```bash
   export USE_SQLITE=True
   ```

5. **Run migrations**
```bash
python manage.py makemigrations
python manage.py migrate
```

6. **Create superuser**
```bash
python manage.py createsuperuser
```

7. **Run development server**
```bash
python manage.py runserver
```

## API Documentation

### Base URL
```
http://localhost:8000/api/
```

### Authentication

All endpoints except registration, login, and public vehicle listing require JWT authentication.

**Header Format:**
```
Authorization: Bearer <access_token>
```

---

## API Endpoints

### Authentication (`/api/auth/`)

#### 1. Register User
```
POST /api/auth/register/
```
**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "mobile": "9876543210",
  "password": "SecurePassword123",
  "password_confirm": "SecurePassword123"
}
```
**Response:** 201 Created
```json
{
  "message": "User registered successfully. Please verify your email with OTP.",
  "user": {...},
  "otp": "123456"
}
```

#### 2. Login
```
POST /api/auth/login/
```
**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "SecurePassword123"
}
```
**Response:** 200 OK
```json
{
  "message": "Login successful",
  "user": {...},
  "tokens": {
    "refresh": "...",
    "access": "..."
  }
}
```

#### 3. Refresh Token
```
POST /api/auth/token/refresh/
```
**Request Body:**
```json
{
  "refresh": "<refresh_token>"
}
```

#### 4. Verify OTP
```
POST /api/auth/verify-otp/
```
**Request Body:**
```json
{
  "email": "john@example.com",
  "otp_code": "123456"
}
```

#### 5. Logout
```
POST /api/auth/logout/
```
**Headers:** Authorization required
**Request Body:**
```json
{
  "refresh_token": "<refresh_token>"
}
```

#### 6. Get Current User Profile
```
GET /api/auth/me/
```
**Headers:** Authorization required

#### 7. Update Current User Profile
```
PUT /api/auth/me/
PATCH /api/auth/me/
```
**Headers:** Authorization required

---

### Inventory (`/api/inventory/`)

#### 1. List Vehicles (Public)
```
GET /api/inventory/vehicles/
```
**Query Parameters:**
- `brand`: Filter by brand
- `is_active`: Filter by active status
- `search`: Search in brand, model, description
- `ordering`: Order by price, created_at, stock_qty
- `page`: Page number

#### 2. Get Vehicle Details (Public)
```
GET /api/inventory/vehicles/{id}/
```

#### 3. Create Vehicle (Admin Only)
```
POST /api/inventory/vehicles/
```
**Headers:** Authorization required (Admin)
**Request Body:**
```json
{
  "brand": "Honda",
  "model": "Activa 6G",
  "price": "75000.00",
  "stock_qty": 50,
  "description": "Latest model with advanced features",
  "is_active": true
}
```

#### 4. Update Vehicle (Admin Only)
```
PUT /api/inventory/vehicles/{id}/
PATCH /api/inventory/vehicles/{id}/
```

#### 5. Delete Vehicle (Admin Only - Soft Delete)
```
DELETE /api/inventory/vehicles/{id}/
```

#### 6. Update Stock (Admin Only)
```
POST /api/inventory/vehicles/{id}/update_stock/
```
**Request Body:**
```json
{
  "quantity": 10,
  "action": "add"  // or "reduce"
}
```

---

### Sales (`/api/sales/`)

#### 1. List Sales
```
GET /api/sales/sales/
```
- **Admin**: Sees all sales
- **Customer**: Sees only own sales

**Query Parameters:**
- `status`: pending, verified, cancelled
- `vehicle`: Filter by vehicle ID
- `customer`: Filter by customer ID (Admin only)
- `ordering`: Order by date, amount

#### 2. Get Sale Details
```
GET /api/sales/sales/{id}/
```

#### 3. Purchase Vehicle
```
POST /api/sales/sales/
```
**Headers:** Authorization required (Customer)
**Request Body:**
```json
{
  "vehicle": 1,
  "quantity": 1,
  "notes": "Optional notes"
}
```

#### 4. Verify Sale (Admin Only)
```
PATCH /api/sales/sales/{id}/verify/
```
**Headers:** Authorization required (Admin)
- Reduces stock automatically

#### 5. Cancel Sale
```
PATCH /api/sales/sales/{id}/cancel/
```
- **Customer**: Can cancel own pending sales
- **Admin**: Can cancel any sale

#### 6. My Purchases (Customer Only)
```
GET /api/sales/sales/my_purchases/
```

---

### Service (`/api/service/`)

#### 1. List Service Requests
```
GET /api/service/requests/
```
- **Admin**: Sees all requests
- **Customer**: Sees only own requests

**Query Parameters:**
- `status`: pending, in_progress, completed, cancelled
- `vehicle`: Filter by vehicle ID
- `customer`: Filter by customer ID (Admin only)

#### 2. Get Service Request Details
```
GET /api/service/requests/{id}/
```

#### 3. Book Service
```
POST /api/service/requests/
```
**Headers:** Authorization required (Customer)
**Request Body:**
```json
{
  "vehicle": 1,
  "description": "Regular maintenance service",
  "scheduled_date": "2024-01-15T10:00:00Z",
  "notes": "Optional notes"
}
```

#### 4. Update Service Request (Admin Only)
```
PUT /api/service/requests/{id}/
PATCH /api/service/requests/{id}/
```

#### 5. Update Service Status (Admin Only)
```
PATCH /api/service/requests/{id}/update_status/
```
**Request Body:**
```json
{
  "status": "in_progress",
  "cost": "500.00",
  "notes": "Service started"
}
```

#### 6. Cancel Service Request (Customer)
```
PATCH /api/service/requests/{id}/cancel/
```
- Customers can cancel only pending requests

#### 7. My Services (Customer Only)
```
GET /api/service/requests/my_services/
```

---

### Reports (`/api/reports/`)

All report endpoints require Admin authentication.

#### 1. Sales Report
```
GET /api/reports/sales/
```
**Query Parameters:**
- `start_date`: YYYY-MM-DD
- `end_date`: YYYY-MM-DD
- `status`: Filter by sale status

**Response:**
```json
{
  "summary": {
    "total_sales": 100,
    "verified_sales": 85,
    "total_revenue": 8500000.00,
    ...
  },
  "top_vehicles": [...],
  "sales_by_status": [...]
}
```

#### 2. Inventory Report
```
GET /api/reports/inventory/
```
**Query Parameters:**
- `low_stock`: Threshold for low stock (default: 10)
- `brand`: Filter by brand

#### 3. Service Report
```
GET /api/reports/service/
```
**Query Parameters:**
- `start_date`: YYYY-MM-DD
- `end_date`: YYYY-MM-DD
- `status`: Filter by service status

#### 4. Dashboard Summary
```
GET /api/reports/dashboard/
```
Returns key metrics for the last 30 days.

---

## Permissions

### Admin Permissions
- Full CRUD on vehicles
- Verify/cancel sales
- Update service requests
- View all reports
- Manage users

### Customer Permissions
- View active vehicles
- Purchase vehicles
- View own purchase history
- Book services
- View own service history
- Cancel own pending sales/services

---

## Environment Variables

Create a `.env` file or set environment variables:

```bash
SECRET_KEY=your-secret-key-here
DEBUG=True
DB_NAME=bike_sales_db
DB_USER=postgres
DB_PASSWORD=postgres
DB_HOST=localhost
DB_PORT=5432
USE_SQLITE=False  # Set to True for SQLite
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
```

---

## Testing

Run tests:
```bash
python manage.py test
```

---

## Production Deployment

1. Set `DEBUG=False` in settings
2. Configure proper `ALLOWED_HOSTS`
3. Set secure `SECRET_KEY`
4. Use PostgreSQL database
5. Configure proper CORS origins
6. Set up static file serving
7. Configure email backend for OTP
8. Use environment variables for sensitive data
9. Enable HTTPS
10. Set up proper logging

---

## License

This project is licensed under the MIT License.
