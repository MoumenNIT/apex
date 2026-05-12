# Apex Store - Complete Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Architecture](#architecture)
4. [Database Schema](#database-schema)
5. [Authentication System](#authentication-system)
6. [Frontend Components](#frontend-components)
7. [Admin Dashboard](#admin-dashboard)
8. [Shopping Cart System](#shopping-cart-system)
9. [Product Management](#product-management)
10. [Search and Filtering](#search-and-filtering)
11. [UI Components](#ui-components)
12. [Deployment](#deployment)
13. [Configuration](#configuration)
14. [API Integration](#api-integration)
15. [Security Features](#security-features)

---

## Project Overview

Apex Store is a modern e-commerce platform for high-performance computers, built specifically for the Algerian market. The platform allows users to browse, search, and purchase custom-built PCs with advanced features like real-time inventory management, user authentication, and comprehensive admin controls.

### Key Features
- **Product Catalog**: Browse gaming PCs, workstations, mini PCs, and office PCs
- **User Authentication**: Secure sign-up and login with role-based access control
- **Shopping Cart**: Add products to cart with quantity management
- **Checkout System**: Multi-step checkout with shipping and payment forms
- **Admin Dashboard**: Comprehensive admin panel for product, order, and user management
- **Search & Filter**: Advanced search with category and brand filtering
- **Responsive Design**: Mobile-friendly interface with modern animations
- **Real-time Analytics**: Sales tracking, inventory alerts, and user statistics

### Business Context
- **Target Market**: Algeria (DZD currency)
- **Product Focus**: High-performance computing systems
- **User Base**: Gamers, professionals, and businesses
- **Admin Features**: Full CRUD operations for products, orders, and users

---

## Technology Stack

### Frontend
- **React 18**: Modern JavaScript library for building user interfaces
- **Vite**: Fast build tool and development server
- **Lucide React**: Icon library for UI elements
- **Recharts**: Chart library for admin dashboard analytics

### Backend
- **Supabase**: Backend-as-a-Service providing:
  - PostgreSQL database
  - Authentication system
  - Real-time subscriptions
  - File storage
  - Row Level Security (RLS)

### Development Tools
- **ESLint**: Code linting and quality checks
- **Git**: Version control
- **Netlify**: Deployment platform

### Styling
- **CSS-in-JS**: Inline styles for component-specific styling
- **Custom CSS**: Global styles in index.css
- **Responsive Design**: Mobile-first approach with media queries

---

## Architecture

### Project Structure
```
apex-store/
├── public/              # Static assets
├── src/
│   ├── components/      # Reusable components
│   │   ├── auth/       # Authentication components
│   │   ├── forms/      # Form components
│   │   ├── search/     # Search and filter components
│   │   └── ui/         # UI components (buttons, cards, etc.)
│   ├── lib/            # Utility functions and API clients
│   ├── App.jsx         # Main application component
│   ├── index.js        # React entry point
│   ├── main.jsx        # Vite entry point
│   └── index.css       # Global styles
├── supabase/           # Supabase configuration
├── .env.local          # Environment variables
├── package.json        # Dependencies
├── vite.config.js      # Vite configuration
└── netlify.toml        # Netlify deployment config
```

### Component Hierarchy
```
App (Main Application)
├── AuthProvider (Authentication Context)
├── CartProvider (Shopping Cart Context)
├── Navbar (Navigation)
├── Footer
├── Toast (Notifications)
└── Routes
    ├── HomePage
    ├── ProductsPage
    ├── ProductDetailPage
    ├── CartPage
    ├── CheckoutPage
    ├── AboutPage
    ├── ContactPage
    ├── FAQPage
    ├── LoginForm
    ├── RegisterForm
    ├── UserDashboard
    └── AdminDashboard
```

### Data Flow
1. **User Actions**: User interacts with UI components
2. **State Management**: Context providers (Auth, Cart) manage state
3. **API Calls**: Supabase client communicates with backend
4. **Database**: PostgreSQL stores and retrieves data
5. **UI Updates**: React re-renders components based on state changes

---

## Database Schema

### Tables

#### users
```sql
- id: UUID (Primary Key, references auth.users)
- email: TEXT (Unique)
- first_name: TEXT
- last_name: TEXT
- is_admin: BOOLEAN (Default: false)
- created_at: TIMESTAMP (Default: NOW())
- updated_at: TIMESTAMP (Default: NOW())
```

#### products
```sql
- id: UUID (Primary Key, Default: gen_random_uuid())
- name: TEXT (Not Null)
- slug: TEXT (Unique, Not Null)
- description: TEXT
- category: TEXT (Gaming PC, Workstation, Mini PC, Office PC)
- brand: TEXT (Apex, Volt, Stealth, Titan, Nova)
- price: NUMERIC (Not Null)
- original_price: NUMERIC
- stock_quantity: INTEGER (Default: 0)
- is_featured: BOOLEAN (Default: false)
- is_active: BOOLEAN (Default: true)
- image_url: TEXT
- product_specs: JSONB
  - cpu: TEXT
  - gpu: TEXT
  - ram: TEXT
  - storage: TEXT
- product_highlights: JSONB (Array of TEXT)
- rating: NUMERIC (Default: 0)
- reviews: INTEGER (Default: 0)
- badge: TEXT
- color: TEXT
- created_at: TIMESTAMP (Default: NOW())
- updated_at: TIMESTAMP (Default: NOW())
```

#### orders
```sql
- id: UUID (Primary Key, Default: gen_random_uuid())
- order_number: TEXT (Unique)
- user_id: UUID (Foreign Key → users.id)
- status: TEXT (pending, processing, shipped, delivered, cancelled)
- total_amount: NUMERIC (Not Null)
- shipping_address: JSONB
- payment_method: TEXT
- payment_status: TEXT
- notes: TEXT
- created_at: TIMESTAMP (Default: NOW())
- updated_at: TIMESTAMP (Default: NOW())
```

#### order_items
```sql
- id: UUID (Primary Key, Default: gen_random_uuid())
- order_id: UUID (Foreign Key → orders.id)
- product_id: UUID (Foreign Key → products.id)
- quantity: INTEGER (Not Null)
- price_at_purchase: NUMERIC (Not Null)
- created_at: TIMESTAMP (Default: NOW())
```

#### admin_audit_logs
```sql
- id: UUID (Primary Key, Default: gen_random_uuid())
- admin_id: UUID (Foreign Key → users.id)
- admin_email: TEXT
- action: TEXT (PRODUCT_CREATE, PRODUCT_UPDATE, etc.)
- details: JSONB
- ip_address: TEXT
- user_agent: TEXT
- created_at: TIMESTAMP (Default: NOW())
```

### Relationships
- **users → orders**: One-to-many (one user can have multiple orders)
- **orders → order_items**: One-to-many (one order can have multiple items)
- **products → order_items**: One-to-many (one product can be in multiple orders)
- **users → admin_audit_logs**: One-to-many (one admin can have multiple logs)

---

## Authentication System

### Overview
The authentication system uses Supabase Auth for user management with role-based access control (RBAC). Users can register, login, and access different features based on their admin status.

### Components

#### AuthProvider
Located: `src/components/auth/AuthProvider.jsx`

**Purpose**: Provides authentication context to the entire application

**Key Functions**:
- `signUp(email, password, metadata)`: Registers new user
  - Creates Supabase Auth user
  - Upserts user profile to `users` table
  - Automatically signs in after registration
  - Handles "User already registered" error gracefully

- `signIn(email, password)`: Authenticates existing user
  - Validates credentials with Supabase Auth
  - Ensures user profile exists in database
  - Handles network errors gracefully
  - Provides clear error messages

- `signOut()`: Logs out current user
  - Clears Supabase Auth session
  - Resets local state

- `updateProfile(updates)`: Updates user metadata
  - Updates Supabase Auth user data
  - Syncs with local state

**State Management**:
- `user`: Current authenticated user
- `loading`: Authentication loading state
- `isAdmin`: Admin status flag

#### LoginForm
Located: `src/components/forms/LoginForm.jsx`

**Purpose**: User login interface

**Features**:
- Email and password validation
- Real-time error display
- Loading state during authentication
- Redirect to dashboard on success

**Validation Rules**:
- Email: Required, valid email format
- Password: Required, minimum 6 characters

#### RegisterForm
Located: `src/components/forms/RegisterForm.jsx`

**Purpose**: New user registration

**Features**:
- First name, last name, email, password fields
- Form validation
- Admin role assignment (based on environment variable)
- Auto-login after registration

**Validation Rules**:
- All fields required
- Email: Valid format
- Password: Minimum 6 characters

### Security Features
- **Password Hashing**: Handled by Supabase Auth
- **Session Management**: Supabase Auth tokens
- **Role-Based Access**: Admin flag in users table
- **Protected Routes**: Components check admin status
- **Row Level Security**: Database-level access control

### Authentication Flow
1. User enters credentials
2. Form validation checks input
3. AuthProvider calls Supabase Auth API
4. Supabase validates credentials
5. User profile created/updated in database
6. Session established
7. User redirected to appropriate page

---

## Frontend Components

### App.jsx
Located: `src/App.jsx`

**Purpose**: Main application component containing all page components and routing

**Key Sections**:

#### 1. Product Data
```javascript
const PRODUCTS = [
  {
    id: 1,
    name: "Apex Predator X",
    slug: "apex-predator-x",
    tagline: "Uncompromising 4K gaming dominance",
    category: "Gaming PC",
    brand: "Apex",
    price: 3499,
    originalPrice: 3899,
    rating: 4.9,
    reviews: 214,
    badge: "Best Seller",
    specs: {
      cpu: "Intel Core i9-14900K",
      gpu: "NVIDIA RTX 4090 24GB",
      ram: "64GB DDR5-6000",
      storage: "2TB NVMe SSD + 4TB HDD"
    },
    highlights: [
      "Custom liquid cooling system",
      "RGB lighting with 16.8M colors",
      "Tempered glass side panel",
      "WiFi 6E + Bluetooth 5.3"
    ],
    color: "#e63946"
  },
  // ... more products
];
```

#### 2. Cart Context
```javascript
const CartContext = createContext(null);

function CartProvider({ children }) {
  const [items, dispatch] = useReducer(cartReducer, []);
  const total = items.reduce((s, i) => s + i.price * i.qty, 0);
  const count = items.reduce((s, i) => s + i.qty, 0);
  return (
    <CartContext.Provider value={{ items, dispatch, total, count }}>
      {children}
    </CartContext.Provider>
  );
}
```

#### 3. Hash Router
```javascript
function useRoute() {
  const [hash, setHash] = useState(window.location.hash || "#/");
  useEffect(() => {
    const handler = () => setHash(window.location.hash || "#/");
    window.addEventListener("hashchange", handler);
    return () => window.removeEventListener("hashchange", handler);
  }, []);
  const navigate = useCallback(path => { window.location.hash = path; }, []);
  return { hash, navigate };
}
```

#### 4. Global CSS
Comprehensive styling for:
- Navigation
- Product cards
- Forms
- Cart and checkout
- Admin dashboard
- Responsive layouts

#### 5. Page Components
- **HomePage**: Landing page with featured products and sections
- **ProductsPage**: Product catalog with search and filters
- **ProductDetailPage**: Individual product page with specs and purchase options
- **CartPage**: Shopping cart with quantity management
- **CheckoutPage**: Multi-step checkout process
- **AboutPage**: Company information
- **ContactPage**: Contact form and information
- **FAQPage**: Frequently asked questions
- **LoginForm**: User authentication
- **RegisterForm**: User registration
- **UserDashboard**: User account management
- **AdminDashboard**: Admin control panel

### ProductCard Component
**Purpose**: Display product information in a card format

**Features**:
- Product image (first letter of name)
- Category and brand display
- Key specifications (CPU, GPU, RAM, Storage)
- Price with original price comparison
- Rating and reviews
- Add to cart button
- Click to view details

**Props**:
- `product`: Product object
- `navigate`: Navigation function
- `addToast`: Toast notification function

### Navbar Component
**Purpose**: Main navigation bar

**Features**:
- Logo and brand name
- Navigation links (Home, Products, About, FAQ, Contact)
- Cart button with item count badge
- Responsive design

---

## Admin Dashboard

### Overview
The admin dashboard provides comprehensive management capabilities for store administrators. It includes analytics, product management, order tracking, user management, and security features.

### Located
`src/AdminDashboard.jsx`

### Key Features

#### 1. Dashboard Tab
**Analytics Overview**:
- Total orders count
- Total revenue (DZD)
- Today's revenue
- Product count
- Total users
- Pending orders

**Charts**:
- Revenue & Orders Trend (Area chart)
- Products by Category (Pie chart)

**Recent Activity**:
- Latest orders with status
- Customer email and order amount

#### 2. Products Tab
**Inventory Management**:
- Product list with search and filters
- Add new product with image upload
- Edit existing products
- Delete products
- Quick stock updates
- Toggle featured status

**Product Form Fields**:
- Product Name
- Slug (URL-friendly identifier)
- Price (DZD)
- Original Price (DZD)
- Stock Quantity
- Category
- Brand
- Badge (optional)
- Product Image (file upload)
- Description
- Featured checkbox
- Active checkbox

**Filters**:
- All Products
- Low Stock (<10)
- Out of Stock
- Featured

#### 3. Orders Tab
**Order Management**:
- Order list with details
- Status updates (pending, processing, shipped, delivered, cancelled)
- Order details modal
- Export orders to JSON

**Order Information**:
- Order number
- Customer email
- Total amount
- Status
- Created date

#### 4. Clients Tab
**User Management**:
- User list with search
- Filter by admin/customers
- Toggle admin privileges
- Export users to JSON

**User Information**:
- Email
- Name
- Admin status
- Created date

#### 5. Analytics Tab
**Advanced Analytics**:
- Sales trends over time
- Category performance
- Inventory alerts
- Revenue breakdown

#### 6. Security Tab
**Security Features**:
- Audit log of admin actions
- Action tracking (create, update, delete)
- Admin identification
- Timestamp and IP logging

### Admin Dashboard State
```javascript
const [activeTab, setActiveTab] = useState('dashboard');
const [products, setProducts] = useState([]);
const [orders, setOrders] = useState([]);
const [users, setUsers] = useState([]);
const [stats, setStats] = useState(null);
const [loading, setLoading] = useState(false);
const [showProductForm, setShowProductForm] = useState(false);
const [editingProduct, setEditingProduct] = useState(null);
const [formData, setFormData] = useState({});
```

### Key Functions

#### loadDashboard()
Loads all dashboard data:
- Order statistics
- All orders
- All products
- All users
- Generates analytics data
- Checks inventory alerts
- Loads audit logs

#### handleProductSubmit()
Creates or updates products:
- Validates required fields
- Calls database API
- Logs admin action
- Shows success/error toast
- Reloads dashboard

#### toggleProductFeature()
Toggles product featured status:
- Updates product in database
- Logs action
- Shows notification

#### updateOrderStatus()
Updates order status:
- Changes order status
- Sends notification email
- Logs action
- Shows notification

#### toggleUserAdmin()
Toggles user admin privileges:
- Updates user in database
- Logs action
- Shows confirmation

### Security Features
- Admin access check on load
- Action logging for all changes
- IP address tracking
- User agent logging
- Confirmation dialogs for destructive actions

---

## Shopping Cart System

### Overview
The shopping cart system allows users to add products to a virtual cart, manage quantities, and proceed to checkout. It uses React Context for state management.

### Cart Context
Located: `src/App.jsx` (CartProvider section)

**State**:
- `items`: Array of cart items
- `total`: Total price of all items
- `count`: Total quantity of all items

**Actions**:
- `ADD`: Add product to cart (increment quantity if exists)
- `REMOVE`: Remove product from cart
- `SET_QTY`: Set specific quantity for product
- `CLEAR`: Empty the cart

### Cart Reducer
```javascript
function cartReducer(state, action) {
  switch (action.type) {
    case "ADD": {
      const existing = state.find(i => i.id === action.product.id);
      if (existing) return state.map(i => i.id === action.product.id ? { ...i, qty: i.qty + 1 } : i);
      return [...state, { ...action.product, qty: 1 }];
    }
    case "REMOVE":  return state.filter(i => i.id !== action.id);
    case "SET_QTY": return state.map(i => i.id === action.id ? { ...i, qty: Math.max(1, action.qty) } : i);
    case "CLEAR":   return [];
    default:        return state;
  }
}
```

### CartPage Component
**Purpose**: Display and manage shopping cart

**Features**:
- List of cart items with product details
- Quantity adjustment (+/- buttons)
- Remove item button
- Price calculation per item
- Order summary with:
  - Subtotal
  - Shipping (free over 2000 DZD)
  - Tax (8%)
  - Total
- Free shipping threshold indicator
- Proceed to checkout button
- Continue shopping button

**Calculations**:
```javascript
const shipping = total > 2000 ? 0 : 49;
const tax = Math.round(total * 0.08);
const grandTotal = total + shipping + tax;
```

### CheckoutPage Component
**Purpose**: Multi-step checkout process

**Steps**:
1. **Shipping Info**: Collect customer address and contact details
2. **Payment**: Payment information (mock checkout)
3. **Success**: Order confirmation

**Form Fields**:
- First Name
- Last Name
- Email
- Phone
- Address
- City
- State
- ZIP Code
- Cardholder Name
- Card Number
- Expiry (MM/YY)
- CVV

**Features**:
- Step indicator
- Form validation
- Order summary sidebar
- Mock payment processing
- Order confirmation with order number
- Clear cart after successful order

---

## Product Management

### Product Data Structure
```javascript
{
  id: 1,
  name: "Apex Predator X",
  slug: "apex-predator-x",
  tagline: "Uncompromising 4K gaming dominance",
  category: "Gaming PC",
  brand: "Apex",
  price: 3499,
  originalPrice: 3899,
  rating: 4.9,
  reviews: 214,
  badge: "Best Seller",
  specs: {
    cpu: "Intel Core i9-14900K",
    gpu: "NVIDIA RTX 4090 24GB",
    ram: "64GB DDR5-6000",
    storage: "2TB NVMe SSD + 4TB HDD"
  },
  highlights: [
    "Custom liquid cooling system",
    "RGB lighting with 16.8M colors",
    "Tempered glass side panel",
    "WiFi 6E + Bluetooth 5.3"
  ],
  color: "#e63946"
}
```

### Categories
- Gaming PC
- Workstation
- Mini PC
- Office PC

### Brands
- Apex
- Volt
- Stealth
- Titan
- Nova

### Product Display
**ProductCard**: Compact card for product lists
**ProductDetailPage**: Full product page with:
- Large product visual
- Complete specifications table
- Highlights list
- Rating and reviews
- Price with savings calculation
- Quantity selector
- Add to cart button
- Buy now button

### Product Filtering
**FilterPanel Component**:
- Category filter
- Brand filter
- Price range filter
- Featured filter
- Stock filter

**Sorting Options**:
- Featured
- Price: Low to High
- Price: High to Low
- Top Rated

---

## Search and Filtering

### SearchBar Component
Located: `src/components/search/SearchBar.jsx`

**Purpose**: Real-time product search

**Features**:
- Text input for search queries
- Real-time filtering
- Search icon
- Clear search button

**Search Logic**:
- Searches product name
- Searches category
- Searches brand
- Case-insensitive matching

### FilterPanel Component
Located: `src/components/search/FilterPanel.jsx`

**Purpose**: Advanced product filtering

**Filters**:
- **Category**: Gaming PC, Workstation, Mini PC, Office PC
- **Brand**: Apex, Volt, Stealth, Titan, Nova
- **Price Range**: Min and max price sliders
- **Featured**: Show only featured products
- **In Stock**: Show only available products

**Features**:
- Collapsible filter sections
- Active filter indicators
- Clear all filters button
- Filter count display

### Combined Search & Filter
```javascript
const filteredProducts = products.filter(p => {
  const matchesSearch = searchQuery === '' || 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.brand.toLowerCase().includes(searchQuery.toLowerCase());
  
  const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
  const matchesBrand = selectedBrand === 'All' || p.brand === selectedBrand;
  const matchesPrice = p.price >= minPrice && p.price <= maxPrice;
  const matchesFeatured = !showFeaturedOnly || p.badge;
  const matchesStock = !inStockOnly || p.stock > 0;
  
  return matchesSearch && matchesCategory && matchesBrand && matchesPrice && matchesFeatured && matchesStock;
});
```

---

## UI Components

### AnimatedCard
Located: `src/components/ui/AnimatedCard.jsx`

**Purpose**: Card component with hover animations

**Props**:
- `children`: Card content
- `hoverScale`: Scale on hover (default: 1.02)
- `hoverElevation`: Elevation on hover (default: 8)
- `glowColor`: Glow effect color
- `style`: Additional styles

**Features**:
- Smooth scale transition
- Elevation shadow on hover
- Optional glow effect
- Custom styling support

### ShinyButton
Located: `src/components/ui/ShinyButton.jsx`

**Purpose**: Animated button with shine effect

**Props**:
- `children`: Button text
- `onClick`: Click handler
- `disabled`: Disabled state
- `style`: Additional styles

**Features**:
- Shine animation on hover
- Ripple effect on click
- Disabled state styling
- Custom styling support

### FadeContent
Located: `src/components/ui/FadeContent.jsx`

**Purpose**: Fade-in animation for content

**Props**:
- `children`: Content to animate
- `delay`: Animation delay in ms (default: 0)
- `duration`: Animation duration in ms (default: 600)

**Features**:
- Smooth fade-in animation
- Configurable delay
- Staggered animations for lists

### CountUp
Located: `src/components/ui/CountUp.jsx`

**Purpose**: Animated number counter

**Props**:
- `end`: Target number
- `duration`: Animation duration (default: 2000)
- `decimals`: Decimal places (default: 0)

**Features**:
- Smooth number animation
- Configurable duration
- Decimal support

### TiltCard
Located: `src/components/ui/TiltCard.jsx`

**Purpose**: 3D tilt effect on mouse move

**Props**:
- `children`: Card content
- `maxTilt`: Maximum tilt angle (default: 10)

**Features**:
- 3D perspective effect
- Mouse tracking
- Smooth transitions
- Reset on mouse leave

### GradientText
Located: `src/components/ui/GradientText.jsx`

**Purpose**: Text with gradient color

**Props**:
- `children`: Text content
- `colors`: Array of gradient colors
- `style`: Additional styles

**Features**:
- Linear gradient text
- Custom color stops
- Smooth color transitions

### MagnetButton
Located: `src/components/ui/MagnetButton.jsx`

**Purpose**: Button with magnetic pull effect

**Props**:
- `children`: Button content
- `onClick`: Click handler
- `strength`: Magnetic strength (default: 30)

**Features**:
- Magnetic pull on hover
- Smooth animation
- Configurable strength

### SplitText
Located: `src/components/ui/SplitText.jsx`

**Purpose**: Text with character/word splitting for animation

**Props**:
- `children`: Text content
- `type`: Split type ('char' or 'word')
- `delay`: Stagger delay

**Features**:
- Character-level splitting
- Word-level splitting
- Staggered animations

### TextRotate
Located: `src/components/ui/TextRotate.jsx`

**Purpose**: Rotating text animation

**Props**:
- `words`: Array of words to rotate
- `interval`: Rotation interval (default: 3000)

**Features**:
- Automatic word rotation
- Fade transition
- Configurable timing

---

## Deployment

### Netlify Deployment

#### Configuration
Located: `netlify.toml`

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

#### Environment Variables
Required environment variables in Netlify:
- `VITE_SUPABASE_URL`: Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Supabase anonymous key

#### Build Process
1. Push code to GitHub
2. Netlify automatically builds on push
3. Vite builds production bundle
4. Files deployed to Netlify CDN
5. SPA routing configured via redirects

#### Deployment Steps
1. Connect Netlify to GitHub repository
2. Configure build settings
3. Add environment variables
4. Deploy automatically on push

### Local Development

#### Prerequisites
- Node.js 16+
- npm or yarn

#### Setup
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

#### Environment Setup
1. Copy `.env.example` to `.env.local`
2. Add Supabase credentials
3. Restart development server

---

## Configuration

### Environment Variables

#### Required Variables
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

#### Optional Variables
```env
VITE_ADMIN_EMAIL=admin@example.com
```

### Vite Configuration
Located: `vite.config.js`

```javascript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true
  }
});
```

### Package.json Scripts
```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "lint": "eslint src --ext js,jsx --report-unused-disable-directives --max-warnings 0"
  }
}
```

---

## API Integration

### Supabase Client
Located: `src/lib/supabase.js`

**Initialization**:
```javascript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

### Database Functions

#### Product Operations
```javascript
// Get all products
export async function getAllProducts() {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });
  return { data, error };
}

// Create product
export async function createProduct(product) {
  const { data, error } = await supabase
    .from('products')
    .insert([product])
    .select()
    .single();
  return { data, error };
}

// Update product
export async function updateProduct(id, updates) {
  const { data, error } = await supabase
    .from('products')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  return { data, error };
}

// Delete product
export async function deleteProduct(id) {
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id);
  return { error };
}
```

#### Order Operations
```javascript
// Create order
export async function createOrder(order) {
  const { data, error } = await supabase
    .from('orders')
    .insert([order])
    .select()
    .single();
  return { data, error };
}

// Get all orders
export async function getAllOrders() {
  const { data, error } = await supabase
    .from('orders')
    .select('*, users(email, first_name, last_name)')
    .order('created_at', { ascending: false });
  return { data, error };
}

// Update order status
export async function updateOrderStatus(orderId, status, notes) {
  const { data, error } = await supabase
    .from('orders')
    .update({ status, notes })
    .eq('id', orderId)
    .select()
    .single();
  return { data, error };
}
```

#### User Operations
```javascript
// Check admin role
export async function checkAdminRole(userId) {
  const { data, error } = await supabase
    .from('users')
    .select('is_admin')
    .eq('id', userId)
    .single();
  return { isAdmin: data?.is_admin || false, error };
}

// Get all users
export async function getAllUsers() {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: false });
  return { data, error };
}
```

### Error Handling
All API functions return:
```javascript
{
  data: result,
  error: errorObject
}
```

Error handling pattern:
```javascript
const { data, error } = await db.someFunction();
if (error) {
  console.error('Error:', error);
  // Handle error
}
// Use data
```

---

## Security Features

### Authentication Security
- **Password Hashing**: Supabase Auth handles password hashing
- **Session Tokens**: JWT tokens for session management
- **Secure Storage**: Tokens stored in browser localStorage
- **Auto-logout**: Token expiration handling

### Database Security
- **Row Level Security (RLS)**: Database-level access control
- **Service Role Key**: Admin operations use elevated privileges
- **Foreign Key Constraints**: Data integrity enforcement
- **Unique Constraints**: Prevent duplicate data

### API Security
- **Anon Key**: Public API key with limited permissions
- **Service Role Key**: Admin API key with full permissions
- **Environment Variables**: Secrets never exposed in client code
- **CORS**: Cross-origin resource sharing configured

### Admin Security
- **Role-Based Access**: Admin-only features protected
- **Audit Logging**: All admin actions logged
- **IP Tracking**: Admin action IP addresses recorded
- **Confirmation Dialogs**: Destructive actions require confirmation

### Client-Side Security
- **Input Validation**: Form validation before submission
- **XSS Prevention**: React's built-in XSS protection
- **CSRF Protection**: Supabase Auth handles CSRF
- **Secure Routes**: Protected components check authentication

### Best Practices
1. Never commit `.env.local` to version control
2. Use strong passwords for admin accounts
3. Regularly rotate API keys
4. Monitor audit logs for suspicious activity
5. Keep dependencies updated
6. Use HTTPS in production
7. Implement rate limiting (Supabase handles this)
8. Regular security audits

---

## Performance Optimization

### Code Splitting
- Dynamic imports for large components
- Route-based code splitting (future enhancement)

### Image Optimization
- Product images stored as base64 (current implementation)
- Future: Implement Supabase Storage for images
- Future: Image compression and CDN

### Caching Strategy
- React Context for state management
- Local state for component-specific data
- Future: Implement React Query for server state caching

### Bundle Optimization
- Vite's automatic code splitting
- Tree shaking removes unused code
- Minification in production builds

### Lazy Loading
- Future: Implement React.lazy for components
- Future: Intersection Observer for infinite scroll

---

## Accessibility

### Keyboard Navigation
- All interactive elements keyboard accessible
- Tab order logical and consistent
- Focus indicators visible

### Screen Reader Support
- Semantic HTML elements
- ARIA labels where needed
- Alt text for images

### Color Contrast
- WCAG AA compliant color ratios
- High contrast text on dark backgrounds
- Color not used as only indicator

### Responsive Design
- Mobile-first approach
- Touch-friendly targets (44px minimum)
- Readable font sizes (16px minimum)

---

## Browser Compatibility

### Supported Browsers
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

### Polyfills
- Vite handles most polyfills automatically
- No additional polyfills required

### Progressive Enhancement
- Core functionality works without JavaScript
- Enhanced experience with JavaScript enabled

---

## Future Enhancements

### Planned Features
1. **Wishlist**: Save products for later
2. **Product Reviews**: User-submitted reviews
3. **Order Tracking**: Real-time order status updates
4. **Email Notifications**: Order confirmations and updates
5. **Payment Integration**: Stripe or PayPal integration
6. **Product Comparison**: Compare multiple products
7. **Advanced Search**: Full-text search with filters
8. **Multi-language Support**: Arabic and French for Algeria
9. **Dark/Light Mode**: Theme toggle
10. **Product Recommendations**: AI-powered suggestions

### Technical Improvements
1. **TypeScript Migration**: Add type safety
2. **Testing**: Unit and integration tests
3. **CI/CD Pipeline**: Automated testing and deployment
4. **Performance Monitoring**: Track Core Web Vitals
5. **Error Tracking**: Sentry integration
6. **Analytics**: User behavior tracking

---

## Troubleshooting

### Common Issues

#### Authentication Not Working
**Problem**: Users can't sign up or log in
**Solutions**:
1. Check Supabase URL and anon key in `.env.local`
2. Verify email confirmation settings in Supabase
3. Check browser console for errors
4. Ensure users table exists in database

#### Cart Not Adding Items
**Problem**: Clicking "Add to Cart" doesn't work
**Solutions**:
1. Check browser console for errors
2. Verify CartProvider wraps the app
3. Check product data structure
4. Ensure dispatch function is called correctly

#### Admin Dashboard Not Loading
**Problem**: Admin dashboard shows access denied
**Solutions**:
1. Verify user has `is_admin: true` in users table
2. Check admin role check function
3. Ensure user is logged in
4. Check Supabase RLS policies

#### Images Not Displaying
**Problem**: Product images don't show
**Solutions**:
1. Check image_url field in database
2. Verify image format is supported
3. Check browser console for 404 errors
4. Ensure image data is valid base64

#### Deployment Issues
**Problem**: Site not deploying correctly
**Solutions**:
1. Check Netlify build logs
2. Verify environment variables in Netlify
3. Ensure build command is correct
4. Check for runtime errors in production

---

## Support and Maintenance

### Regular Maintenance Tasks
1. Update dependencies monthly
2. Review and update security patches
3. Monitor database performance
4. Check audit logs for suspicious activity
5. Backup database regularly (Supabase handles this)
6. Review and optimize slow queries
7. Update documentation as features change

### Monitoring
- Supabase dashboard for database metrics
- Netlify analytics for site performance
- Browser console for client-side errors
- Audit logs for admin activity

### Backup Strategy
- Supabase automatic daily backups
- Point-in-time recovery available
- Export data regularly for additional backup

---

## Conclusion

Apex Store is a comprehensive e-commerce platform built with modern web technologies. It provides a complete solution for selling high-performance computers in the Algerian market, with features like user authentication, product management, order tracking, and admin controls.

The platform is designed to be scalable, secure, and maintainable, with a focus on user experience and performance. The modular architecture allows for easy expansion and customization, while the comprehensive admin dashboard provides full control over store operations.

For questions or issues, refer to the troubleshooting section or consult the code documentation in the guide.md file.
