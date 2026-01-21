# BikeHub Test Case Tables

## Overview
This document contains comprehensive test case tables for the BikeHub bike service management system. Each test case is identified with a unique ID and includes expected results for validation.

---

## 1. Login Test Cases

### Table 1.1: Registration Verification Login

| TC ID | Test Case Description | Test Steps | Expected Result |
|-------|----------------------|-----------|-----------------|
| **LGN-001** | Verify login with valid credentials | 1. Navigate to /login<br>2. Enter valid email<br>3. Enter correct password<br>4. Click Login button | ✓ User logged in successfully<br>✓ Redirected to dashboard<br>✓ Access token stored in localStorage<br>✓ Refresh token stored in localStorage<br>✓ User profile displayed in header |
| **LGN-002** | Verify login with invalid email | 1. Navigate to /login<br>2. Enter non-existent email<br>3. Enter any password<br>4. Click Login button | ✓ HTTP 400 error returned<br>✓ Error message: "Email or password incorrect"<br>✓ Form remains filled<br>✓ User not logged in<br>✓ Tokens not stored |
| **LGN-003** | Verify login with incorrect password | 1. Navigate to /login<br>2. Enter valid email<br>3. Enter wrong password<br>4. Click Login button | ✓ HTTP 400 error returned<br>✓ Error message displayed<br>✓ Form remains filled<br>✓ User not logged in<br>✓ No tokens generated |
| **LGN-004** | Verify login with empty email | 1. Navigate to /login<br>2. Leave email field empty<br>3. Enter password<br>4. Click Login button | ✓ Form validation triggered<br>✓ Error message: "Email is required"<br>✓ Submit button disabled<br>✓ API not called |
| **LGN-005** | Verify login with empty password | 1. Navigate to /login<br>2. Enter valid email<br>3. Leave password field empty<br>4. Click Login button | ✓ Form validation triggered<br>✓ Error message: "Password is required"<br>✓ Submit button disabled<br>✓ API not called |
| **LGN-006** | Verify login with unverified account | 1. Create account but don't verify OTP<br>2. Navigate to /login<br>3. Enter credentials<br>4. Click Login button | ✓ HTTP 400 error returned<br>✓ Error message: "Please verify your email first"<br>✓ User not logged in |
| **LGN-007** | Verify form field format validation | 1. Navigate to /login<br>2. Enter invalid email format<br>3. Observe validation | ✓ Email field marked as invalid<br>✓ Error message: "Please enter a valid email"<br>✓ Submit button disabled |
| **LGN-008** | Verify token stored in localStorage | 1. Login with valid credentials<br>2. Open browser DevTools<br>3. Check localStorage | ✓ access_token present in localStorage<br>✓ refresh_token present in localStorage<br>✓ user object contains: id, email, name, role<br>✓ Tokens are JWT format |
| **LGN-009** | Verify login button loading state | 1. Navigate to /login<br>2. Fill valid credentials<br>3. Click Login button | ✓ Button shows loading indicator<br>✓ Button text changes to "Logging in..."<br>✓ Button disabled during request<br>✓ Button re-enabled on response |
| **LGN-010** | Verify login with inactive account | 1. Create and verify account<br>2. Admin deactivates account<br>3. Try to login<br>4. Enter credentials | ✓ HTTP 400 error returned<br>✓ Error message displayed<br>✓ User cannot login |

### Table 1.2: Session Management

| TC ID | Test Case Description | Test Steps | Expected Result |
|-------|----------------------|-----------|-----------------|
| **LGN-011** | Verify auto-logout on token expiration | 1. Login successfully<br>2. Modify localStorage to expire access token<br>3. Make API request<br>4. Wait for auto-refresh | ✓ Interceptor detects 401<br>✓ Refresh token used to get new access token<br>✓ Request retried with new token<br>✓ No manual re-login needed |
| **LGN-012** | Verify logout clears tokens | 1. Login successfully<br>2. Click Logout button<br>3. Check localStorage<br>4. Try to access protected page | ✓ access_token removed<br>✓ refresh_token removed<br>✓ user object removed<br>✓ Redirected to /login |
| **LGN-013** | Verify multiple device login | 1. Login on Device A<br>2. Login on Device B with same account<br>3. Check Device A session | ✓ Both devices can access API<br>✓ Each device has separate token<br>✓ Both devices show authenticated<br>✓ Logout on one doesn't affect other |
| **LGN-014** | Verify token not in URL | 1. Login successfully<br>2. Copy current URL<br>3. Check for token in URL | ✓ No access_token in URL<br>✓ No refresh_token in URL<br>✓ Token only in header for API calls<br>✓ URL is safe to share |
| **LGN-015** | Verify HTTPS enforcement (production) | 1. In production environment<br>2. Attempt HTTP connection<br>3. Monitor browser | ✓ Redirected to HTTPS<br>✓ Page loads securely<br>✓ Token transmitted only over HTTPS<br>✓ Browser shows secure lock icon |

---

## 2. Registration Test Cases

### Table 2.1: Account Creation

| TC ID | Test Case Description | Test Steps | Expected Result |
|-------|----------------------|-----------|-----------------|
| **REG-001** | Verify successful registration with valid data | 1. Navigate to /register<br>2. Enter name: "John Doe"<br>3. Enter email: "john@example.com"<br>4. Enter mobile: "9876543210"<br>5. Enter password: "Pass@123!"<br>6. Confirm password<br>7. Click Register | ✓ HTTP 201 Created returned<br>✓ User created in database<br>✓ is_verified = false<br>✓ OTP generated<br>✓ Email sent with OTP<br>✓ Redirected to /verify-otp<br>✓ Email stored in sessionStorage |
| **REG-002** | Verify name validation | 1. Navigate to /register<br>2. Enter name: "J"<br>3. Try to submit | ✓ Error: "Name must be at least 2 characters"<br>✓ Submit button disabled<br>✓ API not called |
| **REG-003** | Verify email format validation | 1. Navigate to /register<br>2. Enter email: "invalid-email"<br>3. Try to submit | ✓ Error: "Please enter a valid email"<br>✓ Email field marked as error<br>✓ Submit button disabled |
| **REG-004** | Verify duplicate email detection | 1. Register account with email: "test@example.com"<br>2. Try to register again with same email<br>3. Click Register | ✓ HTTP 400 error returned<br>✓ Error: "Email already registered"<br>✓ Form fields remain filled<br>✓ User not created |
| **REG-005** | Verify duplicate mobile detection | 1. Register account with mobile: "9876543210"<br>2. Try to register with same mobile<br>3. Click Register | ✓ HTTP 400 error returned<br>✓ Error: "Mobile number already registered"<br>✓ Form remains filled |
| **REG-006** | Verify mobile format validation | 1. Navigate to /register<br>2. Enter mobile: "12345"<br>3. Try to submit | ✓ Error: "Mobile number must be 10 digits"<br>✓ Submit button disabled<br>✓ API not called |
| **REG-007** | Verify password strength requirements | 1. Enter password: "pass"<br>2. Try to submit | ✓ Error: "Password must be 8+ characters with number and special character"<br>✓ Submit button disabled |
| **REG-008** | Verify password confirmation match | 1. Enter password: "Pass@123!"<br>2. Enter confirm: "Pass@456!"<br>3. Try to submit | ✓ Error: "Passwords do not match"<br>✓ Submit button disabled<br>✓ API not called |
| **REG-009** | Verify empty field validation | 1. Navigate to /register<br>2. Leave one or more fields empty<br>3. Try to submit | ✓ Error messages shown for empty fields<br>✓ Specific field highlighted<br>✓ Submit button disabled |
| **REG-010** | Verify password visibility toggle | 1. Navigate to /register<br>2. Enter password<br>3. Click eye icon | ✓ Password becomes visible<br>✓ Confirm password also toggles<br>✓ Click again to hide |

### Table 2.2: OTP Verification

| TC ID | Test Case Description | Test Steps | Expected Result |
|-------|----------------------|-----------|-----------------|
| **REG-011** | Verify OTP email sent | 1. Complete registration<br>2. Check email inbox<br>3. Find OTP email | ✓ Email received within 30 seconds<br>✓ Subject contains "BikeHub OTP"<br>✓ Email contains 6-digit OTP<br>✓ OTP valid for 10 minutes |
| **REG-012** | Verify OTP verification with correct code | 1. Register successfully<br>2. Receive OTP via email<br>3. Navigate to /verify-otp<br>4. Enter OTP code<br>5. Click Verify | ✓ HTTP 200 OK returned<br>✓ User marked as is_verified = true<br>✓ OTP record deleted<br>✓ Success message displayed<br>✓ Redirected to /login |
| **REG-013** | Verify OTP verification with incorrect code | 1. Register successfully<br>2. Navigate to /verify-otp<br>3. Enter wrong OTP<br>4. Click Verify | ✓ HTTP 400 error returned<br>✓ Error: "Invalid OTP"<br>✓ User not verified<br>✓ OTP field cleared |
| **REG-014** | Verify OTP expiration | 1. Register account<br>2. Wait 10+ minutes<br>3. Try to verify with original OTP | ✓ HTTP 400 error returned<br>✓ Error: "OTP expired"<br>✓ User can request new OTP |
| **REG-015** | Verify resend OTP functionality | 1. Complete registration<br>2. Click "Resend OTP"<br>3. Check email again | ✓ New OTP generated<br>✓ New email sent<br>✓ Old OTP becomes invalid<br>✓ New OTP valid for 10 minutes |
| **REG-016** | Verify empty OTP field | 1. Navigate to /verify-otp<br>2. Leave OTP field empty<br>3. Click Verify | ✓ Error: "OTP is required"<br>✓ Submit button disabled<br>✓ API not called |
| **REG-017** | Verify OTP format (6 digits only) | 1. Navigate to /verify-otp<br>2. Enter "ABC123"<br>3. Try to submit | ✓ Error: "OTP must be 6 digits"<br>✓ Submit button disabled |

### Table 2.3: Role-Based Registration

| TC ID | Test Case Description | Test Steps | Expected Result |
|-------|----------------------|-----------|-----------------|
| **REG-018** | Verify customer registration (default role) | 1. Complete registration flow<br>2. Verify account<br>3. Login<br>4. Check user role | ✓ User created with role = "customer"<br>✓ Access to /dashboard<br>✓ Cannot access /admin |
| **REG-019** | Verify admin registration with security key | 1. Navigate to /admin/register<br>2. Enter invalid security key<br>3. Try to submit form | ✓ Form not displayed<br>✓ Error: "Invalid security key"<br>✓ Cannot proceed |
| **REG-020** | Verify admin registration with valid key | 1. Navigate to /admin/register<br>2. Enter valid security key (DEV-2026-SECURE)<br>3. Complete registration | ✓ Form displayed<br>✓ User created with role = "admin"<br>✓ Access to /admin dashboard<br>✓ Can view all requests |

---

## 3. Book Bike Service Test Cases

### Table 3.1: Service Booking Creation

| TC ID | Test Case Description | Test Steps | Expected Result |
|-------|----------------------|-----------|-----------------|
| **SRV-001** | Verify successful service booking | 1. Login as customer<br>2. Navigate to /book-service<br>3. Select vehicle from dropdown<br>4. Enter description: "Oil change needed"<br>5. Select scheduled date: 2026-02-15<br>6. Click Book Service | ✓ HTTP 201 Created returned<br>✓ Service request created in database<br>✓ status = "pending"<br>✓ customer_id matches logged-in user<br>✓ Confirmation message shown<br>✓ Redirected to dashboard |
| **SRV-002** | Verify service without vehicle selection | 1. Navigate to service booking<br>2. Leave vehicle field empty<br>3. Fill other fields<br>4. Click Book Service | ✓ Validation error: "Please select a vehicle"<br>✓ Vehicle field highlighted<br>✓ Submit button disabled<br>✓ API not called |
| **SRV-003** | Verify service with short description | 1. Navigate to service booking<br>2. Select vehicle<br>3. Enter description: "Oil"<br>4. Try to submit | ✓ Error: "Description must be at least 10 characters"<br>✓ Submit button disabled |
| **SRV-004** | Verify service with past date | 1. Navigate to service booking<br>2. Select vehicle<br>3. Select scheduled date: 2026-01-01 (past)<br>4. Try to submit | ✓ Error: "Date must be in future"<br>✓ Date field highlighted<br>✓ Submit button disabled |
| **SRV-005** | Verify service with date > 30 days | 1. Navigate to service booking<br>2. Select vehicle<br>3. Select date: 2026-02-25 (31 days out)<br>4. Try to submit | ✓ Error: "Date must be within 30 days"<br>✓ Submit button disabled |
| **SRV-006** | Verify service with valid date range | 1. Navigate to service booking<br>2. Select vehicle<br>3. Select date: 2026-02-15 (15 days out)<br>4. Submit | ✓ Service created successfully<br>✓ scheduled_date = 2026-02-15<br>✓ HTTP 201 returned |
| **SRV-007** | Verify only active vehicles shown | 1. Login as customer<br>2. Navigate to vehicle dropdown<br>3. Check list of vehicles | ✓ Only active vehicles displayed<br>✓ Deleted vehicles not shown<br>✓ Inactive vehicles filtered out |
| **SRV-008** | Verify service booking form validation | 1. Leave all fields empty<br>2. Try to submit | ✓ All required fields show errors<br>✓ Specific error messages for each field<br>✓ Submit button disabled |
| **SRV-009** | Verify loading state during booking | 1. Fill booking form<br>2. Click Book Service<br>3. Observe button state | ✓ Button shows loading spinner<br>✓ Button text changes<br>✓ Button disabled during request<br>✓ Re-enabled after response |
| **SRV-010** | Verify unauthenticated user cannot book | 1. Logout<br>2. Try to access /book-service<br>3. Observe behavior | ✓ Redirected to /login<br>✓ Not redirected back to booking after login (unless specified)<br>✓ Cannot create service request |

### Table 3.2: Service Booking Management

| TC ID | Test Case Description | Test Steps | Expected Result |
|-------|----------------------|-----------|-----------------|
| **SRV-011** | Verify view my service requests | 1. Login as customer<br>2. Navigate to /dashboard<br>3. View "My Services" section | ✓ All service requests displayed<br>✓ Only customer's own requests shown<br>✓ Sorted by date (newest first)<br>✓ Shows: vehicle, status, date, cost |
| **SRV-012** | Verify service status display | 1. View service request<br>2. Check status field | ✓ Status badge shows current status<br>✓ Color-coded: pending=yellow, in_progress=blue, completed=green, cancelled=red<br>✓ Status matches database value |
| **SRV-013** | Verify cancel pending service | 1. Book service<br>2. Click "Cancel Request"<br>3. Confirm cancellation | ✓ HTTP 200 OK returned<br>✓ status changed to "cancelled"<br>✓ Cancellation reason stored<br>✓ UI updated immediately<br>✓ Cannot undo cancellation |
| **SRV-014** | Verify cannot cancel completed service | 1. View completed service<br>2. Try to click "Cancel" button | ✓ Cancel button not visible<br>✓ No API call made<br>✓ Error shown if attempted |
| **SRV-015** | Verify service cost display | 1. View service request<br>2. Check cost field | ✓ Cost displayed in INR format<br>✓ Shows "N/A" or "0" if not estimated<br>✓ Formatted as: ₹500.00 |
| **SRV-016** | Verify service history | 1. Complete multiple services<br>2. Navigate to Service History<br>3. Filter by date range | ✓ All completed services shown<br>✓ Filter by date works<br>✓ Export to PDF available |
| **SRV-017** | Verify real-time status updates (if implemented) | 1. Book service<br>2. Admin updates status<br>3. Customer views dashboard | ✓ Status updates in real-time<br>✓ No page refresh needed<br>✓ Notification sent to customer |

### Table 3.3: Service Booking Error Scenarios

| TC ID | Test Case Description | Test Steps | Expected Result |
|-------|----------------------|-----------|-----------------|
| **SRV-018** | Verify server error handling | 1. Complete booking form<br>2. Backend returns 500 error<br>3. Observe UI | ✓ Error message: "Server error. Please try again."<br>✓ Form remains filled<br>✓ User can retry |
| **SRV-019** | Verify network error handling | 1. Disable internet<br>2. Try to book service<br>3. Observe behavior | ✓ Error: "Cannot connect to server"<br>✓ Form remains usable<br>✓ Retry button available |
| **SRV-020** | Verify API timeout handling | 1. Book service with slow network<br>2. Wait for timeout<br>3. Check response | ✓ Error message shown<br>✓ Timeout duration: 30 seconds<br>✓ User can retry |

---

## 4. Admin Approval Test Cases

### Table 4.1: Admin Dashboard & Request List

| TC ID | Test Case Description | Test Steps | Expected Result |
|-------|----------------------|-----------|-----------------|
| **ADM-001** | Verify admin can access admin dashboard | 1. Login as admin<br>2. Navigate to /admin/dashboard | ✓ Admin dashboard loads<br>✓ Shows all service requests<br>✓ Shows analytics/stats<br>✓ Customer cannot access |
| **ADM-002** | Verify service request list view | 1. Login as admin<br>2. Go to Service Requests section<br>3. View list | ✓ All service requests displayed<br>✓ Sorted by date (newest first)<br>✓ Shows: ID, customer, vehicle, status, date<br>✓ Pagination working (if > 20 items) |
| **ADM-003** | Verify filter by status | 1. Login as admin<br>2. Filter by status: "pending"<br>3. Apply filter | ✓ Only pending requests shown<br>✓ Other statuses hidden<br>✓ Count updated<br>✓ Filter persists during session |
| **ADM-004** | Verify filter by vehicle | 1. Login as admin<br>2. Filter by vehicle dropdown<br>3. Select specific vehicle | ✓ Requests for selected vehicle shown<br>✓ Other vehicles filtered<br>✓ Multiple filters work together |
| **ADM-005** | Verify filter by date range | 1. Login as admin<br>2. Filter by date range: 2026-01-01 to 2026-02-01<br>3. Apply | ✓ Requests within date range shown<br>✓ Requests outside range hidden<br>✓ Clear filter button available |
| **ADM-006** | Verify search functionality | 1. Login as admin<br>2. Search for customer name<br>3. Enter search term | ✓ Requests matching search displayed<br>✓ Case-insensitive search<br>✓ Real-time search results |
| **ADM-007** | Verify request details view | 1. Click on service request row<br>2. View full details | ✓ Details panel opens<br>✓ Shows all fields: customer, vehicle, description, dates<br>✓ Shows conversation/notes<br>✓ Action buttons visible |

### Table 4.2: Service Status Update

| TC ID | Test Case Description | Test Steps | Expected Result |
|-------|----------------------|-----------|-----------------|
| **ADM-008** | Verify update status to "in_progress" | 1. Select pending service<br>2. Click "Update Status"<br>3. Select "In Progress"<br>4. Click Update | ✓ HTTP 200 OK returned<br>✓ status changed to "in_progress"<br>✓ Admin can assign technician<br>✓ Timestamp recorded<br>✓ Customer notified |
| **ADM-009** | Verify add cost estimate | 1. Update service to in_progress<br>2. Enter cost: "500"<br>3. Click Update | ✓ Cost saved in database<br>✓ Customer can see cost<br>✓ Decimal format supported (500.00)<br>✓ Negative values rejected |
| **ADM-010** | Verify assign technician | 1. Update service status<br>2. Click "Assign Technician"<br>3. Select technician from dropdown | ✓ Technician assigned<br>✓ Technician notified via email/SMS<br>✓ Customer can see assigned person<br>✓ Can reassign if needed |
| **ADM-011** | Verify mark service as completed | 1. Service in "in_progress"<br>2. Click status dropdown<br>3. Select "Completed"<br>4. Add completion notes | ✓ status = "completed"<br>✓ completion_date recorded<br>✓ Notes saved<br>✓ Customer notified<br>✓ Cannot modify after completion |
| **ADM-012** | Verify add notes/comments | 1. Update service<br>2. Click "Add Note"<br>3. Enter note text<br>4. Save | ✓ Note saved with timestamp<br>✓ Admin name recorded<br>✓ Customer can see internal vs external notes<br>✓ Notes displayed in conversation view |
| **ADM-013** | Verify status transition validation | 1. Try invalid transition: completed → pending<br>2. Attempt change | ✓ Transition blocked<br>✓ Error: "Invalid status transition"<br>✓ Valid transitions only:<br>   pending → in_progress → completed<br>   any → cancelled |
| **ADM-014** | Verify notification sent on status change | 1. Update service status<br>2. Check customer email<br>3. Check notification panel | ✓ Email sent to customer<br>✓ Subject mentions status change<br>✓ In-app notification displayed<br>✓ SMS sent (if configured) |

### Table 4.3: Admin Permissions & Security

| TC ID | Test Case Description | Test Steps | Expected Result |
|-------|----------------------|-----------|-----------------|
| **ADM-015** | Verify admin-only access control | 1. Login as customer<br>2. Try to access /admin/dashboard<br>3. Try direct API call | ✓ Redirected to /dashboard<br>✓ Error message: "Access Denied"<br>✓ API returns 403 Forbidden |
| **ADM-016** | Verify customer cannot update request | 1. Login as customer who created request<br>2. Try to update status<br>3. Try to add cost | ✓ Update buttons not visible<br>✓ API returns 403 Forbidden<br>✓ No modifications allowed |
| **ADM-017** | Verify admin cannot modify other admin's changes | 1. Admin A updates service<br>2. Admin B tries to update same field<br>3. Check last-modified timestamp | ✓ Both can update<br>✓ Last update timestamp recorded<br>✓ Edit history preserved |
| **ADM-018** | Verify bulk operations (if available) | 1. Select multiple services<br>2. Bulk update status<br>3. Apply | ✓ Status changed for all selected<br>✓ Notifications sent to all customers<br>✓ Activity logged |
| **ADM-019** | Verify admin logout clears sensitive data | 1. Login as admin<br>2. Perform actions<br>3. Logout<br>4. Check localStorage | ✓ Tokens cleared<br>✓ Admin data removed<br>✓ Session ended<br>✓ Cannot access admin features |
| **ADM-020** | Verify admin cannot delete service | 1. Login as admin<br>2. Try to permanently delete service | ✓ Delete button not available<br>✓ Services can only be cancelled<br>✓ Data preserved for audit |

### Table 4.4: Analytics & Reporting

| TC ID | Test Case Description | Test Steps | Expected Result |
|-------|----------------------|-----------|-----------------|
| **ADM-021** | Verify dashboard statistics | 1. Login as admin<br>2. View dashboard<br>3. Check stats | ✓ Total requests count correct<br>✓ Pending count matches filtered list<br>✓ Completed count accurate<br>✓ Revenue total calculated<br>✓ Stats update in real-time |
| **ADM-022** | Verify request trend chart | 1. View dashboard<br>2. Check request trend graph<br>3. Hover on data points | ✓ Chart displays correctly<br>✓ X-axis: dates, Y-axis: count<br>✓ Trend line visible<br>✓ Tooltip shows exact values |
| **ADM-023** | Verify revenue report | 1. Navigate to Reports<br>2. Select date range<br>3. Generate revenue report | ✓ Total revenue calculated<br>✓ Revenue by vehicle shown<br>✓ Revenue by status shown<br>✓ Export to PDF available |
| **ADM-024** | Verify service completion rate | 1. View analytics<br>2. Check completion rate | ✓ % of completed services shown<br>✓ Average completion time displayed<br>✓ Pending/delayed count visible |
| **ADM-025** | Verify export functionality | 1. Select data range<br>2. Click "Export"<br>3. Choose format (CSV/PDF) | ✓ File generated correctly<br>✓ Downloaded with timestamp in filename<br>✓ All data included<br>✓ Formatting preserved |

---

## Summary of Test Cases

| Feature | Test Cases | IDs |
|---------|-----------|-----|
| **Login** | 15 | LGN-001 to LGN-015 |
| **Registration** | 20 | REG-001 to REG-020 |
| **Service Booking** | 20 | SRV-001 to SRV-020 |
| **Admin Approval** | 25 | ADM-001 to ADM-025 |
| **TOTAL** | **80** | - |

---

## Test Execution Guidelines

### Execution Order
1. **Login Test Cases First** (LGN-001 to LGN-015)
   - Foundation for all other tests
   
2. **Registration Test Cases** (REG-001 to REG-020)
   - Create test accounts
   
3. **Service Booking Test Cases** (SRV-001 to SRV-020)
   - Test core functionality
   
4. **Admin Approval Test Cases** (ADM-001 to ADM-025)
   - Test management features

### Test Status Tracking

| Status | Meaning |
|--------|---------|
| ✅ **PASS** | Test executed successfully, result matches expected |
| ❌ **FAIL** | Test executed but result doesn't match expected |
| ⚠️ **BLOCKED** | Test cannot execute due to dependency failure |
| ⏭️ **SKIPPED** | Test intentionally skipped or not applicable |
| 🔄 **IN PROGRESS** | Currently executing test |

### Test Report Template

For each test case:
```
TC ID: [ID]
Status: [PASS/FAIL/BLOCKED/SKIPPED]
Executed Date: [Date]
Executed By: [Tester Name]
Actual Result: [What actually happened]
Remarks: [Any additional notes]
```

---

## Notes for Testers

- ✅ Always use test accounts (not production data)
- ✅ Clear localStorage between test sessions
- ✅ Test on different browsers (Chrome, Firefox, Safari, Edge)
- ✅ Test on different devices (Desktop, Mobile, Tablet)
- ✅ Report bugs immediately with detailed steps to reproduce
- ✅ Include screenshots/videos for visual bugs
- ✅ Note any performance issues
- ✅ Verify data in database for critical operations

