# 2 Wheeler Sales Management - Frontend

A premium React frontend application built with Vite, Bootstrap 5, and Framer Motion for the 2 Wheeler Sales Management and Maintenance System.

## Features

- 🎨 **Premium UI** - Modern, clean interface with smooth animations
- 🔐 **JWT Authentication** - Secure token-based authentication
- 👥 **Role-Based Access** - Separate dashboards for Admin and Customer
- 📱 **Responsive Design** - Works seamlessly on all devices
- ⚡ **Fast Performance** - Built with Vite for optimal performance
- 🎭 **Smooth Animations** - Framer Motion for delightful interactions

## Tech Stack

- **React 18** - UI library
- **Vite** - Build tool and dev server
- **React Router DOM** - Routing
- **Axios** - HTTP client
- **Bootstrap 5** - CSS framework
- **Framer Motion** - Animation library
- **Lucide React** - Icon library
- **React Toastify** - Toast notifications

## Project Structure

```
Frontedn/
├── src/
│   ├── components/        # Reusable components
│   │   ├── Layout/        # Layout components (Navbar, Footer)
│   │   ├── UI/            # UI components (Card, Button, Loading)
│   │   └── admin/         # Admin-specific components
│   ├── contexts/          # React contexts (AuthContext)
│   ├── pages/             # Page components
│   │   ├── auth/          # Authentication pages
│   │   ├── customer/      # Customer pages
│   │   └── admin/         # Admin pages
│   ├── services/          # API service layer
│   ├── config/            # Configuration files
│   ├── App.jsx            # Main app component
│   └── main.jsx           # Entry point
├── public/                # Static assets
├── package.json           # Dependencies
└── vite.config.js         # Vite configuration
```

## Installation

1. **Navigate to frontend directory**
```bash
cd Frontedn
```

2. **Install dependencies**
```bash
npm install
```

3. **Create environment file** (optional)
```bash
cp .env.example .env
```

4. **Start development server**
```bash
npm run dev
```

The app will be available at `http://localhost:3000`

## Environment Variables

Create a `.env` file in the `Frontedn` directory:

```env
VITE_API_BASE_URL=http://localhost:8000/api
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Pages

### Public Pages
- **Home** (`/`) - Landing page
- **Login** (`/login`) - User login
- **Register** (`/register`) - User registration
- **Verify OTP** (`/verify-otp`) - Email verification
- **Vehicles** (`/vehicles`) - Browse vehicles
- **Vehicle Detail** (`/vehicles/:id`) - Vehicle details

### Customer Pages
- **Dashboard** (`/customer/dashboard`) - Customer dashboard
- **My Purchases** (`/customer/purchases`) - Purchase history
- **My Services** (`/customer/services`) - Service requests

### Admin Pages
- **Dashboard** (`/admin/dashboard`) - Admin dashboard
- **Manage Vehicles** (`/admin/vehicles`) - Vehicle management
- **Sales Management** (`/admin/sales`) - Sales management
- **Service Management** (`/admin/services`) - Service management
- **Reports** (`/admin/reports`) - Business reports

### Common Pages
- **Profile** (`/profile`) - User profile

## API Integration

The frontend integrates with the Django REST Framework backend:

- **Base URL**: `http://localhost:8000/api`
- **Authentication**: JWT tokens stored in localStorage
- **Auto-refresh**: Tokens are automatically refreshed on expiry
- **Error Handling**: Centralized error handling with toast notifications

## Key Features

### Authentication
- JWT-based authentication
- Auto token refresh
- Protected routes
- Role-based access control

### Vehicle Management
- Browse vehicles (public)
- View vehicle details
- Purchase vehicles (customer)
- Manage inventory (admin)

### Sales Management
- Purchase vehicles
- View purchase history
- Verify sales (admin)
- Cancel purchases

### Service Management
- Book services
- View service history
- Update service status (admin)
- Cancel services

### Reports
- Sales reports
- Inventory reports
- Service reports
- Dashboard summary

## Components

### Reusable Components
- **Card** - Animated card component
- **Button** - Button with loading state
- **Loading** - Loading spinner
- **Alert** - Alert component
- **Layout** - Main layout wrapper

### Protected Routes
- **ProtectedRoute** - Route protection for authenticated users
- **PublicRoute** - Redirect authenticated users

## Styling

- Bootstrap 5 for responsive design
- Custom CSS variables for theming
- Framer Motion for animations
- Smooth transitions and hover effects

## Development

1. Ensure backend is running on `http://localhost:8000`
2. Start frontend dev server: `npm run dev`
3. Open `http://localhost:3000` in browser

## Production Build

```bash
npm run build
```

The build output will be in the `dist` directory.

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

MIT License
