# Apex Store - Beginner's Guide to the Codebase

## Table of Contents
1. [Introduction](#introduction)
2. [Project Structure Overview](#project-structure-overview)
3. [Entry Points](#entry-points)
4. [Main Application File](#main-application-file)
5. [Authentication System](#authentication-system)
6. [Admin Dashboard](#admin-dashboard)
7. [UI Components](#ui-components)
8. [Form Components](#form-components)
9. [Search Components](#search-components)
10. [Database Integration](#database-integration)
11. [Configuration Files](#configuration-files)
12. [How to Run the Project](#how-to-run-the-project)
13. [Common Patterns](#common-patterns)
14. [Troubleshooting](#troubleshooting)

---

## Introduction

Welcome to the Apex Store codebase! This guide is designed for beginners who want to understand how this e-commerce website works. We'll walk through each file and explain what it does in simple terms.

### What This Project Does
Apex Store is a website where people can buy computers. Users can:
- Browse different types of computers (gaming, workstation, mini PC, office PC)
- Add computers to their shopping cart
- Create an account
- Place orders
- (If they're an admin) manage products, orders, and users

### Technologies Used
- **React**: A JavaScript library for building user interfaces
- **Vite**: A tool that helps us build and run the project quickly
- **Supabase**: A backend service that handles our database and authentication
- **JavaScript**: The programming language we use

---

## Project Structure Overview

```
apex-store/
├── public/              # Static files (images, fonts, etc.)
├── src/                 # All our source code
│   ├── components/      # Reusable pieces of UI
│   │   ├── auth/       # Login and signup components
│   │   ├── forms/      # Form components
│   │   ├── search/     # Search and filter components
│   │   └── ui/         # Basic UI elements (buttons, cards)
│   ├── lib/            # Helper functions and database connections
│   ├── App.jsx         # The main application file
│   ├── index.js        # React entry point
│   ├── main.jsx        # Vite entry point
│   └── index.css       # Global styles
├── .env.local          # Secret configuration (API keys, etc.)
├── package.json        # Lists all the libraries we use
├── vite.config.js      # Vite configuration
└── netlify.toml        # Deployment configuration
```

---

## Entry Points

### index.html
**Location**: `index.html`

**What it does**: This is the HTML file that loads in the browser. It's very simple - it just has a `div` with id="root" where our React app will be inserted.

**Key parts**:
```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Apex Store</title>
  </head>
  <body>
    <div id="root"></div>  <!-- React will put our app here -->
    <script type="module" src="/src/main.jsx"></script>  <!-- Load our app -->
  </body>
</html>
```

### main.jsx
**Location**: `src/main.jsx`

**What it does**: This is the first JavaScript file that runs. It tells React to render our App component into the HTML page.

**Code explained**:
```javascript
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Find the <div id="root"> element in index.html
const root = ReactDOM.createRoot(document.getElementById('root'));

// Put our App component inside that div
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

**Simple explanation**: 
1. We import React and ReactDOM (tools for building web apps)
2. We import our main App component
3. We find the empty div in the HTML
4. We put our App inside that div

### index.js
**Location**: `src/index.js`

**What it does**: This is an alternative entry point. It does the same thing as main.jsx but uses a slightly different syntax.

---

## Main Application File

### App.jsx
**Location**: `src/App.jsx`

**What it does**: This is the most important file! It contains almost all of our application's pages and components.

**Main sections in App.jsx**:

#### 1. Product Data (Lines 1-140)
```javascript
const PRODUCTS = [
  {
    id: 1,
    name: "Apex Predator X",
    price: 3499,
    category: "Gaming PC",
    // ... more product details
  },
  // ... more products
];
```

**What this is**: A list of all the computers we sell. Each product has information like name, price, category, specifications, etc.

#### 2. Cart Context (Lines 144-174)
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

**What this does**: 
- Creates a "shopping cart" that can be accessed from anywhere in the app
- Keeps track of what items are in the cart
- Calculates the total price and total number of items
- Uses a "reducer" pattern to handle cart actions (add, remove, update quantity)

**Simple explanation**: Think of this as a global shopping cart that every page can access and modify.

#### 3. Hash Router (Lines 176-188)
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

**What this does**: 
- Handles navigation between pages
- Uses "hash routing" (like `#/products`, `#/cart`)
- Listens for URL changes
- Provides a `navigate` function to change pages

**Simple explanation**: This is how we move between different pages without reloading the browser.

#### 4. Global CSS (Lines 190-447)
**What this does**: Contains all the styling for the website. It's written in a JavaScript string and injected into the page.

**Key styles**:
- Navigation bar styles
- Product card styles
- Form styles
- Cart and checkout styles
- Admin dashboard styles
- Responsive design (mobile-friendly)

#### 5. Shared Components (Lines 449-539)

**Toast Component**:
```javascript
function Toast({ toasts }) {
  return (
    <div className="toast-wrap">
      {toasts.map(t => <div key={t.id} className="toast">{t.msg}</div>)}
    </div>
  );
}
```
**What it does**: Shows notification messages (like "Added to cart!") that appear at the bottom of the screen.

**Stars Component**:
```javascript
function Stars({ rating }) {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  return (
    <span style={{ color: "var(--gold)" }}>
      {"★".repeat(full)}{half ? "½" : ""}{"☆".repeat(5 - full - (half ? 1 : 0))}
    </span>
  );
}
```
**What it does**: Displays star ratings (like 4.5 stars) using star characters.

**Navbar Component**:
```javascript
function Navbar({ navigate, hash }) {
  const { count } = useCart();
  return (
    <nav className="nav">
      <div className="container nav-inner">
        <button className="nav-logo" onClick={() => navigate("#/")}>APEX<span>SYS</span></button>
        <div className="nav-links">
          {[["#/", "Home"], ["#/products", "Products"], ["#/about", "About"], ["#/faq", "FAQ"], ["#/contact", "Contact"]].map(([path, label]) => (
            <button key={path} className={`nav-link${hash === path ? " active" : ""}`} onClick={() => navigate(path)}>
              {label}
            </button>
          ))}
        </div>
        <button className="cart-btn" onClick={() => navigate("#/cart")}>
          Cart {count > 0 && <span className="cart-badge">{count}</span>}
        </button>
      </div>
    </nav>
  );
}
```
**What it does**: The navigation bar at the top of the page with links to different sections and the cart button.

**Footer Component**:
```javascript
function Footer() {
  return (
    <footer className="footer">
      {/* Footer content with links and social media */}
    </footer>
  );
}
```
**What it does**: The footer at the bottom of the page with links and company information.

#### 6. Product Card Component (Lines 540-604)
```javascript
function ProductCard({ product: p, navigate, addToast }) {
  const { dispatch } = useCart();
  function handleAdd(e) {
    e.preventDefault();
    e.stopPropagation();
    dispatch({ type: "ADD", product: p });
    addToast(`${p.name} added to cart!`);
  }
  return (
    {/* Product card UI */}
  );
}
```
**What it does**: Displays a single product in a card format with:
- Product name and category
- Price
- Specifications (CPU, GPU, RAM, Storage)
- Rating
- "Add to Cart" button

#### 7. Page Components (Lines 606-1672)

**HomePage** (Lines 610-915):
```javascript
function HomePage({ navigate, addToast }) {
  return (
    <div className="page">
      {/* Hero section */}
      {/* Featured products */}
      {/* Product categories */}
      {/* Testimonials */}
      {/* Newsletter signup */}
      {/* Call to action */}
    </div>
  );
}
```
**What it does**: The landing page with:
- Hero section (main banner)
- Featured products
- Product categories with pricing
- Customer testimonials
- Newsletter signup form
- Call to action sections

**ProductsPage** (Lines 917-1040):
```javascript
function ProductsPage({ navigate, addToast }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedBrand, setSelectedBrand] = useState('All');
  const [sort, setSort] = useState('featured');
  // ... filtering logic
  return (
    <div className="page">
      {/* Search bar */}
      {/* Filter panel */}
      {/* Product grid */}
    </div>
  );
}
```
**What it does**: The products catalog page with:
- Search functionality
- Category and brand filters
- Price range filter
- Sorting options
- Grid of product cards

**ProductDetailPage** (Lines 1042-1143):
```javascript
function ProductDetailPage({ slug, navigate, addToast }) {
  const product = PRODUCTS.find(p => p.slug === slug);
  const { dispatch } = useCart();
  const [qty, setQty] = useState(1);
  // ... product detail logic
  return (
    <div className="page">
      {/* Product image */}
      {/* Product information */}
      {/* Specifications table */}
      {/* Add to cart */}
    </div>
  );
}
```
**What it does**: Individual product page with:
- Large product display
- Complete specifications
- Price and savings
- Quantity selector
- Add to cart button

**CartPage** (Lines 1145-1217):
```javascript
function CartPage({ navigate }) {
  const { items, dispatch, total } = useCart();
  const shipping = total > 2000 ? 0 : 49;
  const tax = Math.round(total * 0.08);
  // ... cart logic
  return (
    <div className="page">
      {/* Cart items list */}
      {/* Order summary */}
      {/* Checkout button */}
    </div>
  );
}
```
**What it does**: Shopping cart page with:
- List of items in cart
- Quantity adjustment
- Remove items
- Price calculation
- Shipping and tax
- Proceed to checkout button

**CheckoutPage** (Lines 1219-1358):
```javascript
function CheckoutPage({ navigate }) {
  const { items, total, dispatch } = useCart();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ /* form fields */ });
  // ... checkout logic
  return (
    <div className="page">
      {/* Step indicator */}
      {/* Shipping form */}
      {/* Payment form */}
      {/* Order confirmation */}
    </div>
  );
}
```
**What it does**: Multi-step checkout with:
- Shipping information form
- Payment information form (mock)
- Order summary
- Success confirmation

**AboutPage** (Lines 1360-1440):
```javascript
function AboutPage({ navigate }) {
  return (
    <div className="page">
      {/* Company information */}
      {/* Mission statement */}
      {/* Statistics */}
      {/* Team section */}
    </div>
  );
}
```
**What it does**: About page with company information and statistics.

**ContactPage** (Lines 1442-1510):
```javascript
function ContactPage({ navigate, addToast }) {
  const [formData, setFormData] = useState({ /* form fields */ });
  // ... contact form logic
  return (
    <div className="page">
      {/* Contact information */}
      {/* Contact form */}
      {/* Map placeholder */}
    </div>
  );
}
```
**What it does**: Contact page with form and company contact information.

**FAQPage** (Lines 1512-1570):
```javascript
function FAQPage({ navigate }) {
  const [openIndex, setOpenIndex] = useState(null);
  // ... FAQ logic
  return (
    <div className="page">
      {/* FAQ accordion */}
      {/* Common questions */}
    </div>
  );
}
```
**What it does**: FAQ page with accordion-style questions and answers.

**LoginForm** (Lines 1572-1630):
```javascript
function LoginForm() {
  const { signIn } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });
  // ... login logic
  return (
    {/* Login form */}
  );
}
```
**What it does**: User login form with email and password fields.

**RegisterForm** (Lines 1632-1700):
```javascript
function RegisterForm() {
  const { signUp } = useAuth();
  const [formData, setFormData] = useState({ /* form fields */ });
  // ... registration logic
  return (
    {/* Registration form */}
  );
}
```
**What it does**: User registration form with name, email, and password fields.

**UserDashboard** (Lines 1702-1760):
```javascript
function UserDashboard() {
  const { user, signOut } = useAuth();
  // ... dashboard logic
  return (
    <div className="page">
      {/* User information */}
      {/* Order history */}
      {/* Account settings */}
    </div>
  );
}
```
**What it does**: User account dashboard with order history and settings.

**AdminDashboard** (Lines 1762-1780):
```javascript
function AdminDashboard() {
  // This is imported from a separate file
  return <AdminDashboard />;
}
```
**What it does**: Redirects to the separate AdminDashboard component.

#### 8. Main App Component (Lines 1782-1810)
```javascript
function App() {
  const { hash, navigate } = useRoute();
  const [toasts, setToasts] = useState([]);
  const addToast = (msg) => {
    const id = Date.now();
    setToasts([...toasts, { id, msg }]);
    setTimeout(() => setToasts(toasts.filter(t => t.id !== id)), 3000);
  };

  // Routing logic
  let page;
  if (hash === "#/" || hash === "" || hash === "#") page = <HomePage navigate={navigate} addToast={addToast} />;
  else if (hash === "#/products") page = <ProductsPage navigate={navigate} addToast={addToast} />;
  // ... more routes

  return (
    <AuthProvider>
      <CartProvider>
        <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
          <Navbar navigate={navigate} hash={hash} />
          {page}
          <Footer />
          <Toast toasts={toasts} />
        </div>
      </CartProvider>
    </AuthProvider>
  );
}
```

**What this does**:
- Wraps the entire app with AuthProvider and CartProvider
- Handles routing based on URL hash
- Shows Navbar, the current page, Footer, and Toast notifications

---

## Authentication System

### AuthProvider.jsx
**Location**: `src/components/auth/AuthProvider.jsx`

**What it does**: Manages user authentication (login, signup, logout) and provides authentication state to the entire app.

**Key parts**:

#### 1. Context Creation (Lines 4-10)
```javascript
const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
```
**What this does**: Creates a "context" that allows any component to access authentication state and functions.

#### 2. AuthProvider Component (Lines 12-36)
```javascript
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    checkUser();
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      // Handle authentication state changes
    });
    return () => authListener.subscription.unsubscribe();
  }, []);
  // ... authentication functions
};
```
**What this does**:
- Keeps track of the current user
- Checks if user is logged in
- Listens for authentication changes (login, logout)
- Provides authentication functions to children

#### 3. Authentication Functions

**signUp function** (Lines 91-155):
```javascript
const signUp = async (email, password, metadata) => {
  try {
    // Create user in Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: metadata },
    });

    // Handle "User already registered" error
    if (error && error.message !== 'User already registered') {
      throw error;
    }

    // Get user ID
    let userId;
    if (data?.user) {
      userId = data.user.id;
    } else {
      const { data: { user: existingUser } } = await supabase.auth.getUser();
      if (existingUser) {
        userId = existingUser.id;
      }
    }

    // Create/update user profile in database
    if (userId) {
      const profilePayload = {
        id: userId,
        email,
        first_name: metadata.first_name || '',
        last_name: metadata.last_name || '',
        is_admin: metadata.is_admin || false,
      };
      const client = supabaseAdmin || supabase;
      await client.from('users').upsert(profilePayload);

      // Automatically sign in
      const { data: signInData } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      return signInData;
    }

    return data;
  } catch (err) {
    console.error('Sign up error:', err);
    throw err;
  }
};
```

**What this does**:
1. Creates a new user account in Supabase Auth
2. Creates a user profile in our database
3. Automatically signs the user in after registration
4. Handles the case where the user already exists

**signIn function** (Lines 157-191):
```javascript
const signIn = async (email, password) => {
  try {
    // Sign in with Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      // Handle specific errors
      if (error.status === 422) {
        throw new Error('Please confirm your email address before signing in.');
      }
      if (error.message?.includes('Failed to fetch')) {
        throw new Error('Network error. Please check your internet connection.');
      }
      throw error;
    }

    if (!data?.user) {
      throw new Error('Sign in failed. Please check your credentials.');
    }

    // Ensure user profile exists in database
    await ensureUserProfile(data.user);
    return data;
  } catch (err) {
    console.error('Sign in error:', err);
    throw err;
  }
};
```

**What this does**:
1. Validates user credentials with Supabase Auth
2. Ensures user profile exists in our database
3. Provides clear error messages for common issues

**signOut function** (Lines 193-197):
```javascript
const signOut = async () => {
  await supabase.auth.signOut();
  setUser(null);
  setIsAdmin(false);
};
```
**What this does**: Logs the user out and clears their session.

**ensureUserProfile function** (Lines 54-90):
```javascript
const ensureUserProfile = async (user) => {
  if (!user?.id) return;

  try {
    // Check if user profile exists
    const { data: existingProfile, error: existingError } = await supabase
      .from('users')
      .select('id')
      .eq('id', user.id)
      .single();

    // If profile doesn't exist, create it
    if (!existingProfile) {
      const profilePayload = {
        id: user.id,
        email: user.email || '',
        first_name: user.user_metadata?.first_name || '',
        last_name: user.user_metadata?.last_name || '',
        is_admin: false,
      };

      const client = supabaseAdmin || supabase;
      await client.from('users').upsert(profilePayload);
    }
  } catch (err) {
    console.error('Unexpected error ensuring user profile:', err);
  }
};
```

**What this does**: Ensures every authenticated user has a profile in our database. If not, it creates one.

#### 4. ProtectedRoute Component (Lines 221-254)
```javascript
export const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { user, loading, isAdmin } = useAuth();

  if (loading) {
    return <div style={{ padding: '60px', textAlign: 'center', color: '#666' }}>Loading...</div>;
  }

  if (!user) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0a0f' }}>
        <div style={{ textAlign: 'center', padding: '40px', background: '#1a1a2e', borderRadius: '12px', border: '1px solid #333' }}>
          <h2 style={{ fontSize: '24px', marginBottom: '20px' }}>Authentication Required</h2>
          <p style={{ color: '#666', marginBottom: '20px' }}>Please sign in to access this page</p>
          <a href="#/login" style={{ color: '#e63946', textDecoration: 'none' }}>Go to Login</a>
        </div>
      </div>
    );
  }

  if (requireAdmin && !isAdmin) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0a0f' }}>
        <div style={{ textAlign: 'center', padding: '40px', background: '#1a1a2e', borderRadius: '12px', border: '1px solid #e63946' }}>
          <h2 style={{ fontSize: '24px', marginBottom: '20px', color: '#e63946' }}>Access Denied</h2>
          <p style={{ color: '#666', marginBottom: '20px' }}>Admin privileges required</p>
          <a href="#/" style={{ color: '#e63946', textDecoration: 'none' }}>Go to Home</a>
        </div>
      </div>
    );
  }

  return children;
};
```

**What this does**: A wrapper component that:
- Shows loading state while checking authentication
- Redirects to login if user is not authenticated
- Shows access denied if user is not an admin (when required)
- Renders children if all checks pass

---

## Admin Dashboard

### AdminDashboard.jsx
**Location**: `src/AdminDashboard.jsx`

**What it does**: A comprehensive admin panel for managing the store. This is a separate file because it's quite large and complex.

**Key sections**:

#### 1. Imports and Setup (Lines 1-36)
```javascript
import React, { useState, useEffect, useCallback } from 'react';
import { supabase, db } from './lib/supabase';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, /* ... */ } from 'recharts';
import { Users, Package, ShoppingCart, /* ... */ } from 'lucide-react';
```
**What this does**: Imports React, Supabase client, chart libraries, and icon libraries.

#### 2. State Management (Lines 13-36)
```javascript
const [activeTab, setActiveTab] = useState('dashboard');
const [products, setProducts] = useState([]);
const [orders, setOrders] = useState([]);
const [users, setUsers] = useState([]);
const [stats, setStats] = useState(null);
const [loading, setLoading] = useState(false);
const [currentUser, setCurrentUser] = useState(null);
const [isAdmin, setIsAdmin] = useState(false);
const [showProductForm, setShowProductForm] = useState(false);
const [editingProduct, setEditingProduct] = useState(null);
const [formData, setFormData] = useState({});
```
**What this does**: Keeps track of all the data and UI state for the admin dashboard.

#### 3. Admin Access Check (Lines 42-56)
```javascript
const checkAdminAccess = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  setCurrentUser(user);
  const { isAdmin } = await db.checkAdminRole(user.id);
  setIsAdmin(isAdmin);

  if (!isAdmin) {
    setToast('Admin access denied');
    return;
  }

  loadDashboard();
};
```
**What this does**: Checks if the current user is an admin before allowing access to the dashboard.

#### 4. Load Dashboard Data (Lines 58-79)
```javascript
const loadDashboard = async () => {
  setLoading(true);
  const [statsResult, ordersResult, productsResult, usersResult] = await Promise.all([
    db.getOrderStats(),
    db.getAllOrders(),
    db.getAllProducts(),
    db.getAllUsers(),
  ]);

  if (statsResult.data) setStats(statsResult.data);
  if (ordersResult.data) setOrders(ordersResult.data || []);
  if (productsResult.data) setProducts(productsResult.data || []);
  if (usersResult.data) setUsers(usersResult.data || []);

  generateSalesData(ordersResult.data || []);
  generateCategoryData(productsResult.data || []);
  checkInventoryAlerts(productsResult.data || []);
  loadAuditLogs();

  setLoading(false);
};
```
**What this does**: Loads all the data needed for the dashboard from the database.

#### 5. Analytics Functions (Lines 81-124)
```javascript
const generateSalesData = (ordersData) => {
  // Generates sales trend data for charts
};

const generateCategoryData = (productsData) => {
  // Generates category distribution data
};

const checkInventoryAlerts = (productsData) => {
  // Checks for low stock and out of stock items
};
```
**What these do**: Process raw data into formats suitable for charts and alerts.

#### 6. Product Management Functions (Lines 211-293)
```javascript
const handleProductSubmit = async (e) => {
  // Creates or updates a product
};

const editProduct = (product) => {
  // Opens product form for editing
};

const deleteProduct = async (id) => {
  // Deletes a product
};

const quickUpdateStock = async (productId, newStock) => {
  // Quickly updates stock quantity
};

const toggleProductFeature = async (product) => {
  // Toggles featured status
};
```
**What these do**: All the functions needed to manage products in the store.

#### 7. Order Management Functions (Lines 295-320)
```javascript
const updateOrderStatus = async (orderId, newStatus) => {
  // Updates order status and sends notification
};

const viewOrderDetails = (order) => {
  // Shows order details in a modal
};
```
**What these do**: Functions to manage orders and their status.

#### 8. User Management Functions (Lines 322-335)
```javascript
const toggleUserAdmin = async (userId, currentStatus) => {
  // Toggles admin privileges for a user
};
```
**What this does**: Allows admins to grant or revoke admin access.

#### 9. Security Functions (Lines 126-149)
```javascript
const loadAuditLogs = async () => {
  // Loads admin action logs
};

const logAdminAction = async (action, details) => {
  // Logs an admin action for security
};
```
**What these do**: Track all admin actions for security and auditing.

#### 10. UI Components (Lines 370-1403)
The rest of the file contains the UI components for the dashboard:
- Dashboard overview with charts
- Products tab with table and form
- Orders tab with status management
- Clients tab with user list
- Analytics tab with detailed charts
- Security tab with audit logs

---

## UI Components

### AnimatedCard.jsx
**Location**: `src/components/ui/AnimatedCard.jsx`

**What it does**: A card component that has a smooth animation when you hover over it.

**Key parts**:
```javascript
export default function AnimatedCard({ children, hoverScale = 1.02, hoverElevation = 8, glowColor, style }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      style={{
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        transform: isHovered ? `scale(${hoverScale}) translateY(-${hoverElevation}px)` : 'scale(1) translateY(0)',
        boxShadow: isHovered ? `0 20px 40px rgba(0,0,0,0.3), 0 0 20px ${glowColor}40` : '0 4px 6px rgba(0,0,0,0.1)',
        ...style,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {children}
    </div>
  );
}
```

**How it works**:
- Tracks whether the mouse is hovering over the card
- When hovered, scales the card up slightly and adds a shadow
- When not hovered, returns to normal size
- Uses CSS transitions for smooth animation

### ShinyButton.jsx
**Location**: `src/components/ui/ShinyButton.jsx`

**What it does**: A button that has a shiny/reflective effect when you hover over it.

**Key parts**:
```javascript
export default function ShinyButton({ children, onClick, disabled = false, style }) {
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);

  return (
    <button
      style={{
        position: 'relative',
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #e63946 0%, #ff6b6b 100%)',
        // ... more styles
      }}
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseDown={() => setIsClicked(true)}
      onMouseUp={() => setIsClicked(false)}
    >
      {/* Shiny effect overlay */}
      {isHovered && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: -100,
          width: '100%',
          height: '100%',
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
          animation: 'shine 1.5s infinite',
        }} />
      )}
      {children}
    </button>
  );
}
```

**How it works**:
- Has a gradient background
- When hovered, shows a shiny light effect that moves across the button
- When clicked, has a press effect
- Disabled state styling

### FadeContent.jsx
**Location**: `src/components/ui/FadeContent.jsx`

**What it does**: Makes content fade in smoothly when it appears on the screen.

**Key parts**:
```javascript
export default function FadeContent({ children, delay = 0, duration = 600 }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div style={{
      opacity: isVisible ? 1 : 0,
      transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
      transition: `all ${duration}ms cubic-bezier(0.4, 0, 0.2, 1)`,
    }}>
      {children}
    </div>
  );
}
```

**How it works**:
- Starts invisible and slightly below its final position
- After a delay, fades in and moves up to its final position
- Uses CSS transitions for smooth animation
- Great for sequential animations (staggered fade-ins)

### CountUp.jsx
**Location**: `src/components/ui/CountUp.jsx`

**What it does**: Animates a number counting up from 0 to a target value.

**Key parts**:
```javascript
export default function CountUp({ end, duration = 2000, decimals = 0 }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime;
    let startValue = 0;
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const value = progress * (end - startValue) + startValue;
      setCount(value);
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  }, [end, duration]);

  return <span>{count.toFixed(decimals)}</span>;
}
```

**How it works**:
- Starts at 0
- Over the specified duration, counts up to the target value
- Uses requestAnimationFrame for smooth animation
- Can show decimal places

### TiltCard.jsx
**Location**: `src/components/ui/TiltCard.jsx`

**What it does**: Creates a 3D tilt effect when you move your mouse over the card.

**Key parts**:
```javascript
export default function TiltCard({ children, maxTilt = 10 }) {
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateXValue = ((y - centerY) / centerY) * maxTilt;
    const rotateYValue = ((centerX - x) / centerX) * maxTilt;
    setRotateX(rotateXValue);
    setRotateY(rotateYValue);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
  };

  return (
    <div
      style={{
        transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
        transition: 'transform 0.1s ease-out',
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </div>
  );
}
```

**How it works**:
- Tracks mouse position over the card
- Calculates how far the mouse is from the center
- Rotates the card in 3D based on mouse position
- Resets to flat when mouse leaves

### Other UI Components
- **GradientText**: Text with a gradient color effect
- **MagnetButton**: Button that pulls toward the mouse cursor
- **SplitText**: Splits text into characters or words for animation
- **TextRotate**: Rotates through different words automatically

---

## Form Components

### LoginForm.jsx
**Location**: `src/components/forms/LoginForm.jsx`

**What it does**: A form for users to log in to their account.

**Key parts**:
```javascript
export default function LoginForm() {
  const { signIn } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const newErrors = {};
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await signIn(formData.email, formData.password);
      window.location.hash = '#/dashboard';
    } catch (error) {
      setErrors({ general: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <FadeContent>
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: '100%', maxWidth: '400px', background: '#1a1a2e', padding: '40px' }}>
          <h1>Sign In</h1>
          {errors.general && <div>{errors.general}</div>}
          <form onSubmit={handleSubmit}>
            <input type="email" placeholder="your@email.com" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
            {errors.email && <div>{errors.email}</div>}
            <input type="password" placeholder="••••••••" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} />
            {errors.password && <div>{errors.password}</div>}
            <button type="submit" disabled={loading}>{loading ? 'Signing in...' : 'Sign In'}</button>
          </form>
          <p>Don't have an account? <a href="#/register">Sign up</a></p>
        </div>
      </div>
    </FadeContent>
  );
}
```

**How it works**:
1. User enters email and password
2. Form validation checks for required fields and valid formats
3. On submit, calls the signIn function from AuthProvider
4. If successful, redirects to dashboard
5. If error, shows error message

### RegisterForm.jsx
**Location**: `src/components/forms/RegisterForm.jsx`

**What it does**: A form for new users to create an account.

**Key parts**:
```javascript
export default function RegisterForm() {
  const { signUp } = useAuth();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const newErrors = {};
    
    if (!formData.firstName) newErrors.firstName = 'First name is required';
    if (!formData.lastName) newErrors.lastName = 'Last name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.password) newErrors.password = 'Password is required';
    if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const isAdmin = import.meta.env.VITE_ADMIN_EMAIL === formData.email;
      await signUp(formData.email, formData.password, {
        first_name: formData.firstName,
        last_name: formData.lastName,
        is_admin: isAdmin
      });
      window.location.hash = '#/dashboard';
    } catch (error) {
      setErrors({ general: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    {/* Registration form UI */}
  );
}
```

**How it works**:
1. User enters name, email, password, and confirms password
2. Form validation checks all fields
3. Checks if email matches admin email (from environment variable)
4. On submit, calls signUp function with user data
5. If successful, redirects to dashboard
6. If error, shows error message

---

## Search Components

### SearchBar.jsx
**Location**: `src/components/search/SearchBar.jsx`

**What it does**: A search input field that filters products in real-time.

**Key parts**:
```javascript
export default function SearchBar({ onSearch, placeholder = "Search products..." }) {
  const [query, setQuery] = useState('');

  const handleChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    onSearch(value);
  };

  const handleClear = () => {
    setQuery('');
    onSearch('');
  };

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <input
        type="text"
        placeholder={placeholder}
        value={query}
        onChange={handleChange}
        style={{
          width: '100%',
          padding: '12px 40px 12px 16px',
          background: '#0a0a0f',
          border: '1px solid #333',
          borderRadius: '8px',
          color: '#fff',
          fontSize: '14px',
        }}
      />
      <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#666' }}>
        🔍
      </div>
      {query && (
        <button
          onClick={handleClear}
          style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#666', cursor: 'pointer' }}
        >
          ✕
        </button>
      )}
    </div>
  );
}
```

**How it works**:
- User types in the search box
- Each keystroke updates the query
- Calls the onSearch callback with the new query
- Shows a clear button when there's text
- Has a search icon on the left

### FilterPanel.jsx
**Location**: `src/components/search/FilterPanel.jsx`

**What it does**: A panel with various filters to narrow down product search results.

**Key parts**:
```javascript
export default function FilterPanel({ filters, onFilterChange }) {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div style={{ background: '#1a1a2e', border: '1px solid #333', borderRadius: '12px', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3>Filters</h3>
        <button onClick={() => setIsExpanded(!isExpanded)}>
          {isExpanded ? '−' : '+'}
        </button>
      </div>

      {isExpanded && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Category Filter */}
          <div>
            <label>Category</label>
            <select value={filters.category} onChange={(e) => onFilterChange('category', e.target.value)}>
              <option value="All">All Categories</option>
              <option value="Gaming PC">Gaming PC</option>
              <option value="Workstation">Workstation</option>
              <option value="Mini PC">Mini PC</option>
              <option value="Office PC">Office PC</option>
            </select>
          </div>

          {/* Brand Filter */}
          <div>
            <label>Brand</label>
            <select value={filters.brand} onChange={(e) => onFilterChange('brand', e.target.value)}>
              <option value="All">All Brands</option>
              <option value="Apex">Apex</option>
              <option value="Volt">Volt</option>
              <option value="Stealth">Stealth</option>
              <option value="Titan">Titan</option>
              <option value="Nova">Nova</option>
            </select>
          </div>

          {/* Price Range */}
          <div>
            <label>Price Range</label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input type="number" placeholder="Min" value={filters.minPrice} onChange={(e) => onFilterChange('minPrice', e.target.value)} />
              <input type="number" placeholder="Max" value={filters.maxPrice} onChange={(e) => onFilterChange('maxPrice', e.target.value)} />
            </div>
          </div>

          {/* Featured Filter */}
          <label>
            <input type="checkbox" checked={filters.featuredOnly} onChange={(e) => onFilterChange('featuredOnly', e.target.checked)} />
            Featured Only
          </label>

          {/* In Stock Filter */}
          <label>
            <input type="checkbox" checked={filters.inStockOnly} onChange={(e) => onFilterChange('inStockOnly', e.target.checked)} />
            In Stock Only
          </label>

          {/* Clear Filters */}
          <button onClick={() => onFilterChange('clear', true)}>Clear All Filters</button>
        </div>
      )}
    </div>
  );
}
```

**How it works**:
- Collapsible panel (can be expanded/collapsed)
- Category dropdown filter
- Brand dropdown filter
- Price range inputs (min and max)
- Featured products checkbox
- In stock checkbox
- Clear all filters button
- Each filter change calls the onFilterChange callback

---

## Database Integration

### supabase.js
**Location**: `src/lib/supabase.js`

**What it does**: This file connects our app to Supabase and provides functions to interact with the database.

**Key parts**:

#### 1. Supabase Client Initialization (Lines 1-5)
```javascript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```
**What this does**: Creates a Supabase client using the URL and API key from environment variables.

#### 2. Admin Client (Lines 7-15)
```javascript
let supabaseAdmin = null;

if (import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY) {
  const { createClient } = await import('@supabase/supabase-js');
  supabaseAdmin = createClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: { persistSession: false }
    }
  );
}
```
**What this does**: Creates an admin client with elevated privileges (if service role key is available). This is used for operations that need to bypass Row Level Security.

#### 3. Database Functions

**Product Functions**:
```javascript
export async function getAllProducts() {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });
  return { data, error };
}

export async function createProduct(product) {
  const { data, error } = await supabase
    .from('products')
    .insert([product])
    .select()
    .single();
  return { data, error };
}

export async function updateProduct(id, updates) {
  const { data, error } = await supabase
    .from('products')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  return { data, error };
}

export async function deleteProduct(id) {
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id);
  return { error };
}
```

**Order Functions**:
```javascript
export async function createOrder(order) {
  const { data, error } = await supabase
    .from('orders')
    .insert([order])
    .select()
    .single();
  return { data, error };
}

export async function getAllOrders() {
  const { data, error } = await supabase
    .from('orders')
    .select('*, users(email, first_name, last_name)')
    .order('created_at', { ascending: false });
  return { data, error };
}

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

**User Functions**:
```javascript
export async function checkAdminRole(userId) {
  const { data, error } = await supabase
    .from('users')
    .select('is_admin')
    .eq('id', userId)
    .single();
  return { isAdmin: data?.is_admin || false, error };
}

export async function getAllUsers() {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: false });
  return { data, error };
}
```

**Analytics Functions**:
```javascript
export async function getOrderStats() {
  const { data, error } = await supabase
    .from('orders')
    .select('total_amount, created_at, status');
  
  if (error) return { data: null, error };

  const totalRevenue = data.reduce((sum, o) => sum + (o.total_amount || 0), 0);
  const totalOrders = data.length;
  const pendingOrders = data.filter(o => o.status === 'pending').length;
  const todayRevenue = data
    .filter(o => o.created_at && o.created_at.startsWith(new Date().toISOString().split('T')[0]))
    .reduce((sum, o) => sum + (o.total_amount || 0), 0);

  return {
    data: { totalRevenue, totalOrders, pendingOrders, todayRevenue },
    error: null
  };
}
```

**How these functions work**:
- Each function connects to Supabase
- Performs a database operation (select, insert, update, delete)
- Returns the data or error
- Uses Supabase's query builder syntax

---

## Configuration Files

### package.json
**Location**: `package.json`

**What it does**: Lists all the libraries (dependencies) our project needs and the scripts to run the project.

**Key sections**:
```json
{
  "name": "apex-store",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "lint": "eslint src --ext js,jsx"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "@supabase/supabase-js": "^2.39.0",
    "recharts": "^2.10.3",
    "lucide-react": "^0.294.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.43",
    "@vitejs/plugin-react": "^4.2.1",
    "vite": "^5.0.8"
  }
}
```

**Scripts explained**:
- `npm run dev`: Start the development server
- `npm run build`: Build the project for production
- `npm run preview`: Preview the production build locally
- `npm run lint`: Check code for errors

### vite.config.js
**Location**: `vite.config.js`

**What it does**: Configures how Vite builds and serves our project.

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

**What this does**:
- Uses the React plugin for Vite
- Sets the development server to run on port 5173
- Allows the server to be accessed from other devices on the network

### netlify.toml
**Location**: `netlify.toml`

**What it does**: Configures how Netlify deploys our website.

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

**What this does**:
- Tells Netlify to run `npm run build` to build the project
- Tells Netlify to serve files from the `dist` folder
- Redirects all URLs to index.html (for SPA routing)

### .env.local
**Location**: `.env.local`

**What it does**: Stores secret configuration like API keys. This file is never committed to Git.

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
VITE_ADMIN_EMAIL=admin@example.com
```

**What these variables do**:
- `VITE_SUPABASE_URL`: Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Public API key for Supabase
- `VITE_SUPABASE_SERVICE_ROLE_KEY`: Admin API key (optional)
- `VITE_ADMIN_EMAIL`: Email that should have admin access (optional)

---

## How to Run the Project

### Prerequisites
- Node.js installed (version 16 or higher)
- npm or yarn package manager
- A Supabase account and project

### Setup Steps

1. **Clone the repository** (if you don't have it yet):
```bash
git clone https://github.com/your-username/apex-store.git
cd apex-store
```

2. **Install dependencies**:
```bash
npm install
```
This downloads all the libraries listed in package.json.

3. **Set up environment variables**:
- Copy `.env.example` to `.env.local`
- Add your Supabase URL and API keys
- (Optional) Add your admin email

4. **Start the development server**:
```bash
npm run dev
```
This starts Vite's development server, usually at http://localhost:5173

5. **Open your browser**:
Navigate to http://localhost:5173 to see your app

### Building for Production

1. **Build the project**:
```bash
npm run build
```
This creates an optimized production build in the `dist` folder.

2. **Preview the build**:
```bash
npm run preview
```
This serves the production build locally for testing.

### Common Issues

**"Module not found" error**:
- Run `npm install` to install dependencies
- Delete `node_modules` folder and run `npm install` again

**"Supabase connection error"**:
- Check that `.env.local` exists and has correct values
- Verify your Supabase project is active
- Check your internet connection

**"Port already in use" error**:
- Either close the other program using port 5173
- Or change the port in `vite.config.js`

---

## Common Patterns

### 1. Component Pattern
Most components follow this pattern:
```javascript
function ComponentName({ prop1, prop2 }) {
  const [state, setState] = useState(initialValue);
  
  const handleClick = () => {
    // Do something
  };
  
  return (
    <div>
      {/* JSX */}
    </div>
  );
}

export default ComponentName;
```

### 2. Custom Hook Pattern
For reusable logic:
```javascript
function useCustomHook(initialValue) {
  const [state, setState] = useState(initialValue);
  
  const updateState = (newValue) => {
    setState(newValue);
  };
  
  return { state, updateState };
}

// Usage
const { state, updateState } = useCustomHook(initialValue);
```

### 3. Context Pattern
For global state:
```javascript
const MyContext = createContext(null);

function MyProvider({ children }) {
  const [value, setValue] = useState(initialValue);
  
  return (
    <MyContext.Provider value={{ value, setValue }}>
      {children}
    </MyContext.Provider>
  );
}

function useMyContext() {
  return useContext(MyContext);
}
```

### 4. Reducer Pattern
For complex state:
```javascript
function reducer(state, action) {
  switch (action.type) {
    case 'ADD':
      return [...state, action.payload];
    case 'REMOVE':
      return state.filter(item => item.id !== action.payload);
    default:
      return state;
  }
}

const [state, dispatch] = useReducer(reducer, initialState);
```

### 5. Effect Pattern
For side effects:
```javascript
useEffect(() => {
  // Run on mount and when dependencies change
  const fetchData = async () => {
    const data = await api.getData();
    setState(data);
  };
  
  fetchData();
  
  // Cleanup function
  return () => {
    // Clean up on unmount
  };
}, [dependencies]);
```

---

## Troubleshooting

### Problem: "White screen" or nothing loads

**Possible causes**:
1. JavaScript error in the code
2. Missing dependencies
3. Environment variables not set

**Solutions**:
1. Open browser console (F12) and check for errors
2. Run `npm install` to ensure all dependencies are installed
3. Check that `.env.local` exists and has correct values

### Problem: "Cannot read property of undefined"

**Possible causes**:
1. Trying to access a property on an object that doesn't exist
2. Data not loaded yet

**Solutions**:
1. Add optional chaining: `object?.property`
2. Add loading state check before rendering
3. Ensure data is loaded before using it

### Problem: "Supabase error: Invalid API key"

**Possible causes**:
1. Wrong API key in environment variables
2. Supabase project not set up correctly

**Solutions**:
1. Check `.env.local` has correct Supabase URL and keys
2. Verify keys in Supabase dashboard
3. Ensure Supabase project is active

### Problem: Cart not adding items

**Possible causes**:
1. CartProvider not wrapping the app
2. Dispatch function not called correctly
3. Product data structure incorrect

**Solutions**:
1. Ensure App is wrapped with CartProvider
2. Check console for errors
3. Verify product object has required fields (id, name, price)

### Problem: Admin dashboard shows "Access Denied"

**Possible causes**:
1. User not logged in
2. User doesn't have admin privileges
3. Admin role check failing

**Solutions**:
1. Log in with admin account
2. Check users table has `is_admin: true` for your user
3. Verify checkAdminRole function works correctly

---

## Next Steps for Learning

Now that you understand the codebase, here are some things you can try:

1. **Add a new page**: Create a new component and add it to the routing in App.jsx
2. **Add a new UI component**: Create a new component in src/components/ui/
3. **Modify the product data**: Add new products to the PRODUCTS array in App.jsx
4. **Add a new filter**: Add a new filter option to the FilterPanel component
5. **Customize the styling**: Modify the CSS in App.jsx or add new styles
6. **Add a new database function**: Add a new function to supabase.js to interact with the database

---

## Conclusion

This guide has walked you through every major file in the Apex Store codebase. You now understand:

- How the project is structured
- What each file does
- How components work together
- How authentication works
- How the database is integrated
- How to run and modify the project

Remember, the best way to learn is by doing. Try making small changes and see what happens. Don't be afraid to break things - that's how you learn!

If you get stuck, check the browser console for errors, review the relevant section of this guide, or look at similar code in the existing files.

Happy coding!
