# Quick Start Guide

## Prerequisites
- Python 3.11 or higher
- PostgreSQL (optional, SQLite can be used for development)
- pip (Python package manager)

## Installation Steps

### 1. Create Virtual Environment
```bash
python -m venv venv

# Windows
venv\Scripts\activate

# Linux/Mac
source venv/bin/activate
```

### 2. Install Dependencies
```bash
pip install -r requirements.txt
```

### 3. Database Setup

**Option A: SQLite (Quick Start)**
```bash
# Set environment variable
export USE_SQLITE=True  # Windows: set USE_SQLITE=True
```

**Option B: PostgreSQL**
```bash
# Create database
createdb bike_sales_db

# Set environment variables
export DB_NAME=bike_sales_db
export DB_USER=postgres
export DB_PASSWORD=your_password
export DB_HOST=localhost
export DB_PORT=5432
```

### 4. Run Migrations
```bash
python manage.py makemigrations
python manage.py migrate
```

### 5. Create Superuser
```bash
python manage.py createsuperuser
```
Or use the setup script:
```bash
python setup.py
```

### 6. Run Development Server
```bash
python manage.py runserver
```

The API will be available at: `http://localhost:8000/api/`

## Testing the API

### 1. Register a Customer
```bash
curl -X POST http://localhost:8000/api/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "mobile": "9876543210",
    "password": "SecurePassword123",
    "password_confirm": "SecurePassword123"
  }'
```

### 2. Login
```bash
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePassword123"
  }'
```

Save the `access` token from the response.

### 3. View Vehicles (Public)
```bash
curl http://localhost:8000/api/inventory/vehicles/
```

### 4. Purchase Vehicle (Customer)
```bash
curl -X POST http://localhost:8000/api/sales/sales/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <access_token>" \
  -d '{
    "vehicle": 1,
    "quantity": 1
  }'
```

### 5. Verify Sale (Admin)
```bash
curl -X PATCH http://localhost:8000/api/sales/sales/1/verify/ \
  -H "Authorization: Bearer <admin_access_token>"
```

## Common Commands

### Create Admin User
```bash
python manage.py createsuperuser
```

### Create App
```bash
python manage.py startapp app_name
```

### Run Tests
```bash
python manage.py test
```

### Collect Static Files
```bash
python manage.py collectstatic
```

### Access Django Admin
Visit: `http://localhost:8000/admin/`

## Environment Variables

Create a `.env` file in the project root:

```env
SECRET_KEY=your-secret-key-here
DEBUG=True
DB_NAME=bike_sales_db
DB_USER=postgres
DB_PASSWORD=postgres
DB_HOST=localhost
DB_PORT=5432
USE_SQLITE=False
```

## Troubleshooting

### Database Connection Error
- Check PostgreSQL is running
- Verify database credentials
- Use SQLite for quick testing: `export USE_SQLITE=True`

### Migration Errors
```bash
python manage.py makemigrations
python manage.py migrate --run-syncdb
```

### Port Already in Use
```bash
python manage.py runserver 8001
```

### Import Errors
- Ensure virtual environment is activated
- Reinstall dependencies: `pip install -r requirements.txt`

## Next Steps

1. Read the full [README.md](README.md)
2. Check [API_DOCUMENTATION.md](API_DOCUMENTATION.md) for detailed API docs
3. Explore the Django admin panel at `/admin/`
4. Test all endpoints using Postman or curl
