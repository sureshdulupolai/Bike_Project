# Admin Registration Fix

## Issue
When registering an admin user through the frontend (`adminRegister.jsx`), the user was created with `role='admin'` but **not** with `is_staff=True` and `is_superuser=True`. This prevented the user from accessing Django admin at `localhost:8000/admin`.

## Root Cause
The serializer's `create` method was trying to accept an `admin` parameter, but Django REST Framework's `serializer.save(admin=True)` doesn't pass it as a parameter to `create()`. Instead, we need to use the serializer's `context` to pass the admin flag.

## Solution

### 1. Updated Serializer (`accounts/serializers.py`)
- Changed `create` method to use `self.context.get('admin', False)` instead of a parameter
- For admin users, now uses `User.objects.create_superuser()` instead of `create_user()`
- This ensures `is_staff=True` and `is_superuser=True` are properly set

### 2. Updated Views (`accounts/views.py`)
- `RegisterView`: Passes `context={'admin': False}` to serializer
- `AdminRegisterView`: Passes `context={'admin': True}` to serializer

## Changes Made

### `accounts/serializers.py`
```python
def create(self, validated_data):
    # Get admin flag from context
    admin = self.context.get('admin', False)
    
    if admin:
        # Use create_superuser for admin
        validated_data['role'] = 'admin'
        validated_data['is_staff'] = True
        validated_data['is_superuser'] = True
        validated_data['is_verified'] = True
        user = User.objects.create_superuser(password=password, **validated_data)
    else:
        # Use create_user for customer
        validated_data['role'] = 'customer'
        # ... customer logic
        user = User.objects.create_user(password=password, **validated_data)
```

### `accounts/views.py`
```python
class AdminRegisterView(generics.CreateAPIView):
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(
            data=request.data, 
            context={'admin': True}  # ✅ Pass admin flag via context
        )
        # ... rest of the code
```

## Testing

1. **Register Admin via Frontend**:
   - Go to `/register/admin`
   - Fill in the form
   - Submit

2. **Verify in Django Admin**:
   - Go to `http://localhost:8000/admin`
   - Login with the same email and password
   - You should now have full admin access

3. **Check User Model**:
   ```python
   from accounts.models import User
   user = User.objects.get(email='your-admin@email.com')
   print(user.is_staff)      # Should be True
   print(user.is_superuser)  # Should be True
   print(user.role)          # Should be 'admin'
   ```

## Result
✅ Admin users registered through the frontend now have:
- `role = 'admin'`
- `is_staff = True`
- `is_superuser = True`
- Full access to Django admin panel
