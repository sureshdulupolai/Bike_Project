# Chapter 5.3: Testing Approaches

## Introduction

Testing is a critical phase in software development that ensures the application meets specified requirements and functions correctly across different scenarios. BikeHub, being a full-stack web application, requires comprehensive testing strategies covering both backend (Django REST API) and frontend (React UI) components.

This chapter outlines the testing approaches used in BikeHub, including unit testing, integration testing, and beta testing. Each approach targets different aspects of the application to ensure reliability, performance, and user satisfaction.

---

## 1. Unit Testing

### 1.1 Definition and Purpose

Unit testing involves testing individual components (functions, methods, classes) in isolation. The goal is to verify that each unit of code performs its intended function correctly.

**Objectives:**
- Validate business logic correctness
- Catch bugs early in development
- Facilitate code refactoring with confidence
- Document expected behavior through tests

### 1.2 Backend Unit Testing (Django REST Framework)

#### Test Framework: Django TestCase

Django provides built-in testing framework (`django.test.TestCase`) extending Python's `unittest`.

#### 1.2.1 API Serializer Tests

**Purpose:** Validate data serialization and validation logic.

**Example Test Cases:**

```python
# Conceptual test structure (NOT production code)
class UserRegistrationSerializerTests(TestCase):
    
    def test_valid_registration_data(self):
        # Arrange
        data = {
            "name": "John Doe",
            "email": "john@example.com",
            "mobile": "9876543210",
            "password": "Pass@123!",
            "password_confirm": "Pass@123!"
        }
        
        # Act
        serializer = UserRegistrationSerializer(data=data)
        
        # Assert
        self.assertTrue(serializer.is_valid())
        self.assertEqual(len(serializer.errors), 0)
    
    def test_invalid_email_format(self):
        data = { ..., "email": "invalid-email" }
        serializer = UserRegistrationSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn("email", serializer.errors)
    
    def test_password_mismatch(self):
        data = {
            ...,
            "password": "Pass@123!",
            "password_confirm": "Different@123!"
        }
        serializer = UserRegistrationSerializer(data=data)
        self.assertFalse(serializer.is_valid())
    
    def test_duplicate_email(self):
        # Create existing user
        User.objects.create(email="john@example.com")
        
        data = { ..., "email": "john@example.com" }
        serializer = UserRegistrationSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn("email", serializer.errors)
    
    def test_mobile_validation(self):
        data = { ..., "mobile": "123" }  # Less than 10 digits
        serializer = UserRegistrationSerializer(data=data)
        self.assertFalse(serializer.is_valid())
```

**Tests Cover:**
- ✓ Valid input acceptance
- ✓ Email format validation
- ✓ Password strength requirements
- ✓ Duplicate field detection
- ✓ Phone number format validation

#### 1.2.2 View/Endpoint Tests

**Purpose:** Validate API endpoint behavior, status codes, responses.

**Example Test Cases:**

```python
class RegisterViewTests(APITestCase):
    
    def test_successful_registration(self):
        # Arrange
        url = "/api/auth/register/"
        data = {
            "name": "John",
            "email": "john@example.com",
            "mobile": "9876543210",
            "password": "Pass@123!",
            "password_confirm": "Pass@123!"
        }
        
        # Act
        response = self.client.post(url, data, format='json')
        
        # Assert
        self.assertEqual(response.status_code, 201)
        self.assertIn("user", response.data)
        self.assertTrue(User.objects.filter(email=data["email"]).exists())
    
    def test_registration_with_invalid_data(self):
        url = "/api/auth/register/"
        data = { "name": "" }  # Missing required fields
        
        response = self.client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, 400)
        self.assertIn("errors", response.data or "email" in response.data)
```

**Tests Cover:**
- ✓ HTTP status codes (201, 400, 401, 403, 500)
- ✓ Response structure
- ✓ Database state changes
- ✓ Request validation

#### 1.2.3 Model Tests

**Purpose:** Validate model methods and business logic.

**Example Test Cases:**

```python
class ServiceRequestModelTests(TestCase):
    
    def setUp(self):
        self.user = User.objects.create(email="test@example.com")
        self.vehicle = Vehicle.objects.create(name="Bike", price=50000)
    
    def test_create_service_request(self):
        service = ServiceRequest.objects.create(
            customer=self.user,
            vehicle=self.vehicle,
            description="Engine maintenance",
            status="pending"
        )
        
        self.assertEqual(service.status, "pending")
        self.assertEqual(service.customer, self.user)
    
    def test_update_status_transition(self):
        service = ServiceRequest.objects.create(...)
        service.update_status("in_progress")
        
        self.assertEqual(service.status, "in_progress")
        self.assertIsNotNone(service.date_started)
```

**Tests Cover:**
- ✓ Object creation
- ✓ Field validation
- ✓ Business logic methods
- ✓ State transitions

### 1.3 Frontend Unit Testing (React Components)

#### Test Framework: Vitest + React Testing Library

**Purpose:** Test React components in isolation.

#### 1.3.1 Component Logic Tests

**Example Test Cases (Conceptual):**

```javascript
// Login component tests
describe('Login Component', () => {
    
    test('renders login form', () => {
        // Arrange
        render(<Login />)
        
        // Act & Assert
        expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
        expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument()
    })
    
    test('updates form state on input change', () => {
        render(<Login />)
        const emailInput = screen.getByLabelText(/email/i)
        
        fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
        
        expect(emailInput.value).toBe('test@example.com')
    })
    
    test('disables submit button while loading', async () => {
        render(<Login />)
        const submitButton = screen.getByRole('button', { name: /login/i })
        
        // Submit form
        fireEvent.click(submitButton)
        
        // Assert button is disabled during loading
        expect(submitButton).toBeDisabled()
    })
    
    test('displays error message on failed login', async () => {
        // Mock API failure
        jest.mock('../../services/authService', () => ({
            login: jest.fn(() => 
                Promise.reject(new Error("Invalid credentials"))
            )
        }))
        
        render(<Login />)
        fillForm()
        fireEvent.click(screen.getByRole('button', { name: /login/i }))
        
        await waitFor(() => {
            expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument()
        })
    })
})
```

**Tests Cover:**
- ✓ Component rendering
- ✓ State updates
- ✓ Event handling
- ✓ Conditional rendering
- ✓ Loading states
- ✓ Error display

#### 1.3.2 Hook Tests

**Example Test Cases:**

```javascript
describe('useAuth Hook', () => {
    
    test('initializes with null user', () => {
        const { result } = renderHook(() => useAuth())
        
        expect(result.current.user).toBeNull()
    })
    
    test('updates user after login', async () => {
        const { result } = renderHook(() => useAuth())
        
        await act(async () => {
            await result.current.login('test@example.com', 'password')
        })
        
        expect(result.current.user).not.toBeNull()
        expect(result.current.user.email).toBe('test@example.com')
    })
    
    test('clears user on logout', async () => {
        const { result } = renderHook(() => useAuth())
        
        await act(async () => {
            await result.current.logout()
        })
        
        expect(result.current.user).toBeNull()
    })
})
```

**Tests Cover:**
- ✓ Initial state
- ✓ State transitions
- ✓ Side effects
- ✓ Error handling

---

## 2. Integration Testing

### 2.1 Definition and Purpose

Integration testing verifies that different components work together correctly. It tests the interaction between frontend and backend, database operations, and API communication.

### 2.2 API Integration Tests

**Purpose:** Test complete API workflows end-to-end.

#### 2.2.1 Authentication Workflow

**Test Scenario: Complete User Registration Flow**

```
1. Register new user
   POST /api/auth/register/
   ├─ Verify user created in database
   ├─ Verify OTP generated
   ├─ Verify email sent
   └─ Verify response contains OTP (for testing)

2. Verify OTP
   POST /api/auth/verify-otp/
   ├─ Verify user marked as is_verified=true
   ├─ Verify OTP record deleted
   └─ Verify success response

3. Login with verified account
   POST /api/auth/login/
   ├─ Verify access token generated
   ├─ Verify refresh token generated
   ├─ Verify user data in response
   └─ Verify tokens valid (can decode JWT)

Test Assertions:
  ✓ Status codes correct at each step (201, 200, 200)
  ✓ Database state changes correctly
  ✓ Tokens generated and valid
  ✓ User can use token for subsequent requests
```

#### 2.2.2 Service Booking Workflow

**Test Scenario: Customer Books Service**

```
Setup:
  - Create authenticated user (customer)
  - Create vehicle in inventory

Test Flow:
1. Customer fetches available vehicles
   GET /api/inventory/vehicles/
   ├─ Verify only active vehicles returned
   └─ Verify customer can see vehicles

2. Customer creates service request
   POST /api/service/requests/
   ├─ Verify request created in database
   ├─ Verify status is 'pending'
   ├─ Verify customer_id matches current user
   └─ Verify scheduled_date is future date

3. Customer views their service requests
   GET /api/service/requests/my_services/
   ├─ Verify only customer's requests returned
   ├─ Verify count matches created requests
   └─ Verify filtering works correctly

4. Admin updates service status
   PATCH /api/service/requests/{id}/update_status/
   ├─ Verify only admin can access
   ├─ Verify status updated correctly
   ├─ Verify assigned_to field updated
   └─ Verify customer cannot access

Test Assertions:
  ✓ All endpoints return correct status codes
  ✓ Database reflects state changes
  ✓ Role-based permissions enforced
  ✓ Data filtering works correctly
  ✓ Validation prevents invalid operations
```

#### 2.2.3 Token Refresh Workflow

**Test Scenario: Token Expiration & Refresh**

```
1. Login and receive tokens
   POST /api/auth/login/
   └─ Store access_token and refresh_token

2. Make request with access_token
   GET /api/service/requests/
   ├─ Add header: Authorization: Bearer {access_token}
   └─ Verify request succeeds (200)

3. Simulate token expiration
   Modify token payload or wait for expiration
   └─ access_token becomes invalid

4. Retry request with expired token
   GET /api/service/requests/
   ├─ Backend returns 401 Unauthorized
   └─ Verify error response structure

5. Refresh token
   POST /api/auth/token/refresh/
   ├─ Send refresh_token in body
   ├─ Receive new access_token
   └─ Verify new token is valid

6. Retry original request with new token
   GET /api/service/requests/
   └─ Verify request now succeeds

Test Assertions:
  ✓ Expired tokens rejected (401)
  ✓ Refresh endpoint returns new token
  ✓ New token is valid and usable
  ✓ Refresh token not expired within 7 days
```

### 2.3 Frontend-Backend Integration Tests

**Purpose:** Test React components interacting with actual API.

#### 2.3.1 End-to-End Login Flow

```
Test: User completes full login journey

1. Navigate to /login page
   ✓ Login form renders
   ✓ Email and password inputs visible

2. Enter credentials and submit
   ✓ Form data collected correctly
   ✓ API call made to POST /api/auth/login/
   ✓ Tokens received from backend

3. Verify state updates
   ✓ localStorage contains access_token
   ✓ localStorage contains refresh_token
   ✓ localStorage contains user object
   ✓ AuthContext.user updated globally

4. Verify navigation
   ✓ Redirected to /dashboard
   ✓ useAuth() hook returns logged-in user
   ✓ Other components can access user data

5. Verify protected routes
   ✓ Can access /dashboard
   ✓ Cannot access /login (redirected)
   ✓ Cannot access /register (redirected)
```

#### 2.3.2 Dashboard Data Loading

```
Test: Dashboard loads and displays user data

1. Navigate to /dashboard (authenticated)
   ✓ ProtectedRoute checks auth
   ✓ Dashboard component mounts

2. Component fetches data
   ✓ GET /api/auth/me/ called
   ✓ GET /api/service/requests/ called
   ✓ Both include Authorization header

3. Loading state shown
   ✓ Spinner/skeleton displayed
   ✓ Form inputs disabled

4. Data received and rendered
   ✓ User profile displayed
   ✓ Service requests listed
   ✓ No loading indicator visible

5. User interactions work
   ✓ Click "Cancel Service" → API call made
   ✓ Status updated in UI
   ✓ Error messages shown if needed
```

### 2.4 Database Integration Tests

**Purpose:** Verify data persistence and relationships.

```
Test Scenario: Service Request Data Flow

1. Create service request with relationships
   ✓ User record created
   ✓ Vehicle record created
   ✓ ServiceRequest created with FK references

2. Query relationships
   ✓ service.customer returns correct user
   ✓ service.vehicle returns correct vehicle
   ✓ user.servicerequest_set returns all user's services

3. Update operations
   ✓ Change status → database updated
   ✓ Query returns new status immediately

4. Delete operations
   ✓ Delete service request → record removed
   ✓ No orphaned references
   ✓ Cascading deletes work correctly
```

---

## 3. Beta Testing

### 3.1 Definition and Purpose

Beta testing involves real users testing the application in a production-like environment before final release. It identifies issues that unit and integration tests may miss.

### 3.2 Beta Testing Strategy

#### 3.2.1 Beta Tester Recruitment

**Profile of Beta Testers:**
- **Admin Users (2-3):** Test administrative features, dashboard, analytics
- **Customer Users (5-10):** Test booking flow, account management, notifications
- **Diverse Devices:** iOS, Android, Desktop (Windows, Mac)
- **Different Networks:** WiFi, 4G/5G, low bandwidth scenarios

#### 3.2.2 Test Scenarios for Beta Users

**Registration & Onboarding:**
```
□ Register account on web
□ Receive OTP email
□ Verify email successfully
□ Login with registered account
□ Update profile information
□ Reset password functionality
□ Login on multiple devices
□ Logout from all devices
```

**Core Functionality (Customer):**
```
□ Browse available vehicles/services
□ Filter and search services
□ Book service appointment
□ Receive booking confirmation
□ Cancel booking
□ Modify booking details
□ View service history
□ Receive email notifications
□ Provide ratings/feedback
```

**Core Functionality (Admin):**
```
□ Login as admin
□ View all service requests
□ Update service status
□ Assign technician
□ View analytics dashboard
□ Generate reports
□ Manage vehicle inventory
□ Export data
□ View user management
```

**Performance & Reliability:**
```
□ App loading time (target: < 3 seconds)
□ API response time (target: < 1 second)
□ No crashes on navigation
□ Handle slow network gracefully
□ Offline error handling
□ Data sync after network recovery
□ Background operations continue
□ Memory usage reasonable
□ Battery drain acceptable (mobile)
```

**Security & Privacy:**
```
□ Passwords not visible in forms
□ Tokens not logged to console
□ No sensitive data in URLs
□ HTTPS enforced in production
□ Account access only by owner
□ Admin features admin-only
□ Session timeout after inactivity
□ Logout clears sensitive data
```

### 3.3 Beta Testing Process

#### Phase 1: User Onboarding
1. Provide beta testers with access credentials
2. Share testing guidelines and scenarios
3. Explain feedback submission process
4. Set testing duration (2-4 weeks)

#### Phase 2: Exploratory Testing
- Users test features freely
- Encouraged to use app as real user would
- Report any unexpected behavior

#### Phase 3: Guided Testing
- Specific test scenarios provided
- Checklists to ensure coverage
- Systematic testing of critical paths

#### Phase 4: Feedback Collection
- Issue reporting template:
  ```
  Title: [Brief description]
  Severity: Critical / High / Medium / Low
  Steps to Reproduce: [Step-by-step]
  Expected Result: [What should happen]
  Actual Result: [What actually happened]
  Device/Browser: [Device and browser used]
  Screenshots/Video: [Attachments if applicable]
  ```

#### Phase 5: Bug Triage & Fixes
- Categorize reported issues
- Prioritize by severity
- Fix critical issues immediately
- Retest with beta users

### 3.4 Beta Testing Metrics

**Metrics to Track:**
```
Total Issues Found:        X
├─ Critical:               X  (must fix before release)
├─ High:                   X  (should fix)
├─ Medium:                 X  (nice to fix)
└─ Low:                    X  (document for future)

Performance Metrics:
├─ Average Load Time:      2.3 seconds
├─ Average API Response:   450 ms
├─ Crash Rate:            0%
└─ User Satisfaction:     4.5/5.0 stars

Coverage:
├─ Features Tested:       95%
├─ User Paths Tested:     90%
├─ Devices Tested:        8 types
└─ Scenarios Tested:      85%
```

---

## 4. Testing Tools & Frameworks

### 4.1 Backend Testing Stack

| Tool | Purpose | Usage |
|------|---------|-------|
| **Django TestCase** | Unit testing framework | Model and view tests |
| **Django REST Framework Test** | API testing | Endpoint testing |
| **pytest-django** | Enhanced testing | Fixtures, parametrized tests |
| **coverage.py** | Code coverage | Measure test coverage % |
| **Faker** | Test data generation | Create realistic test data |
| **Factory Boy** | Object factories | Create test objects efficiently |

### 4.2 Frontend Testing Stack

| Tool | Purpose | Usage |
|------|---------|-------|
| **Vitest** | Unit test framework | React component tests |
| **React Testing Library** | Component testing | Test user interactions |
| **Jest** | Test runner | Execute tests, mocking |
| **Mock Service Worker** | API mocking | Mock API responses |
| **Cypress** | E2E testing | Full user journey tests |
| **@testing-library/user-event** | User simulation | Realistic user interactions |

---

## 5. Test Coverage Goals

### 5.1 Backend Coverage Targets

```
Models:         90% coverage
  └─ All business logic tested
  
Serializers:    85% coverage
  └─ All validation rules tested
  
Views/APIs:     85% coverage
  └─ All endpoints and responses tested
  
Utils:          80% coverage
  └─ Helper functions tested
  
Overall:        85% code coverage minimum
  └─ Focus on critical paths
```

### 5.2 Frontend Coverage Targets

```
Components:     70% coverage
  └─ All major components tested
  
Hooks:          85% coverage
  └─ All custom hooks tested
  
Services:       80% coverage
  └─ All API calls tested
  
Utils:          80% coverage
  └─ Helper functions tested
  
Overall:        75% code coverage minimum
  └─ Focus on user-facing features
```

---

## 6. Continuous Integration

### 6.1 CI/CD Pipeline

```
Commit Code
    ↓
Automated Tests Run:
├─ Backend Unit Tests (Django)
├─ Backend Integration Tests
├─ Frontend Unit Tests (Vitest)
├─ Frontend Integration Tests (Cypress)
└─ Code Coverage Check
    ↓
All Tests Pass?
├─ YES → Code merged to main
└─ NO → Developer fixes issues
    ↓
Deploy to Staging
    ↓
Manual Testing/QA
    ↓
Deploy to Production (after release approval)
```

---

## 7. Testing Best Practices

### 7.1 Do's
✅ **Test business logic, not implementation** — Test what code does, not how it does it
✅ **Keep tests isolated** — Each test independent, no test dependencies
✅ **Use descriptive names** — Test names explain what is being tested
✅ **Arrange-Act-Assert** — Organize tests into setup, execution, verification
✅ **Test edge cases** — Empty inputs, null values, boundary conditions
✅ **Maintain test data** — Use factories or fixtures for consistent test data
✅ **Automate testing** — Run tests automatically before each commit

### 7.2 Don'ts
❌ **Don't test trivial code** — Skip getters/setters without logic
❌ **Don't test external libraries** — Assume libraries are tested
❌ **Don't have test interdependencies** — One failing test shouldn't affect others
❌ **Don't write tests after completion** — Write tests during development (TDD)
❌ **Don't ignore test failures** — Fix immediately, don't skip

---

## 8. Conclusion

A comprehensive testing strategy combining unit tests, integration tests, and beta testing ensures BikeHub is reliable, performant, and user-friendly. Regular execution of these tests throughout development catches bugs early, reduces production issues, and increases confidence in the application.

**Testing Roadmap:**
- **Week 1-2:** Unit tests for core components
- **Week 3-4:** Integration tests for workflows
- **Week 5-6:** UI/UX refinement based on integration test results
- **Week 7-8:** Beta testing with real users
- **Week 9:** Issue fixing and final testing
- **Week 10:** Production release

This structured approach ensures high code quality and user satisfaction upon release.

