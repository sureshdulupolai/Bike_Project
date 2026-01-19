from rest_framework import status, generics, viewsets
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from .models import User, OTP
from .serializers import (
    UserRegistrationSerializer,
    UserLoginSerializer,
    OTPVerificationSerializer,
    UserSerializer,
    UserProfileSerializer
)
from .permissions import IsAdmin
from django.utils import timezone
from datetime import timedelta
import random

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = [AllowAny]
    serializer_class = UserRegistrationSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data, context={'admin': False})
        serializer.is_valid(raise_exception=True)
        user = serializer.save()  # customer

        return Response({
            "success": True,
            "message": "User registered successfully. OTP generated for email verification.",
            "user": UserSerializer(user).data,
            "otp": user.otp  # Only for frontend/email testing
        }, status=status.HTTP_201_CREATED)


class AdminRegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = [AllowAny]
    serializer_class = UserRegistrationSerializer

    # AdminRegisterView
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data, context={'admin': True})
        if not serializer.is_valid():
            return Response({
                "success": False,
                "errors": serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
        user = serializer.save()
        return Response({
            "success": True,
            "message": "Admin registered successfully. You can now login to Django admin.",
            "user": UserSerializer(user).data
        }, status=status.HTTP_201_CREATED)




class LoginView(generics.GenericAPIView):
    permission_classes = [AllowAny]
    serializer_class = UserLoginSerializer

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data['email']
        password = serializer.validated_data['password']

        user = authenticate(request, username=email, password=password)

        if not user:
            return Response({"success": False, "error": "Invalid email or password."}, status=status.HTTP_401_UNAUTHORIZED)
        if not user.is_active:
            return Response({"success": False, "error": "User account is disabled."}, status=status.HTTP_401_UNAUTHORIZED)

        refresh = RefreshToken.for_user(user)
        return Response({
            "success": True,
            "message": "Login successful",
            "user": UserSerializer(user).data,
            "tokens": {"refresh": str(refresh), "access": str(refresh.access_token)}
        }, status=status.HTTP_200_OK)

class ResendOTPView(generics.GenericAPIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get("email")

        if not email:
            return Response(
                {"success": False, "error": "Email is required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response(
                {"success": False, "error": "User not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        # ⏱️ cooldown check (1 minute)
        last_otp = OTP.objects.filter(
            user=user,
            purpose="email_verification",
            is_used=False
        ).order_by("-created_at").first()

        if last_otp and timezone.now() < last_otp.created_at + timedelta(minutes=1):
            return Response({
                "success": False,
                "error": "Please wait 1 minute before resending OTP"
            }, status=status.HTTP_429_TOO_MANY_REQUESTS)

        # generate new OTP
        otp_code = str(random.randint(100000, 999999))
        expires_at = timezone.now() + timedelta(minutes=1)

        OTP.objects.create(
            user=user,
            otp_code=otp_code,
            purpose="email_verification",
            expires_at=expires_at
        )

        user.otp = otp_code
        user.otp_created_at = timezone.now()
        user.save()

        return Response({
            "success": True,
            "message": "OTP resent successfully",
            "otp": otp_code  # 👈 frontend emailjs ke liye
        }, status=status.HTTP_200_OK)

class VerifyOTPView(generics.GenericAPIView):
    permission_classes = [AllowAny]
    serializer_class = OTPVerificationSerializer

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = serializer.validated_data['user']
        otp_obj = serializer.validated_data['otp_obj']

        otp_obj.is_used = True
        otp_obj.save()

        user.is_verified = True
        user.otp = None
        user.otp_created_at = None
        user.save()

        return Response({
            "success": True,
            "message": "Email verified successfully.",
            "user": UserSerializer(user).data
        }, status=status.HTTP_200_OK)


class LogoutView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data.get('refresh_token')
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()

            return Response({"success": True, "message": "Logout successful."}, status=status.HTTP_200_OK)
        except Exception:
            return Response({"success": False, "error": "Invalid token or already logged out."}, status=status.HTTP_400_BAD_REQUEST)


class UserProfileView(generics.RetrieveUpdateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = UserProfileSerializer

    def get_object(self):
        return self.request.user


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    permission_classes = [IsAuthenticated, IsAdmin]
    serializer_class = UserSerializer

    def get_queryset(self):
        queryset = User.objects.all()
        role = self.request.query_params.get('role', None)
        if role:
            queryset = queryset.filter(role=role)
        return queryset
