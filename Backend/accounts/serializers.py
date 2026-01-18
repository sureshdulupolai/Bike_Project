"""
Serializers for accounts app
"""
from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from django.utils import timezone
from datetime import timedelta
import random
from .models import User, OTP


class UserRegistrationSerializer(serializers.ModelSerializer):
    """Serializer for user registration (Customer & Admin)"""
    
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
    
    class Meta:
        model = User
        fields = ['id', 'name', 'email', 'mobile', 'password', 'password_confirm', 'role']
        extra_kwargs = {
            'name': {'required': True},
            'email': {'required': True},
            'mobile': {'required': True},
        }

    def validate(self, attrs):
        """Validate password confirmation"""
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({
                "password": "Password fields didn't match."
            })
        return attrs

    def validate_email(self, value):
        """Validate email uniqueness"""
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value

    def validate_mobile(self, value):
        """Validate mobile uniqueness"""
        if User.objects.filter(mobile=value).exists():
            raise serializers.ValidationError("A user with this mobile number already exists.")
        return value

    def create(self, validated_data):
        validated_data.pop('password_confirm')
        password = validated_data.pop('password')
        
        # Get admin flag from context if available
        admin = self.context.get('admin', False)

        # Remove admin key if exists (from serializer)
        validated_data.pop('admin', None)

        # Backend determines role, staff, superuser
        if admin:
            # Create superuser for admin
            validated_data['role'] = 'admin'
            validated_data['is_staff'] = True
            validated_data['is_superuser'] = True
            validated_data['is_verified'] = True
            user = User.objects.create_superuser(password=password, **validated_data)
        else:
            # Create regular user for customer
            validated_data['role'] = 'customer'
            validated_data['is_staff'] = False
            validated_data['is_superuser'] = False
            validated_data['is_verified'] = False
            user = User.objects.create_user(password=password, **validated_data)
            
            # Customer OTP logic
            otp_code = str(random.randint(100000, 999999))
            expires_at = timezone.now() + timedelta(minutes=10)
            
            OTP.objects.create(
                user=user,
                otp_code=otp_code,
                purpose='email_verification',
                expires_at=expires_at
            )
            
            user.otp = otp_code
            user.otp_created_at = timezone.now()
            user.save()
        
        return user

class UserLoginSerializer(serializers.Serializer):
    """Serializer for user login"""
    email = serializers.EmailField(required=True)
    password = serializers.CharField(
        required=True,
        write_only=True,
        style={'input_type': 'password'}
    )


class OTPVerificationSerializer(serializers.Serializer):
    """Serializer for OTP verification"""
    email = serializers.EmailField(required=True)
    otp_code = serializers.CharField(max_length=6, required=True)
    
    def validate(self, attrs):
        """Validate OTP"""
        email = attrs.get('email')
        otp_code = attrs.get('otp_code')
        
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            raise serializers.ValidationError({
                "email": "User with this email does not exist."
            })
        
        otp_obj = OTP.objects.filter(
            user=user,
            otp_code=otp_code,
            purpose='email_verification',
            is_used=False
        ).first()
        
        if not otp_obj:
            raise serializers.ValidationError({
                "otp_code": "Invalid or expired OTP."
            })
        
        if otp_obj.expires_at < timezone.now():
            raise serializers.ValidationError({
                "otp_code": "OTP has expired."
            })
        
        attrs['user'] = user
        attrs['otp_obj'] = otp_obj
        return attrs


class UserSerializer(serializers.ModelSerializer):
    """Serializer for user details"""
    class Meta:
        model = User
        fields = ['id', 'name', 'email', 'mobile', 'role', 'is_active', 'is_verified', 'created_at']
        read_only_fields = ['id', 'created_at', 'is_verified']


class UserProfileSerializer(serializers.ModelSerializer):
    """Serializer for user profile update"""
    class Meta:
        model = User
        fields = ['id', 'name', 'email', 'mobile', 'role', 'is_active', 'is_verified', 'created_at']
        read_only_fields = ['id', 'email', 'role', 'created_at', 'is_verified']
