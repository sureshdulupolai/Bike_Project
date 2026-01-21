# BikeHub API Implementation Guide

## 1. User Registration API

### Overview
The User Registration API allows customers to create new accounts in the BikeHub system. It includes:
- Email and mobile validation
- Password strength validation
- OTP generation for email verification
- Automatic user creation with role assignment

### Implementation Code

#### 1.1 Serializer (accounts/serializers.py)

```python
"""
Serializers for user registration and authentication
"""
from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from django.db import transaction
from .models import User, OTP
import random
import string

class UserRegistrationSerializer(serializers.ModelSerializer):
    """
    Serializer for user registration (Customer)
    
    Features:
    - Password validation and confirmation
    - Email and mobile validation
    - OTP generation
    - Transaction-based atomic operations
    """
    
    password = serializers.CharField(
        write_only=True,
        required=True,
        validators=[validate_password],
        style={'input_type': 'password'},
        help_text="Must be at least 8 characters with numbers and special characters"
    )
    password_confirm = serializers.CharField(
        write_only=True,
        required=True,
        style={'input_type': 'password'}
    )
    email = serializers.EmailField(required=True)
    mobile = serializers.CharField(required=True, max_length=15)
    
    class Meta:
        model = User
        fields = ['id', 'name', 'email', 'mobile', 'password', 'password_confirm']
        extra_kwargs = {
            'name': {'required': True, 'min_length': 2},
        }

    def validate_email(self, value):
        """Validate email uniqueness"""
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email already registered.")
        return value

    def validate_mobile(self, value):
        """Validate mobile number format and uniqueness"""
        if not value.isdigit() or len(value) != 10:
            raise serializers.ValidationError("Mobile number must be 10 digits.")
        if User.objects.filter(mobile=value).exists():
            raise serializers.ValidationError("Mobile number already registered.")
        return value

    def validate(self, attrs):
        """Validate password confirmation"""
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({
                "password": "Password fields didn't match."
            })
        return attrs

    def create(self, validated_data):
        """
        Create user and generate OTP
        
        Process:
        1. Remove password_confirm from data
        2. Create user with customer role
        3. Generate 6-digit OTP
        4. Save OTP to database
        """
        validated_data.pop('password_confirm')
        
        with transaction.atomic():
            # Create user
            user = User.objects.create_user(
                email=validated_data['email'],
                name=validated_data['name'],
                mobile=validated_data['mobile'],
                password=validated_data['password'],
                role='customer'  # Default role for registration
            )
            
            # Generate 6-digit OTP
            otp_code = ''.join(random.choices(string.digits, k=6))
            
            # Delete existing OTP if any
            OTP.objects.filter(user=user).delete()
            
            # Create new OTP record
            OTP.objects.create(
                user=user,
                code=otp_code
            )
            
            user.otp = otp_code  # Return for testing/development
            
        return user
```

#### 1.2 View (accounts/views.py)

```python
"""
Views for user authentication and registration
"""
from rest_framework import status, generics
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.db import IntegrityError, transaction
from .models import User, OTP
from .serializers import UserRegistrationSerializer, UserLoginSerializer
import random
import string

class RegisterView(generics.CreateAPIView):
    """
    User Registration API View
    
    POST /api/auth/register/
    
    Request Body:
    {
        "name": "John Doe",
        "email": "john@example.com",
        "mobile": "9876543210",
        "password": "SecurePass@123",
        "password_confirm": "SecurePass@123"
    }
    
    Response:
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
        "otp": "123456"  // For development only
    }
    """
    
    queryset = User.objects.all()
    permission_classes = [AllowAny]
    serializer_class = UserRegistrationSerializer

    def create(self, request, *args, **kwargs):
        """Handle user registration"""
        serializer = self.get_serializer(data=request.data)

        try:
            serializer.is_valid(raise_exception=True)
            user = serializer.save()
            
            return Response({
                "success": True,
                "message": "Registration successful. OTP sent to email.",
                "user": {
                    "id": user.id,
                    "email": user.email,
                    "name": user.name,
                    "mobile": user.mobile,
                    "role": user.role
                },
                "otp": user.otp  # ⚠️ Only for development
            }, status=status.HTTP_201_CREATED)

        except IntegrityError as e:
            return Response({
                "success": False,
                "error": "Email or mobile already registered. Please try again."
            }, status=status.HTTP_400_BAD_REQUEST)
        
        except serializers.ValidationError as e:
            return Response({
                "success": False,
                "error": e.detail
            }, status=status.HTTP_400_BAD_REQUEST)
```

#### 1.3 URL Configuration (accounts/urls.py)

```python
"""
URL configuration for accounts app
"""
from django.urls import path
from .views import RegisterView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    # ... other URLs
]
```

---

## 2. User Login API (JWT)

### Overview
The Login API authenticates users and issues JWT tokens for secure API access. It includes:
- Email/password authentication
- JWT token generation (access + refresh)
- User profile retrieval upon login
- Token-based session management

### Implementation Code

#### 2.1 Serializer (accounts/serializers.py)

```python
class UserLoginSerializer(serializers.Serializer):
    """
    Serializer for user login
    
    Features:
    - Email and password validation
    - User authentication
    - JWT token generation
    """
    
    email = serializers.EmailField(required=True)
    password = serializers.CharField(
        write_only=True,
        required=True,
        style={'input_type': 'password'}
    )
    
    def validate(self, attrs):
        """
        Validate credentials and authenticate user
        
        Process:
        1. Extract email and password
        2. Check if user exists
        3. Verify password
        4. Check if user is verified
        """
        email = attrs.get('email')
        password = attrs.get('password')
        
        if not email or not password:
            raise serializers.ValidationError({
                "error": "Email and password are required."
            })
        
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            raise serializers.ValidationError({
                "error": "Invalid email or password."
            })
        
        # Verify password
        if not user.check_password(password):
            raise serializers.ValidationError({
                "error": "Invalid email or password."
            })
        
        # Check if user is verified
        if not user.is_verified:
            raise serializers.ValidationError({
                "error": "Please verify your email first using OTP."
            })
        
        # Check if user is active
        if not user.is_active:
            raise serializers.ValidationError({
                "error": "Your account has been deactivated."
            })
        
        attrs['user'] = user
        return attrs


class UserSerializer(serializers.ModelSerializer):
    """Serializer for user details in login response"""
    
    class Meta:
        model = User
        fields = ['id', 'email', 'name', 'mobile', 'role', 'is_verified', 'created_at']
        read_only_fields = fields
```

#### 2.2 View (accounts/views.py)

```python
from rest_framework_simplejwt.tokens import RefreshToken

class LoginView(generics.GenericAPIView):
    """
    User Login API View
    
    POST /api/auth/login/
    
    Request Body:
    {
        "email": "john@example.com",
        "password": "SecurePass@123"
    }
    
    Response (Success - 200):
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
    
    Response (Error - 401):
    {
        "success": false,
        "error": "Invalid email or password."
    }
    """
    
    permission_classes = [AllowAny]
    serializer_class = UserLoginSerializer

    def post(self, request, *args, **kwargs):
        """
        Authenticate user and return JWT tokens
        
        JWT Structure:
        - Access Token: Short-lived (1 hour), used for API requests
        - Refresh Token: Long-lived (7 days), used to get new access token
        """
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        user = serializer.validated_data['user']
        
        # Generate JWT tokens
        refresh = RefreshToken.from_user(user)
        access_token = str(refresh.access_token)
        refresh_token = str(refresh)
        
        return Response({
            "success": True,
            "message": "Login successful",
            "access": access_token,
            "refresh": refresh_token,
            "user": UserSerializer(user).data
        }, status=status.HTTP_200_OK)


class LogoutView(generics.GenericAPIView):
    """
    User Logout API View
    
    POST /api/auth/logout/
    
    Headers:
    Authorization: Bearer {access_token}
    
    Request Body:
    {
        "refresh": "refresh_token_here"
    }
    
    Response:
    {
        "success": true,
        "message": "Logged out successfully"
    }
    """
    
    permission_classes = [IsAuthenticated]

    def post(self, request):
        """
        Logout user by blacklisting refresh token
        """
        try:
            refresh_token = request.data.get('refresh')
            
            if not refresh_token:
                return Response({
                    "success": False,
                    "error": "Refresh token is required"
                }, status=status.HTTP_400_BAD_REQUEST)
            
            token = RefreshToken(refresh_token)
            token.blacklist()
            
            return Response({
                "success": True,
                "message": "Logged out successfully"
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                "success": False,
                "error": str(e)
            }, status=status.HTTP_400_BAD_REQUEST)
```

#### 2.3 URL Configuration (accounts/urls.py)

```python
from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import LoginView, LogoutView

urlpatterns = [
    path('login/', LoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]
```

---

## 3. Bike Service Booking API

### Overview
The Service Booking API allows customers to book maintenance services for their bikes. It includes:
- Service request creation
- Vehicle selection
- Issue description and scheduling
- Status tracking
- Service history management

### Implementation Code

#### 3.1 Serializer (service/serializers.py)

```python
"""
Serializers for service booking and management
"""
from rest_framework import serializers
from django.utils import timezone
from datetime import timedelta
from .models import ServiceRequest
from inventory.models import Vehicle
from inventory.serializers import VehicleListSerializer

class ServiceRequestCreateSerializer(serializers.ModelSerializer):
    """
    Serializer for creating service requests
    
    Features:
    - Vehicle validation
    - Scheduled date validation
    - Service type selection
    - Issue description
    """
    
    vehicle_details = VehicleListSerializer(source='vehicle', read_only=True)
    
    class Meta:
        model = ServiceRequest
        fields = [
            'id', 'vehicle', 'vehicle_details', 'description',
            'scheduled_date', 'notes'
        ]
        extra_kwargs = {
            'description': {
                'required': True,
                'min_length': 10,
                'max_length': 500,
                'help_text': 'Describe the issue in detail (10-500 characters)'
            },
            'scheduled_date': {
                'required': False,
                'help_text': 'Preferred service date and time'
            },
            'notes': {
                'required': False,
                'max_length': 500,
                'help_text': 'Additional information'
            }
        }
    
    def validate_vehicle(self, value):
        """Validate vehicle ownership"""
        request = self.context.get('request')
        if request and value.id:
            # Check if vehicle exists (optional validation)
            try:
                Vehicle.objects.get(id=value.id, is_active=True)
            except Vehicle.DoesNotExist:
                raise serializers.ValidationError(
                    "Vehicle not found or is no longer available."
                )
        return value
    
    def validate_scheduled_date(self, value):
        """Validate scheduled date"""
        if value:
            now = timezone.now()
            
            # Check if date is in the future
            if value < now:
                raise serializers.ValidationError(
                    "Service date must be in the future."
                )
            
            # Check if date is not too far (max 30 days)
            max_date = now + timedelta(days=30)
            if value > max_date:
                raise serializers.ValidationError(
                    "Service date cannot be more than 30 days in advance."
                )
        
        return value
    
    def validate_description(self, value):
        """Validate description content"""
        if not value or len(value.strip()) < 10:
            raise serializers.ValidationError(
                "Please provide a detailed description (at least 10 characters)."
            )
        return value.strip()


class ServiceRequestSerializer(serializers.ModelSerializer):
    """
    Serializer for service request details and updates
    
    Features:
    - Complete service information
    - Customer and vehicle details
    - Status tracking
    - Cost estimation
    """
    
    vehicle_details = VehicleListSerializer(source='vehicle', read_only=True)
    customer_details = serializers.SerializerMethodField()
    assigned_to_details = serializers.SerializerMethodField()
    
    class Meta:
        model = ServiceRequest
        fields = [
            'id', 'customer', 'customer_details', 'vehicle', 'vehicle_details',
            'description', 'status', 'cost', 'date', 'scheduled_date',
            'completed_date', 'assigned_to', 'assigned_to_details', 'notes'
        ]
        read_only_fields = [
            'id', 'customer', 'date', 'completed_date', 'assigned_to', 'status'
        ]
    
    def get_customer_details(self, obj):
        """Get customer details"""
        return {
            'id': obj.customer.id,
            'name': obj.customer.name,
            'email': obj.customer.email,
            'mobile': obj.customer.mobile
        }
    
    def get_assigned_to_details(self, obj):
        """Get assigned technician details"""
        if obj.assigned_to:
            return {
                'id': obj.assigned_to.id,
                'name': obj.assigned_to.name,
                'email': obj.assigned_to.email
            }
        return None
```

#### 3.2 View (service/views.py)

```python
"""
Views for service request management
"""
from rest_framework import viewsets, status, generics
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.utils import timezone
from .models import ServiceRequest
from .serializers import (
    ServiceRequestCreateSerializer,
    ServiceRequestSerializer
)
from accounts.permissions import IsAdmin

class ServiceRequestViewSet(viewsets.ModelViewSet):
    """
    Service Request ViewSet
    
    Features:
    - Create service booking requests
    - View service history
    - Track service status
    - Admin service management
    
    Endpoints:
    GET    /api/service/requests/               - List all requests
    POST   /api/service/requests/               - Create new request
    GET    /api/service/requests/{id}/          - Get request details
    PUT    /api/service/requests/{id}/          - Update request
    PATCH  /api/service/requests/{id}/          - Partial update
    DELETE /api/service/requests/{id}/          - Delete request
    POST   /api/service/requests/{id}/cancel/   - Cancel request
    POST   /api/service/requests/{id}/update_status/ - Update status (Admin)
    GET    /api/service/requests/my_services/   - My service requests
    """
    
    permission_classes = [IsAuthenticated]
    queryset = ServiceRequest.objects.all().select_related(
        'customer', 'vehicle', 'assigned_to'
    )
    
    def get_serializer_class(self):
        """Return appropriate serializer based on action"""
        if self.action == 'create':
            return ServiceRequestCreateSerializer
        return ServiceRequestSerializer
    
    def get_queryset(self):
        """Filter queryset based on user role"""
        user = self.request.user
        
        if user.role == 'admin':
            # Admins see all service requests
            return ServiceRequest.objects.all().select_related(
                'customer', 'vehicle', 'assigned_to'
            )
        else:
            # Customers see only their requests
            return ServiceRequest.objects.filter(
                customer=user
            ).select_related('customer', 'vehicle', 'assigned_to')
    
    def create(self, request, *args, **kwargs):
        """
        Create new service request
        
        POST /api/service/requests/
        
        Request Body:
        {
            "vehicle": 1,
            "description": "Engine making strange noise",
            "scheduled_date": "2024-02-15T10:30:00Z",
            "notes": "Please check suspension as well"
        }
        
        Response (Success - 201):
        {
            "id": 1,
            "vehicle": 1,
            "vehicle_details": {
                "id": 1,
                "brand": "Honda",
                "model": "CB350",
                "price": "350000.00"
            },
            "description": "Engine making strange noise",
            "status": "pending",
            "cost": "0.00",
            "date": "2024-01-21T10:30:00Z",
            "scheduled_date": "2024-02-15T10:30:00Z",
            "completed_date": null,
            "notes": "Please check suspension as well"
        }
        """
        
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Create service request with current user as customer
        service_request = serializer.save(customer=request.user)
        
        return Response(
            ServiceRequestSerializer(service_request).data,
            status=status.HTTP_201_CREATED
        )
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def cancel(self, request, pk=None):
        """
        Cancel service request
        
        POST /api/service/requests/{id}/cancel/
        
        Response:
        {
            "success": true,
            "message": "Service request cancelled successfully"
        }
        """
        
        service_request = self.get_object()
        
        # Check ownership
        if service_request.customer != request.user:
            return Response(
                {"error": "You can only cancel your own service requests"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Check if already completed or cancelled
        if service_request.status in ['completed', 'cancelled']:
            return Response(
                {
                    "error": f"Cannot cancel {service_request.status} service request"
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Cancel the request
        service_request.status = 'cancelled'
        service_request.save()
        
        return Response(
            {
                "success": True,
                "message": "Service request cancelled successfully"
            },
            status=status.HTTP_200_OK
        )
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated, IsAdmin])
    def update_status(self, request, pk=None):
        """
        Update service request status (Admin only)
        
        POST /api/service/requests/{id}/update_status/
        
        Request Body:
        {
            "status": "in_progress",
            "cost": "5000.00",
            "notes": "Checking engine and carburetor"
        }
        
        Valid status values:
        - pending: Waiting to be assigned
        - in_progress: Technician is working
        - completed: Service finished
        - cancelled: Service cancelled
        """
        
        service_request = self.get_object()
        new_status = request.data.get('status')
        
        if not new_status:
            return Response(
                {"error": "Status is required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Validate status
        valid_statuses = [choice[0] for choice in ServiceRequest.STATUS_CHOICES]
        if new_status not in valid_statuses:
            return Response(
                {
                    "error": f"Invalid status. Choose from: {', '.join(valid_statuses)}"
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Update status
        service_request.status = new_status
        
        # Update cost if provided
        if 'cost' in request.data:
            service_request.cost = request.data.get('cost')
        
        # Add notes if provided
        if 'notes' in request.data:
            service_request.notes = request.data.get('notes')
        
        # Mark as completed if status is completed
        if new_status == 'completed':
            service_request.completed_date = timezone.now()
            service_request.assigned_to = request.user
        
        service_request.save()
        
        return Response(
            ServiceRequestSerializer(service_request).data,
            status=status.HTTP_200_OK
        )
    
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def my_services(self, request):
        """
        Get customer's service requests
        
        GET /api/service/requests/my_services/
        
        Response:
        [
            {
                "id": 1,
                "vehicle": 1,
                "vehicle_details": {...},
                "description": "Engine issue",
                "status": "pending",
                "cost": "0.00",
                "date": "2024-01-21T10:30:00Z",
                "scheduled_date": "2024-02-15T10:30:00Z"
            }
        ]
        """
        
        requests = ServiceRequest.objects.filter(
            customer=request.user
        ).select_related('customer', 'vehicle', 'assigned_to').order_by('-date')
        
        serializer = ServiceRequestSerializer(requests, many=True)
        return Response(serializer.data)
```

#### 3.3 URL Configuration (service/urls.py)

```python
"""
URL configuration for service app
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ServiceRequestViewSet

router = DefaultRouter()
router.register(r'requests', ServiceRequestViewSet, basename='service-request')

urlpatterns = [
    path('', include(router.urls)),
]
```

---

## 4. API Configuration Summary

### 4.1 Settings Configuration (config/settings.py)

```python
# INSTALLED APPS
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    # ...
    'rest_framework',
    'corsheaders',
    'rest_framework_simplejwt',
    'accounts',
    'inventory',
    'service',
    'sales',
    'reports',
]

# REST FRAMEWORK SETTINGS
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 10,
    'DEFAULT_FILTER_BACKENDS': [
        'django_filters.rest_framework.DjangoFilterBackend',
        'rest_framework.filters.SearchFilter',
        'rest_framework.filters.OrderingFilter',
    ],
}

# JWT SETTINGS
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(hours=1),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    'ALGORITHM': 'HS256',
}

# CORS SETTINGS
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:5173",
]
```

---

## 5. Testing the APIs

### 5.1 User Registration

```bash
curl -X POST http://localhost:8000/api/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "mobile": "9876543210",
    "password": "SecurePass@123",
    "password_confirm": "SecurePass@123"
  }'
```

### 5.2 User Login

```bash
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass@123"
  }'
```

### 5.3 Service Booking

```bash
curl -X POST http://localhost:8000/api/service/requests/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {access_token}" \
  -d '{
    "vehicle": 1,
    "description": "Engine making strange noise, needs urgent attention",
    "scheduled_date": "2024-02-15T10:30:00Z",
    "notes": "Please check suspension"
  }'
```

---

## 6. Key Implementation Features

### 6.1 Security Features
✅ Password hashing using Django's built-in system  
✅ JWT token-based authentication  
✅ Email validation  
✅ OTP verification  
✅ Permission-based access control  
✅ Role-based authorization  

### 6.2 Data Validation
✅ Serializer field validation  
✅ Custom validators for business logic  
✅ Email and mobile uniqueness checking  
✅ Date validation  
✅ Status validation  

### 6.3 Error Handling
✅ Meaningful error messages  
✅ Proper HTTP status codes  
✅ Transaction handling for data consistency  
✅ IntegrityError handling  

### 6.4 API Features
✅ RESTful design principles  
✅ Pagination support  
✅ Filtering and searching  
✅ Custom actions  
✅ Request/Response documentation  

---

## References

1. Django REST Framework Official Documentation: https://www.django-rest-framework.org/
2. Django Simple JWT: https://django-rest-framework-simplejwt.readthedocs.io/
3. RESTful API Design Best Practices: https://restfulapi.net/
4. Django Official Documentation: https://docs.djangoproject.com/
