"""
Serializers for accounts app
"""
from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from django.utils import timezone
from datetime import timedelta
import random
from django.db import transaction
from django.db.models import Q
from .models import User, OTP

class UserRegistrationSerializer(serializers.ModelSerializer):
    """
    Serializer for user registration (Customer & Admin)
    Handles:
        - Password validation
        - Duplicate unverified user cleanup
        - OTP generation for customers
        - Admin vs Customer creation logic
    """
    
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
    # Declare email/mobile explicitly to avoid ModelSerializer adding UniqueValidator
    email = serializers.EmailField(required=True)
    mobile = serializers.CharField(required=True, max_length=15)
    
    class Meta:
        model = User
        fields = ['id', 'name', 'email', 'mobile', 'password', 'password_confirm']
        extra_kwargs = {
            'name': {'required': True},
            # email/mobile declared above
        }

    def validate(self, attrs):
        """Validate password confirmation"""
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        return attrs

    def validate_email(self, value):
        """Only block if a verified user exists"""
        if User.objects.filter(email=value, is_verified=True).exists():
            raise serializers.ValidationError("A verified user with this email already exists.")
        return value

    def validate_mobile(self, value):
        if User.objects.filter(mobile=value, is_verified=True).exists():
            raise serializers.ValidationError("A verified user with this mobile number already exists.")
        return value

    def create(self, validated_data):
        validated_data.pop('password_confirm')
        password = validated_data.pop('password')

        user_type = self.context.get('user_type', 'customer')

        email = validated_data.pop('email')   # ✅ POP IT
        mobile = validated_data.pop('mobile') # ✅ POP IT

        # Cleanup unverified duplicates
        with transaction.atomic():
            unverified_users = User.objects.filter(
                Q(email=email) | Q(mobile=mobile),
                is_verified=False
            )
            if unverified_users.exists():
                OTP.objects.filter(user__in=unverified_users).delete()
                unverified_users.delete()

        # =============================
        # DEVELOPER (DJANGO ADMIN USER)
        # =============================
        if user_type == 'developer':
            validated_data.update({
                'role': 'developer',
                'is_staff': True,
                'is_superuser': True,
                'is_verified': True,
            })

            user = User.objects.create_superuser(
                email=email,
                password=password,
                mobile=mobile,
                **validated_data
            )
            return user

        # =============================
        # ADMIN (NO ADMIN PANEL)
        # =============================
        if user_type == 'admin':
            validated_data.update({
                'role': 'admin',
                'is_staff': False,
                'is_superuser': False,
                'is_verified': False,
            })

            user = User.objects.create_user(
                email=email,
                password=password,
                mobile=mobile,
                **validated_data
            )

            # OTP for admin
            otp_code = str(random.randint(100000, 999999))
            OTP.objects.create(
                user=user,
                otp_code=otp_code,
                purpose='email_verification',
                expires_at=timezone.now() + timedelta(minutes=5)
            )

            user.otp = otp_code
            user.otp_created_at = timezone.now()
            user.save()

            return user

        # =============================
        # CUSTOMER (DEFAULT)
        # =============================
        validated_data.update({
            'role': 'customer',
            'is_staff': False,
            'is_superuser': False,
            'is_verified': False,
        })

        user = User.objects.create_user(
            email=email,
            password=password,
            mobile=mobile,
            **validated_data
        )

        otp_code = str(random.randint(100000, 999999))
        OTP.objects.create(
            user=user,
            otp_code=otp_code,
            purpose='email_verification',
            expires_at=timezone.now() + timedelta(minutes=5)
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
