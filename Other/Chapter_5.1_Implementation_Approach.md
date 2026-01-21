# Chapter 5.1: Implementation Approach

## 5.1 Overview

The BikeHub project follows the **Incremental Development Model** to build a comprehensive 2-wheeler sales and maintenance management system. This approach divides the project into manageable increments or modules, where each increment is developed, tested, and integrated progressively. This methodology ensures continuous feedback, early error detection, and systematic project delivery.

The project architecture consists of three main layers:
1. **Frontend Layer** - React.js-based user interface
2. **Backend Layer** - Django REST Framework API server
3. **Database Layer** - SQLite database management
4. **Communication Layer** - RESTful API integration

---

## 5.2 Incremental Development Model

### 5.2.1 Model Definition

The Incremental Development Model is a software development approach where the project is divided into small functional units called **increments**. Each increment is planned, developed, implemented, tested, and deployed independently, and the results are then integrated into the overall system.

### 5.2.2 Increments in BikeHub

The BikeHub project is structured into 5 major increments:

#### **Increment 1: User Authentication & Authorization System**
- **Duration:** Week 1-2
- **Deliverable:** Login, Registration, OTP verification
- **Components:** 
  - JWT token management
  - Role-based access control (Admin, Customer, Developer)
  - Email OTP verification system
- **Testing:** Unit testing for authentication logic

#### **Increment 2: Vehicle Inventory Management**
- **Duration:** Week 3-4
- **Deliverable:** Vehicle CRUD operations, stock management
- **Components:**
  - Vehicle listing and filtering
  - Create, Update, Delete vehicles (Admin only)
  - Stock quantity management
  - Image upload functionality
- **Testing:** API endpoint testing with Postman

#### **Increment 3: Sales Management System**
- **Duration:** Week 5-6
- **Deliverable:** Sales transaction processing
- **Components:**
  - Create purchase orders
  - Sales verification and cancellation
  - Purchase history tracking
  - Invoice generation
- **Testing:** Transaction integrity tests

#### **Increment 4: Service Request Management**
- **Duration:** Week 7-8
- **Deliverable:** Service booking and tracking
- **Components:**
  - Service request creation
  - Status updates
  - Service history management
  - Service cancellation
- **Testing:** End-to-end service workflow testing

#### **Increment 5: Reports & Analytics Dashboard**
- **Duration:** Week 9-10
- **Deliverable:** Admin dashboard with reports
- **Components:**
  - Sales reports and analytics
  - Inventory reports
  - Service reports
  - Dashboard statistics
- **Testing:** UI/UX testing and data visualization verification

### 5.2.3 Advantages of This Approach

1. **Early Feedback:** Each increment is reviewed and tested, allowing stakeholders to provide feedback early
2. **Risk Reduction:** Issues are identified and resolved in each increment rather than at the end
3. **Continuous Delivery:** Working software is delivered after each increment
4. **Flexibility:** Changes can be accommodated in upcoming increments
5. **Resource Optimization:** Team members can work on different increments in parallel

---

## 5.3 Frontend Implementation

### 5.3.1 Technology Stack

| Component | Technology |
|-----------|-------------|
| Framework | React.js 18.x |
| Build Tool | Vite.js |
| Routing | React Router v6 |
| State Management | React Context API |
| Styling | Bootstrap 5 + Custom CSS |
| Animations | Framer Motion |
| HTTP Client | Axios |
| Notifications | React Toastify |
| Icons | Lucide React |

### 5.3.2 Folder Structure

```
Frontend/
├── src/
│   ├── components/
│   │   ├── Layout/
│   │   │   ├── Navbar.jsx
│   │   │   ├── Footer.jsx
│   │   │   └── Layout.jsx
│   │   ├── UI/
│   │   │   ├── Button.jsx
│   │   │   ├── Card.jsx
│   │   │   ├── Loading.jsx
│   │   │   ├── Alert.jsx
│   │   │   └── Notification.jsx
│   │   └── admin/
│   │       └── VehicleModal.jsx
│   ├── contexts/
│   │   └── AuthContext.jsx
│   ├── hooks/
│   │   └── useNotification.js
│   ├── pages/
│   │   ├── Home.jsx
│   │   ├── Vehicles.jsx
│   │   ├── auth/
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── adminRegister.jsx
│   │   │   └── DeveloperRegister.jsx
│   │   ├── customer/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Purchases.jsx
│   │   │   └── Services.jsx
│   │   └── admin/
│   │       ├── Dashboard.jsx
│   │       ├── Vehicles.jsx
│   │       ├── Sales.jsx
│   │       └── Services.jsx
│   ├── services/
│   │   ├── api.js
│   │   ├── authService.js
│   │   ├── vehicleService.js
│   │   ├── salesService.js
│   │   └── serviceService.js
│   ├── config/
│   │   └── api.js
│   ├── App.jsx
│   └── main.jsx
├── package.json
└── vite.config.js
```

### 5.3.3 Key Frontend Features

#### **Component Architecture**
- **Reusable Components:** Button, Card, Loading, Notification, Alert
- **Layout Components:** Navbar, Footer, Layout wrapper with responsive design
- **Page Components:** Organized by feature (auth, customer, admin)
- **Modal Components:** For CRUD operations (VehicleModal)

#### **State Management**
- **AuthContext:** Manages user authentication state, tokens, and user roles
- **Local Component State:** For form data and UI state
- **Custom Hooks:** useNotification for toast notifications

#### **Routing Strategy**
```javascript
- Public Routes: Home, Login, Register, Browse Vehicles
- Protected Routes: Dashboard, Profile, Purchases, Services
- Admin Routes: Manage Vehicles, Sales, Services, Reports
- Developer Routes: Special access with security key verification
```

#### **User Interface Features**
- **Responsive Design:** Mobile-first approach using Bootstrap 5
- **Dark Mode Support:** Custom CSS variables for theming
- **Animations:** Framer Motion for smooth transitions
- **Loading States:** Loading spinners for async operations
- **Error Handling:** Toast notifications for success/error messages

### 5.3.4 Frontend Development Workflow

1. **Component Creation:** Build UI components with props and state
2. **API Integration:** Connect components to backend APIs using Axios
3. **Routing Setup:** Configure React Router for navigation
4. **Form Handling:** Implement form validation and submission
5. **Error Handling:** Display error messages using Notification component
6. **Testing:** Manual testing of UI interactions

---

## 5.4 Backend Implementation

### 5.4.1 Technology Stack

| Component | Technology |
|-----------|------------|
| Framework | Django 4.x |
| REST API | Django REST Framework 3.x |
| Database | SQLite 3 |
| Authentication | JWT (JSON Web Tokens) |
| Email Service | EmailJS |
| Image Upload | Django FileField |
| CORS | Django CORS Headers |

### 5.4.2 Project Structure

```
Backend/
├── config/
│   ├── settings.py
│   ├── urls.py
│   ├── wsgi.py
│   └── asgi.py
├── accounts/
│   ├── models.py
│   ├── views.py
│   ├── serializers.py
│   ├── urls.py
│   ├── permissions.py
│   ├── signals.py
│   └── migrations/
├── inventory/
│   ├── models.py
│   ├── views.py
│   ├── serializers.py
│   ├── urls.py
│   └── migrations/
├── sales/
│   ├── models.py
│   ├── views.py
│   ├── serializers.py
│   ├── urls.py
│   └── migrations/
├── service/
│   ├── models.py
│   ├── views.py
│   ├── serializers.py
│   ├── urls.py
│   └── migrations/
├── reports/
│   ├── views.py
│   ├── urls.py
│   └── serializers.py
├── manage.py
├── requirements.txt
└── db.sqlite3
```

### 5.4.3 Backend Architecture

#### **App Modules**

1. **Accounts App** - User management
   - User registration and login
   - Role management (Admin, Customer, Developer)
   - Token generation and refresh
   - OTP verification
   - User permissions and groups

2. **Inventory App** - Vehicle management
   - Vehicle CRUD operations
   - Stock quantity management
   - Product filtering and search
   - Image upload and storage

3. **Sales App** - Transaction management
   - Purchase order creation
   - Sales verification
   - Order cancellation
   - Purchase history tracking

4. **Service App** - Maintenance management
   - Service request creation
   - Status tracking
   - Service history
   - Request cancellation

5. **Reports App** - Analytics and reporting
   - Sales analytics
   - Inventory reports
   - Service statistics
   - Dashboard data aggregation

#### **Database Models**

**User Model (Custom)**
```
- User ID (UUID Primary Key)
- Email (Unique)
- Password (Hashed)
- Name
- Mobile Number
- Role (Admin, Customer, Developer)
- Created At
- Updated At
- Is Active
```

**Vehicle Model**
```
- Vehicle ID (Auto-increment)
- Brand
- Model
- Price (Decimal)
- Stock Quantity
- Description
- Image
- Created At
- Updated At
- Is Active
```

**Sale Model**
```
- Sale ID (UUID)
- Customer (Foreign Key to User)
- Vehicle (Foreign Key to Vehicle)
- Quantity
- Total Price
- Status (Pending, Completed, Cancelled)
- Created At
- Updated At
```

**Service Request Model**
```
- Request ID (UUID)
- Customer (Foreign Key to User)
- Vehicle (Foreign Key to Vehicle)
- Issue Description
- Status (Pending, In Progress, Completed, Cancelled)
- Cost
- Created At
- Updated At
```

### 5.4.4 API Design Principles

#### **RESTful Endpoints**

**Authentication APIs**
```
POST   /api/auth/register/              - Customer registration
POST   /api/auth/admin/register/        - Admin registration
POST   /api/auth/developer/register/    - Developer registration
POST   /api/auth/login/                 - User login
POST   /api/auth/logout/                - User logout
POST   /api/auth/verify-otp/            - OTP verification
POST   /api/auth/token/refresh/         - Token refresh
GET    /api/auth/me/                    - Get current user profile
```

**Inventory APIs**
```
GET    /api/inventory/vehicles/                    - List all vehicles
GET    /api/inventory/vehicles/{id}/               - Get vehicle details
POST   /api/inventory/vehicles/                    - Create vehicle (Admin)
PATCH  /api/inventory/vehicles/{id}/               - Update vehicle (Admin)
DELETE /api/inventory/vehicles/{id}/               - Delete vehicle (Admin)
POST   /api/inventory/vehicles/{id}/update_stock/  - Update stock (Admin)
```

**Sales APIs**
```
GET    /api/sales/sales/                 - List all sales
POST   /api/sales/sales/                 - Create sale
GET    /api/sales/sales/{id}/            - Get sale details
POST   /api/sales/sales/{id}/verify/     - Verify sale (Admin)
POST   /api/sales/sales/{id}/cancel/     - Cancel sale
GET    /api/sales/sales/my_purchases/    - Customer purchases
```

**Service APIs**
```
GET    /api/service/requests/                - List all requests
POST   /api/service/requests/                - Create request
GET    /api/service/requests/{id}/           - Get request details
POST   /api/service/requests/{id}/update_status/ - Update status (Admin)
POST   /api/service/requests/{id}/cancel/    - Cancel request
GET    /api/service/requests/my_services/    - Customer services
```

**Reports APIs**
```
GET    /api/reports/sales/      - Sales report
GET    /api/reports/inventory/  - Inventory report
GET    /api/reports/service/    - Service report
GET    /api/reports/dashboard/  - Dashboard statistics
```

---

## 5.5 Authentication System

### 5.5.1 JWT Authentication Flow

```
┌─────────────────┐         ┌──────────────────┐         ┌──────────────┐
│   Frontend      │         │   Backend        │         │   Database   │
│   (React)       │         │   (Django REST)  │         │   (SQLite)   │
└────────┬────────┘         └────────┬─────────┘         └──────┬───────┘
         │                           │                          │
         │  1. POST /login           │                          │
         │  (email, password)        │                          │
         ├──────────────────────────>│                          │
         │                           │  2. Query User           │
         │                           ├─────────────────────────>│
         │                           │  3. User Data            │
         │                           │<─────────────────────────┤
         │                           │                          │
         │                           │  4. Verify Password      │
         │                           │  5. Generate JWT Token   │
         │                           │                          │
         │  6. {access, refresh}     │                          │
         │<──────────────────────────┤                          │
         │                           │                          │
         │  7. Store Token (localStorage)                       │
         │                           │                          │
         │  8. GET /api/inventory/   │                          │
         │  Header: Authorization:   │                          │
         │  Bearer {access_token}    │                          │
         ├──────────────────────────>│                          │
         │                           │  9. Verify Token         │
         │                           │                          │
         │  10. Response Data        │                          │
         │<──────────────────────────┤                          │
         │                           │                          │
```

### 5.5.2 Token Management

#### **Access Token**
- **Expiry:** 1 hour
- **Usage:** Included in every API request
- **Storage:** localStorage (Frontend)
- **Format:** JWT with user ID and role claims

#### **Refresh Token**
- **Expiry:** 7 days
- **Usage:** Generate new access token when expired
- **Storage:** localStorage (Frontend)
- **Endpoint:** POST /api/auth/token/refresh/

### 5.5.3 Role-Based Access Control (RBAC)

**Three User Roles:**

1. **Customer**
   - Browse vehicles
   - Create purchase orders
   - View purchase history
   - Book services
   - View service requests

2. **Admin**
   - Manage vehicles (Create, Read, Update, Delete)
   - Manage stock quantities
   - Verify sales transactions
   - Update service statuses
   - View analytics and reports

3. **Developer**
   - Full system access
   - Special security key required for registration
   - Can perform all admin operations

### 5.5.4 Authentication Implementation

**Backend (Django):**
```python
# Custom User Model
- Uses JWT for stateless authentication
- Email verification via OTP
- Token refresh mechanism
- Permission-based view access

# Permissions Classes
- IsAuthenticated: User must be logged in
- IsAdmin: User role must be 'admin'
- IsAdminOrReadOnly: Admin can modify, others read-only
- IsOwnerOrReadOnly: Owner can modify own records
```

**Frontend (React):**
```javascript
// AuthContext provides:
- login(credentials) - User login
- register(formData) - User registration
- logout() - Clear tokens and user data
- refresh() - Auto-refresh expired tokens
- User state management

// Protected Routes
- ProtectedRoute: Wraps authenticated pages
- PublicRoute: Redirects authenticated users to dashboard
- Role-based route restrictions
```

---

## 5.6 Database Design

### 5.6.1 Database Approach

**Choice:** SQLite 3
**Justification:**
- Suitable for development and small-to-medium applications
- Zero configuration required
- Built-in with Django
- Sufficient for project requirements
- Easy to backup and migrate

### 5.6.2 Entity-Relationship Diagram (Conceptual)

```
┌──────────────┐         ┌──────────────┐         ┌──────────────┐
│    User      │         │   Vehicle    │         │    Sale      │
│──────────────│         │──────────────│         │──────────────│
│ PK: id       │         │ PK: id       │         │ PK: id       │
│ email        │         │ brand        │         │ customer_id  │FK
│ name         │         │ model        │◄────────┤ vehicle_id   │FK
│ mobile       │         │ price        │         │ quantity     │
│ role         │         │ stock_qty    │         │ total_price  │
│ is_active    │         │ created_at   │         │ status       │
└────┬─────────┘         └──────────────┘         └──────────────┘
     │
     │1:M
     │
     └────────────────────┐
                          │
                    ┌─────┴──────┐
                    │ ServiceReq  │
                    │─────────────│
                    │ PK: id      │
                    │ customer_id │FK
                    │ vehicle_id  │FK
                    │ status      │
                    │ cost        │
                    │ created_at  │
                    └─────────────┘
```

### 5.6.3 Data Normalization

**Applied Normalization Level:** 3NF (Third Normal Form)

1. **1NF:** All attributes contain atomic values
2. **2NF:** Removal of partial dependencies
3. **3NF:** Removal of transitive dependencies

### 5.6.4 Database Constraints

- **Primary Keys:** Auto-increment for tables, UUID for transactions
- **Foreign Keys:** Maintain referential integrity
- **Unique Constraints:** Email in User model
- **Check Constraints:** Status values must be predefined
- **Not Null:** Essential fields marked as required
- **Default Values:** timestamps auto-set on creation

---

## 5.7 API Communication

### 5.7.1 Communication Protocol

**Technology:** REST API over HTTP/HTTPS

### 5.7.2 Request/Response Format

#### **Request Format**

**Headers:**
```http
Content-Type: application/json
Authorization: Bearer {access_token}
```

**Body (Example - Create Vehicle):**
```json
{
  "brand": "Honda",
  "model": "CB350",
  "price": "350000.00",
  "stock_qty": 10,
  "description": "Premium sports bike",
  "image": <FormData>
}
```

#### **Response Format**

**Success Response (200 OK):**
```json
{
  "id": 1,
  "brand": "Honda",
  "model": "CB350",
  "price": "350000.00",
  "stock_qty": 10,
  "description": "Premium sports bike",
  "image": "http://localhost:8000/media/vehicles/honda_cb350.jpg",
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T10:30:00Z"
}
```

**Error Response (400 Bad Request):**
```json
{
  "error": "Invalid input data",
  "details": {
    "price": ["Ensure this field is greater than 0"]
  }
}
```

**Unauthorized Response (401 Unauthorized):**
```json
{
  "detail": "Authentication credentials were not provided."
}
```

**Forbidden Response (403 Forbidden):**
```json
{
  "detail": "You do not have permission to perform this action."
}
```

### 5.7.3 API Client Implementation (Frontend)

**Axios Configuration:**
```javascript
// Centralized API instance
const api = axios.create({
  baseURL: 'http://localhost:8000/api'
});

// Request Interceptor
- Adds Authorization header with JWT token
- Sets Content-Type header

// Response Interceptor
- Handles 401 responses (token expired)
- Automatically refreshes token
- Redirects to login on failure
- Standardizes error handling
```

**Service Layer:**
```javascript
// Separated service files for each feature
- authService.js    - Authentication APIs
- vehicleService.js - Vehicle CRUD APIs
- salesService.js   - Sales transaction APIs
- serviceService.js - Service request APIs
- reportService.js  - Analytics APIs

// Each service exports methods like:
- getAll(params)
- getById(id)
- create(data)
- update(id, data)
- delete(id)
```

### 5.7.4 Error Handling Strategy

**Frontend Error Handling:**
```
1. API Call ─→ Error Response
2. Check Error Status Code
   - 400/404: Show user-friendly error message
   - 401: Refresh token and retry
   - 403: Show permission denied message
   - 500: Show server error message
3. Display notification using Toast
4. Log error to console for debugging
```

**Backend Error Handling:**
```
1. Validate Request Data
2. Check User Permissions
3. Execute Business Logic
4. Handle Database Errors
5. Return Appropriate HTTP Status Code
6. Include Error Details in Response
```

### 5.7.5 Data Validation

**Frontend Validation:**
- Email format validation
- Password strength requirements
- Numeric field validation
- Required field validation
- File upload type and size validation

**Backend Validation:**
- Django Model field validators
- Serializer field validation
- Custom validation methods
- Database constraint validation

---

## 5.8 Development Workflow

### 5.8.1 Development Cycle per Increment

```
1. PLANNING
   ├─ Define requirements
   ├─ Design database schema
   └─ Plan API endpoints

2. DEVELOPMENT
   ├─ Backend API development
   ├─ Frontend component development
   ├─ Database migration
   └─ Integration testing

3. TESTING
   ├─ Unit testing
   ├─ API testing (Postman)
   ├─ UI/UX testing
   └─ Integration testing

4. DEPLOYMENT
   ├─ Code review
   ├─ Bug fixes
   ├─ Deployment to testing environment
   └─ User acceptance testing

5. REVIEW & FEEDBACK
   ├─ Stakeholder feedback
   ├─ Performance analysis
   └─ Plan next increment
```

### 5.8.2 Coding Standards

**Python (Backend):**
- PEP 8 style guide
- Meaningful variable names
- Comments for complex logic
- Docstrings for functions and classes

**JavaScript (Frontend):**
- ES6+ syntax
- camelCase for variables and functions
- PascalCase for components
- JSDoc comments for functions

### 5.8.3 Version Control

- **Git Repository:** Local and remote backup
- **Branch Strategy:** main, develop, feature branches
- **Commit Messages:** Descriptive and meaningful
- **Pull Requests:** Code review before merge

---

## 5.9 Technology Integration Points

### 5.9.1 Frontend to Backend Communication

```javascript
// Example: Login Flow
const login = async (email, password) => {
  try {
    // 1. Make API request
    const response = await api.post('/auth/login/', {
      email,
      password
    });
    
    // 2. Store tokens
    localStorage.setItem('access_token', response.data.access);
    localStorage.setItem('refresh_token', response.data.refresh);
    
    // 3. Update auth state
    setUser(response.data.user);
    
    // 4. Show success message
    showNotification('success', 'Login successful');
    
    // 5. Redirect to dashboard
    navigate('/dashboard');
  } catch (error) {
    // Error handling
    showNotification('error', error.response.data.error);
  }
};
```

### 5.9.2 Database Integration

```python
# Example: Create Sale
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_sale(request):
    serializer = SaleSerializer(data=request.data)
    
    if serializer.is_valid():
        # 1. Validate vehicle stock
        vehicle = Vehicle.objects.get(id=request.data['vehicle_id'])
        
        if vehicle.stock_qty < request.data['quantity']:
            return Response(
                {'error': 'Insufficient stock'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # 2. Create sale record
        sale = serializer.save(customer=request.user)
        
        # 3. Update vehicle stock
        vehicle.reduce_stock(request.data['quantity'])
        
        # 4. Return response
        return Response(
            SaleSerializer(sale).data,
            status=status.HTTP_201_CREATED
        )
```

---

## 5.10 Summary

The BikeHub project uses an **Incremental Development Model** to systematically build a complete 2-wheeler sales and maintenance system. The **React.js frontend** provides an intuitive user interface with modern animations and responsive design. The **Django REST Framework backend** implements robust APIs with proper authentication, authorization, and data validation. The **SQLite database** maintains data integrity through proper normalization and constraints. The **JWT-based authentication** ensures secure communication between frontend and backend. This structured approach enables continuous integration, early feedback, and risk mitigation throughout the development lifecycle.

---

## References

1. Sommerville, I. (2015). *Software Engineering* (10th ed.). Pearson.
2. Django REST Framework Documentation. https://www.django-rest-framework.org/
3. React.js Official Documentation. https://react.dev/
4. JWT Introduction. https://tools.ietf.org/html/rfc7519
5. RESTful API Design Best Practices. https://restfulapi.net/
