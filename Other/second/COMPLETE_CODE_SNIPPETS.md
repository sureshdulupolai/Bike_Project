# BikeHub Django REST API - Complete Code Snippets

## Installation & Setup

### Requirements
```bash
pip install django
pip install djangorestframework
pip install django-cors-headers
pip install djangorestframework-simplejwt
pip install python-decouple
pip install django-filter
pip install pillow  # for image upload
```

### Initialize Django Project
```bash
django-admin startproject config
python manage.py startapp accounts
python manage.py startapp inventory
python manage.py startapp service
python manage.py startapp sales
python manage.py startapp reports
```

---

## Complete Code - Accounts App

### models.py
```python
"""
Custom User Model for BikeHub
"""
from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.utils import timezone
import uuid

class UserManager(BaseUserManager):
    """Custom user manager"""
    
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('Email is required')
        
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user
    
    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('role', 'admin')
        
        return self.create_user(email, password, **extra_fields)

class User(AbstractBaseUser, PermissionsMixin):
    """Custom User Model"""
    
    ROLE_CHOICES = [
        ('customer', 'Customer'),
        ('admin', 'Admin'),
        ('developer', 'Developer'),
    ]
    
    id = models.BigAutoField(primary_key=True)
    email = models.EmailField(unique=True, db_index=True)
    name = models.CharField(max_length=100)
    mobile = models.CharField(max_length=15, unique=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='customer')
    
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    is_verified = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    last_login_at = models.DateTimeField(null=True, blank=True)
    
    objects = UserManager()
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['name', 'mobile']
    
    class Meta:
        db_table = 'accounts_user'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.name} ({self.email})"

class OTP(models.Model):
    """OTP Model for email verification"""
    
    id = models.BigAutoField(primary_key=True)
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    code = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    is_verified = models.BooleanField(default=False)
    
    class Meta:
        db_table = 'accounts_otp'
    
    def __str__(self):
        return f"OTP for {self.user.email}"
    
    def is_valid(self):
        """Check if OTP is valid and not expired"""
        from django.utils import timezone
        return not self.is_verified and self.expires_at > timezone.now()
```

### serializers.py (Complete)
```python
"""
Complete Serializers for Authentication
"""
from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from django.db import transaction
from django.utils import timezone
from datetime import timedelta
import random
import string
from .models import User, OTP

class UserRegistrationSerializer(serializers.ModelSerializer):
    """Serializer for user registration"""
    
    password = serializers.CharField(
        write_only=True,
        required=True,
        validators=[validate_password],
        style={'input_type': 'password'}
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
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email already registered.")
        return value.lower()

    def validate_mobile(self, value):
        if not value.isdigit() or len(value) != 10:
            raise serializers.ValidationError("Mobile number must be 10 digits.")
        if User.objects.filter(mobile=value).exists():
            raise serializers.ValidationError("Mobile number already registered.")
        return value

    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({
                "password": "Password fields didn't match."
            })
        return attrs

    def create(self, validated_data):
        validated_data.pop('password_confirm')
        
        with transaction.atomic():
            user = User.objects.create_user(
                email=validated_data['email'],
                name=validated_data['name'],
                mobile=validated_data['mobile'],
                password=validated_data['password'],
                role='customer'
            )
            
            otp_code = ''.join(random.choices(string.digits, k=6))
            
            OTP.objects.filter(user=user).delete()
            
            OTP.objects.create(
                user=user,
                code=otp_code,
                expires_at=timezone.now() + timedelta(minutes=15)
            )
            
            user.otp = otp_code
        
        return user

class UserLoginSerializer(serializers.Serializer):
    """Serializer for user login"""
    
    email = serializers.EmailField(required=True)
    password = serializers.CharField(
        write_only=True,
        required=True,
        style={'input_type': 'password'}
    )
    
    def validate(self, attrs):
        email = attrs.get('email', '').lower()
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
        
        if not user.check_password(password):
            raise serializers.ValidationError({
                "error": "Invalid email or password."
            })
        
        if not user.is_verified:
            raise serializers.ValidationError({
                "error": "Please verify your email first using OTP."
            })
        
        if not user.is_active:
            raise serializers.ValidationError({
                "error": "Your account has been deactivated."
            })
        
        attrs['user'] = user
        return attrs

class UserSerializer(serializers.ModelSerializer):
    """Serializer for user details"""
    
    class Meta:
        model = User
        fields = ['id', 'email', 'name', 'mobile', 'role', 'is_verified', 'created_at']
        read_only_fields = fields

class OTPVerificationSerializer(serializers.Serializer):
    """Serializer for OTP verification"""
    
    email = serializers.EmailField(required=True)
    code = serializers.CharField(required=True, max_length=6)
    
    def validate(self, attrs):
        email = attrs.get('email', '').lower()
        code = attrs.get('code')
        
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            raise serializers.ValidationError({
                "error": "User not found."
            })
        
        try:
            otp = OTP.objects.get(user=user)
        except OTP.DoesNotExist:
            raise serializers.ValidationError({
                "error": "OTP not found. Please request a new OTP."
            })
        
        if not otp.is_valid():
            raise serializers.ValidationError({
                "error": "OTP expired or already verified."
            })
        
        if otp.code != code:
            raise serializers.ValidationError({
                "error": "Invalid OTP code."
            })
        
        attrs['user'] = user
        attrs['otp'] = otp
        return attrs
```

### views.py (Complete)
```python
"""
Complete Views for Authentication
"""
from rest_framework import status, generics
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.db import IntegrityError, transaction
from django.utils import timezone
from .models import User, OTP
from .serializers import (
    UserRegistrationSerializer,
    UserLoginSerializer,
    OTPVerificationSerializer,
    UserSerializer
)

class RegisterView(generics.CreateAPIView):
    """
    User Registration View
    POST /api/auth/register/
    """
    queryset = User.objects.all()
    permission_classes = [AllowAny]
    serializer_class = UserRegistrationSerializer

    def create(self, request, *args, **kwargs):
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
                "otp": user.otp
            }, status=status.HTTP_201_CREATED)

        except IntegrityError:
            return Response({
                "success": False,
                "error": "Email or mobile already registered."
            }, status=status.HTTP_400_BAD_REQUEST)

class LoginView(generics.GenericAPIView):
    """
    User Login View
    POST /api/auth/login/
    """
    permission_classes = [AllowAny]
    serializer_class = UserLoginSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        user = serializer.validated_data['user']
        user.last_login_at = timezone.now()
        user.save()
        
        refresh = RefreshToken.from_user(user)
        
        return Response({
            "success": True,
            "message": "Login successful",
            "access": str(refresh.access_token),
            "refresh": str(refresh),
            "user": UserSerializer(user).data
        }, status=status.HTTP_200_OK)

class VerifyOTPView(generics.GenericAPIView):
    """
    OTP Verification View
    POST /api/auth/verify-otp/
    """
    permission_classes = [AllowAny]
    serializer_class = OTPVerificationSerializer

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        user = serializer.validated_data['user']
        otp = serializer.validated_data['otp']
        
        with transaction.atomic():
            user.is_verified = True
            user.save()
            
            otp.is_verified = True
            otp.save()
        
        return Response({
            "success": True,
            "message": "Email verified successfully. You can now login."
        }, status=status.HTTP_200_OK)

class LogoutView(generics.GenericAPIView):
    """
    User Logout View
    POST /api/auth/logout/
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
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

class UserProfileView(generics.RetrieveAPIView):
    """
    Get Current User Profile
    GET /api/auth/me/
    """
    permission_classes = [IsAuthenticated]
    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user
```

### urls.py (Complete)
```python
"""
URL Configuration for Accounts App
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    RegisterView,
    LoginView,
    VerifyOTPView,
    LogoutView,
    UserProfileView,
)

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('verify-otp/', VerifyOTPView.as_view(), name='verify-otp'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('me/', UserProfileView.as_view(), name='user-profile'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]
```

### permissions.py
```python
"""
Custom Permission Classes
"""
from rest_framework.permissions import BasePermission

class IsAdmin(BasePermission):
    """
    Permission to check if user is admin
    """
    message = "You do not have permission to perform this action. Admin access required."

    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role == 'admin'

class IsAdminOrReadOnly(BasePermission):
    """
    Permission to allow admins to modify, others read-only
    """
    def has_permission(self, request, view):
        if request.method in ['GET', 'HEAD', 'OPTIONS']:
            return True
        return request.user and request.user.is_authenticated and request.user.role == 'admin'
```

---

## Complete Code - Service App

### serializers.py (Service)
```python
"""
Service Serializers
"""
from rest_framework import serializers
from django.utils import timezone
from datetime import timedelta
from .models import ServiceRequest

class ServiceRequestCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating service requests"""
    
    class Meta:
        model = ServiceRequest
        fields = [
            'id', 'vehicle', 'description',
            'scheduled_date', 'notes'
        ]
        extra_kwargs = {
            'description': {
                'required': True,
                'min_length': 10,
                'max_length': 500,
            },
            'notes': {
                'required': False,
                'max_length': 500,
            }
        }
    
    def validate_scheduled_date(self, value):
        if value:
            now = timezone.now()
            
            if value < now:
                raise serializers.ValidationError(
                    "Service date must be in the future."
                )
            
            max_date = now + timedelta(days=30)
            if value > max_date:
                raise serializers.ValidationError(
                    "Service date cannot be more than 30 days in advance."
                )
        
        return value

class ServiceRequestSerializer(serializers.ModelSerializer):
    """Serializer for service request details"""
    
    customer_details = serializers.SerializerMethodField()
    vehicle_details = serializers.SerializerMethodField()
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
        return {
            'id': obj.customer.id,
            'name': obj.customer.name,
            'email': obj.customer.email,
            'mobile': obj.customer.mobile
        }
    
    def get_vehicle_details(self, obj):
        return {
            'id': obj.vehicle.id,
            'brand': obj.vehicle.brand,
            'model': obj.vehicle.model,
            'price': str(obj.vehicle.price)
        }
    
    def get_assigned_to_details(self, obj):
        if obj.assigned_to:
            return {
                'id': obj.assigned_to.id,
                'name': obj.assigned_to.name,
                'email': obj.assigned_to.email
            }
        return None
```

### views.py (Service)
```python
"""
Service Request Views
"""
from rest_framework import viewsets, status
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
    """Service Request ViewSet"""
    
    permission_classes = [IsAuthenticated]
    queryset = ServiceRequest.objects.all().select_related(
        'customer', 'vehicle', 'assigned_to'
    )
    
    def get_serializer_class(self):
        if self.action == 'create':
            return ServiceRequestCreateSerializer
        return ServiceRequestSerializer
    
    def get_queryset(self):
        user = self.request.user
        
        if user.role == 'admin':
            return ServiceRequest.objects.all().select_related(
                'customer', 'vehicle', 'assigned_to'
            )
        else:
            return ServiceRequest.objects.filter(
                customer=user
            ).select_related('customer', 'vehicle', 'assigned_to')
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        service_request = serializer.save(customer=request.user)
        
        return Response(
            ServiceRequestSerializer(service_request).data,
            status=status.HTTP_201_CREATED
        )
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def cancel(self, request, pk=None):
        service_request = self.get_object()
        
        if service_request.customer != request.user:
            return Response(
                {"error": "You can only cancel your own service requests"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        if service_request.status in ['completed', 'cancelled']:
            return Response(
                {"error": f"Cannot cancel {service_request.status} service request"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        service_request.status = 'cancelled'
        service_request.save()
        
        return Response(
            {"success": True, "message": "Service request cancelled successfully"},
            status=status.HTTP_200_OK
        )
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated, IsAdmin])
    def update_status(self, request, pk=None):
        service_request = self.get_object()
        new_status = request.data.get('status')
        
        if not new_status:
            return Response(
                {"error": "Status is required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        valid_statuses = [choice[0] for choice in ServiceRequest.STATUS_CHOICES]
        if new_status not in valid_statuses:
            return Response(
                {"error": f"Invalid status. Choose from: {', '.join(valid_statuses)}"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        service_request.status = new_status
        
        if 'cost' in request.data:
            service_request.cost = request.data.get('cost')
        
        if 'notes' in request.data:
            service_request.notes = request.data.get('notes')
        
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
        requests = ServiceRequest.objects.filter(
            customer=request.user
        ).select_related('customer', 'vehicle', 'assigned_to').order_by('-date')
        
        serializer = ServiceRequestSerializer(requests, many=True)
        return Response(serializer.data)
```

### urls.py (Service)
```python
"""
URL Configuration for Service App
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

## Django Settings Configuration

### settings.py - Required Additions
```python
from datetime import timedelta
from pathlib import Path

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    
    'rest_framework',
    'rest_framework_simplejwt',
    'corsheaders',
    'django_filters',
    
    'accounts',
    'inventory',
    'service',
    'sales',
    'reports',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

# Authentication
AUTH_USER_MODEL = 'accounts.User'

# REST Framework Settings
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

# JWT Settings
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(hours=1),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    'ALGORITHM': 'HS256',
    'SIGNING_KEY': SECRET_KEY,
}

# CORS Settings
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://127.0.0.1:3000",
]

# Email Configuration
EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'  # For development
# For production, use:
# EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
# EMAIL_HOST = 'smtp.gmail.com'
# EMAIL_PORT = 587
# EMAIL_USE_TLS = True
# EMAIL_HOST_USER = os.environ.get('EMAIL_USER')
# EMAIL_HOST_PASSWORD = os.environ.get('EMAIL_PASSWORD')
```

---

## Running the Application

### 1. Create Database Migrations
```bash
python manage.py makemigrations
python manage.py migrate
```

### 2. Create Admin User
```bash
python manage.py createsuperuser
```

### 3. Run Development Server
```bash
python manage.py runserver
```

### 4. Test APIs
```bash
# Register User
curl -X POST http://localhost:8000/api/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{"name":"John","email":"john@example.com","mobile":"9876543210","password":"Pass@123","password_confirm":"Pass@123"}'

# Login
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"Pass@123"}'

# Book Service (with token)
curl -X POST http://localhost:8000/api/service/requests/ \
  -H "Authorization: Bearer ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"vehicle":1,"description":"Engine noise","scheduled_date":"2024-02-15T10:30:00Z"}'
```

---

## Project Documentation Template

### API Documentation
Create `docs/API.md`:
- Base URL: `http://localhost:8000/api`
- Authentication: JWT tokens
- All requests require `Authorization: Bearer {token}` header
- Error responses include detailed error messages
- Status codes follow HTTP standards

### Database Documentation
- Custom User model with role-based access
- Service requests linked to users and vehicles
- Cascading deletes for data integrity
- Indexes on frequently queried fields

### Security
- Passwords hashed with PBKDF2
- CORS enabled for frontend
- JWT with 1-hour expiry for access tokens
- OTP-based email verification
- Permission-based access control
