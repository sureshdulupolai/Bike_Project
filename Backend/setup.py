"""
Setup script for initial project setup
"""
import os
import sys
import django

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model
from accounts.models import User

def create_superuser():
    """Create a superuser if it doesn't exist"""
    User = get_user_model()
    
    email = input("Enter admin email (default: admin@example.com): ").strip() or "admin@example.com"
    
    if User.objects.filter(email=email).exists():
        print(f"User with email {email} already exists.")
        return
    
    name = input("Enter admin name (default: Admin): ").strip() or "Admin"
    mobile = input("Enter admin mobile (default: 9999999999): ").strip() or "9999999999"
    password = input("Enter admin password (default: admin123): ").strip() or "admin123"
    
    User.objects.create_superuser(
        email=email,
        password=password,
        name=name,
        mobile=mobile,
        role='admin',
        is_verified=True
    )
    
    print(f"\nSuperuser created successfully!")
    print(f"Email: {email}")
    print(f"Password: {password}")

if __name__ == '__main__':
    create_superuser()
