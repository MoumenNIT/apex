# Apex Store - Electronics E-Commerce Platform

## Project Overview

Apex Store is a modern, feature-rich electronics e-commerce platform built with React and Supabase. The platform provides a complete solution for selling high-performance computers, workstations, and electronics with advanced user management, data visualization, and administrative capabilities.

## Technology Stack

- **Frontend**: React 18, Vite
- **Backend**: Supabase (PostgreSQL database, Authentication, Real-time)
- **UI Components**: Custom animated components (inspired by react-bits)
- **Charts**: Recharts for data visualization
- **Icons**: Lucide React
- **Styling**: Inline styles with CSS-in-JS approach

## Implemented Features

### 1. User Account Management

The system provides comprehensive user account management:

- **User Registration**: Complete sign-up form with validation
  - First name and last name fields
  - Email validation with regex pattern
  - Password strength requirements (min 8 chars, uppercase, lowercase, number)
  - Password confirmation matching

- **Login System**: Secure authentication flow
  - Email and password authentication
  - Session management via Supabase Auth
  - Error handling with user-friendly messages

- **Profile Management**: User profile editing capabilities
  - Update first name, last name
  - Email display (read-only)
  - Profile settings interface

- **Account Deletion**: User can delete their account
  - Confirmation dialog
  - Data cleanup from database

- **Role-Based Access**: Different user roles
  - Regular users (customers)
  - Administrators with elevated privileges
  - Role management in admin panel

### 2. Authentication and Authorization

Secure authentication system with role-based access control:

- **Login Session Management**: 
  - Supabase Auth handles sessions
  - Persistent login across page refreshes
  - Automatic session refresh

- **Access Control**:
  - Protected routes using ProtectedRoute component
  - Role-based access (admin-only sections)
  - Public routes for browsing products

- **Protected Pages**:
  - User Dashboard (requires authentication)
  - Admin Dashboard (requires admin role)
  - Order history (requires authentication)

### 3. Product/Order Management

Complete product and order management system (adapted from request/offer concept):

- **Product Management** (Admin):
  - Create new products with full specifications
  - Edit existing product details
  - Delete products
  - Quick stock updates (+/-)
  - Feature toggling
  - Active/inactive status
  - Inventory alerts for low stock

- **Product Details**:
  - Title, description, category, brand
  - Price and original price
  - Stock quantity tracking
  - Technical specifications
  - Product highlights

- **Order Management**:
  - Create orders from cart
  - View order details with modal
  - Update order status (pending, processing, shipped, delivered, cancelled)
  - Order statistics dashboard
  - Customer information display
  - Order items with quantities

### 4. Data Visualization with Tables

Structured data tables with advanced features:

- **Products Table**:
  - Product name, price, stock, category, status
  - Sorting by any column
  - Pagination (configurable page size)
  - Action buttons (view, edit, delete, toggle features)
  - Quick stock adjustment buttons
  - Search and filter capabilities

- **Orders Table**:
  - Order number, customer, items, total, date, status
  - Status dropdown for quick updates
  - Sorting and pagination
  - Order details modal
  - Export functionality

- **Users Table**:
  - User information, contact details, role
  - Admin role toggle
  - Join date display
  - Search and filter by role

- **Table Features**:
  - Sortable columns with visual indicators
  - Row selection with checkboxes
  - Bulk actions
  - Pagination with page navigation
  - Empty state handling
  - Responsive design

### 5. Forms for Data Entry

Multiple forms with validation and error handling:

- **Registration Form**:
  - First name, last name, email, password, confirm password
  - Real-time validation
  - Password strength requirements
  - Email format validation
  - Required field validation
  - Error messages display

- **Login Form**:
  - Email and password fields
  - Validation for empty fields
  - Email format validation
  - Password minimum length
  - Error handling

- **Product Form** (Admin):
  - Product name, slug, price, original price
  - Stock quantity, category, brand
  - Badge text, description
  - Featured and active checkboxes
  - Form validation

- **Profile Form**:
  - First name, last name, email
  - Save functionality
  - Validation

**Form Features**:
- Required field indicators
- Real-time validation feedback
- Error message display
- Loading states
- Success/error toast notifications

### 6. Search Functionality

Advanced search with multiple criteria:

- **Keyword Search**:
  - Search by product name
  - Real-time search results
  - Case-insensitive matching

- **Category Search**:
  - Filter by product category
  - Gaming PC, Workstation, Mini PC, Office PC

- **Brand Search**:
  - Filter by brand
  - Apex, Volt, Stealth, Titan, Nova

- **User Search** (Admin):
  - Search by user name
  - Search by email

- **Search Features**:
  - Instant search feedback
  - Clear search button
  - Search results count
  - Search history (optional)

### 7. Filtering System

Dynamic filtering with multiple options:

- **Product Filters**:
  - Category filter
  - Brand filter
  - Price range filter
  - Stock status filter (in stock, low stock, out of stock)
  - Featured products filter
  - Active/inactive filter

- **Order Filters**:
  - Status filter (pending, processing, shipped, delivered, cancelled)
  - Date range filter
  - Customer filter
  - Amount range filter

- **User Filters**:
  - Role filter (admin, customer)
  - Registration date range
  - Account status

- **Filter Features**:
  - Multi-select filters
  - Range sliders
  - Date pickers
  - Active filter display with remove buttons
  - Clear all filters option
  - Dynamic result updates

### 8. User Dashboard

Personal dashboard for each user:

- **Activity Summary**:
  - Total orders count
  - Total amount spent
  - Pending orders
  - Completed orders
  - Animated counters using CountUp component

- **Posted Orders**:
  - List of user's orders
  - Order status indicators
  - Order dates and totals
  - Quick view details

- **Profile Management**:
  - Edit personal information
  - Update contact details
  - Change password
  - Account settings

- **Settings**:
  - Email notifications toggle
  - Two-factor authentication toggle
  - Privacy settings
  - Account deletion

### 9. Admin Panel

Comprehensive administration interface:

- **Dashboard Overview**:
  - Total revenue
  - Total orders
  - Today's revenue
  - Pending orders
  - Completed orders
  - Inventory alerts

- **Products Management**:
  - View all products
  - Add new products
  - Edit products
  - Delete products
  - Quick stock updates
  - Feature toggling
  - Inventory alerts display

- **Orders Management**:
  - View all orders
  - Update order status
  - View order details
  - Customer information
  - Order statistics
  - Export orders

- **Clients Management**:
  - View all users
  - Toggle admin roles
  - User statistics
  - Export users

- **Analytics Tab**:
  - Revenue trend charts (Line chart)
  - Orders by day (Bar chart)
  - Category distribution (Pie chart)
  - Key metrics display
  - Date range selector (7d, 30d, 90d)

- **Security Tab**:
  - Admin users count
  - Recent actions count
  - Security alerts
  - Audit logs table
  - Security settings

### 10. Security Features

- **Row-Level Security (RLS)**:
  - Database-level security policies
  - Users can only access their own data
  - Admins can access all data
  - Protected sensitive operations

- **Audit Logging**:
  - All admin actions logged
  - Timestamp, admin email, action, details
  - IP address tracking
  - User agent tracking

- **Password Security**:
  - Minimum 8 characters
  - Uppercase, lowercase, number requirements
  - Secure storage in Supabase

- **Session Management**:
  - Secure token-based authentication
  - Automatic session refresh
  - Logout functionality

### 11. Animated UI Components

Custom animated components for enhanced UX:

- **TextRotate**: Rotating text animation
- **FadeContent**: Scroll-triggered fade-in
- **MagnetButton**: Magnetic hover effect
- **AnimatedCard**: Hover scale and glow
- **SplitText**: Character-by-character reveal
- **GradientText**: Color-shifting text (no gradients)
- **CountUp**: Animated number counter
- **ShinyButton**: Shine effect on hover
- **TiltCard**: 3D tilt effect

### 12. GitHub Auto-Sync

Automatic database synchronization on GitHub push:

- **GitHub Actions Workflow**:
  - Triggers on push to main/master
  - Runs database migrations
  - Syncs product data
  - Notifies admin dashboard

- **Supabase Edge Function**:
  - GitHub webhook handler
  - Logs sync actions to audit logs
  - Broadcasts sync notifications
  - Updates system settings

## Database Schema

### Tables

1. **users**: User accounts and profiles
2. **products**: Product catalog
3. **product_specs**: Technical specifications
4. **product_highlights**: Product highlights
5. **orders**: Customer orders
6. **order_items**: Order line items
7. **reviews**: Product reviews
8. **wishlist_items**: User wishlists
9. **cart_items**: Shopping cart
10. **categories**: Product categories
11. **brands**: Product brands
12. **coupons**: Discount codes
13. **analytics**: Analytics data
14. **admin_audit_logs**: Admin action logs
15. **system_settings**: System configuration

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/MoumenNIT/apex.git
   cd apex/apex-store
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```
   Edit `.env.local` with your Supabase credentials:
   ```
   VITE_SUPABASE_URL=your-supabase-url
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Access the application at `http://localhost:5173`

## Admin Dashboard Access

To access the admin dashboard:

1. Create a user account or sign in
2. Set the user as admin in the database:
   ```sql
   UPDATE users SET is_admin = true WHERE email = 'your-email@example.com';
   ```
3. Navigate to `http://localhost:5173/#/admin`

## Project Structure

```
apex-store/
├── src/
│   ├── components/
│   │   ├── auth/
│   │   │   └── AuthProvider.jsx
│   │   ├── dashboard/
│   │   │   └── UserDashboard.jsx
│   │   ├── data/
│   │   │   └── DataTable.jsx
│   │   ├── forms/
│   │   │   ├── LoginForm.jsx
│   │   │   └── RegisterForm.jsx
│   │   ├── search/
│   │   │   ├── SearchBar.jsx
│   │   │   └── FilterPanel.jsx
│   │   └── ui/
│   │       ├── AnimatedCard.jsx
│   │       ├── CountUp.jsx
│   │       ├── FadeContent.jsx
│   │       ├── GradientText.jsx
│   │       ├── MagnetButton.jsx
│   │       ├── ShinyButton.jsx
│   │       ├── SplitText.jsx
│   │       ├── TextRotate.jsx
│   │       └── TiltCard.jsx
│   ├── lib/
│   │   └── supabase.js
│   ├── AdminDashboard.jsx
│   ├── App.jsx
│   ├── index.css
│   ├── index.js
│   └── main.jsx
├── supabase/
│   └── functions/
│       └── github-sync/
│           └── index.ts
├── .github/
│   └── workflows/
│       └── supabase-sync.yml
├── supabase_schema.sql
├── package.json
├── vite.config.js
└── index.html
```

## Requirements Met

All specified requirements have been implemented:

1. User Account Management - COMPLETE
2. Authentication and Authorization - COMPLETE
3. Request/Offer Management (adapted to Product/Order) - COMPLETE
4. Data Visualization with Tables - COMPLETE
5. Forms for Data Entry - COMPLETE
6. Search Functionality - COMPLETE
7. Filtering System - COMPLETE
8. Dashboard - COMPLETE
9. Basic Administration Panel - COMPLETE
10. Source Code - COMPLETE
11. Report - COMPLETE (this document)

## Additional Features

- Real-time data synchronization
- Responsive design
- Dark mode interface
- Animated UI components
- Email notifications (via Supabase Edge Functions)
- GitHub Actions CI/CD
- Audit logging
- Inventory management
- Analytics dashboard
- Export functionality

## Future Enhancements

- Payment gateway integration
- Product reviews and ratings
- Wishlist functionality
- Shopping cart persistence
- Order tracking
- Email marketing integration
- Multi-language support
- Mobile app
- AI-powered recommendations

## License

This project is open source and available for educational and commercial use.

## Contact

For questions or support, please contact the development team or open an issue on GitHub.
