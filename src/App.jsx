import { useState, useContext, createContext, useReducer, useEffect, useCallback } from "react";
import { supabase, db } from "./lib/supabase";
import AdminDashboard from "./AdminDashboard";
import { AuthProvider, useAuth } from "./components/auth/AuthProvider";
import LoginForm from "./components/forms/LoginForm";
import RegisterForm from "./components/forms/RegisterForm";
import UserDashboard from "./components/dashboard/UserDashboard";
import FadeContent from "./components/ui/FadeContent";
import AnimatedCard from "./components/ui/AnimatedCard";
import ShinyButton from "./components/ui/ShinyButton";
import CountUp from "./components/ui/CountUp";
import TextRotate from "./components/ui/TextRotate";
import TiltCard from "./components/ui/TiltCard";

/* ─────────────────────────────────────────────
   1. DATA — mock product catalogue
───────────────────────────────────────────── */
const PRODUCTS = [
  {
    id: 1, slug: "apex-predator-x",
    name: "Apex Predator X",
    tagline: "Uncompromising 4K gaming dominance",
    category: "Gaming PC", brand: "Apex",
    price: 3499, originalPrice: 3899,
    rating: 4.9, reviews: 214,
    badge: "Best Seller",
    specs: {
      cpu: "Intel Core i9-14900KS",
      gpu: "NVIDIA RTX 4090 24GB",
      ram: "64GB DDR5-6000",
      storage: "4TB NVMe Gen5 RAID",
      cooling: "360mm AIO Liquid",
      psu: "1000W 80+ Platinum",
      os: "Windows 11 Pro",
    },
    highlights: ["4K Ultra at 144fps+", "PCIe 5.0 storage", "Wi-Fi 7 & BT 5.4", "3-yr warranty"],
    color: "#e63946",
  },
  {
    id: 2, slug: "volt-pro-creator",
    name: "Volt Pro Creator",
    tagline: "8K render-ready workstation for pros",
    category: "Workstation", brand: "Volt",
    price: 4199, originalPrice: null,
    rating: 4.8, reviews: 97,
    badge: "New",
    specs: {
      cpu: "AMD Threadripper PRO 7975WX",
      gpu: "NVIDIA RTX 4080 Super 16GB",
      ram: "128GB DDR5-5600 ECC",
      storage: "8TB NVMe + 16TB HDD",
      cooling: "Custom Dual-360mm Loop",
      psu: "1200W 80+ Titanium",
      os: "Windows 11 Pro for Workstations",
    },
    highlights: ["ECC memory for stability", "Thunderbolt 4 x4", "10GbE networking", "5-yr on-site warranty"],
    color: "#8e44ad",
  },
  {
    id: 3, slug: "stealth-mini-g",
    name: "Stealth Mini G",
    tagline: "Full power, impossibly compact",
    category: "Mini PC", brand: "Stealth",
    price: 1299, originalPrice: 1499,
    rating: 4.7, reviews: 341,
    badge: "Popular",
    specs: {
      cpu: "AMD Ryzen 9 7950X",
      gpu: "AMD Radeon RX 7900 GRE 16GB",
      ram: "32GB DDR5-5200",
      storage: "2TB NVMe Gen4",
      cooling: "Custom Low-Profile 120mm AIO",
      psu: "850W SFX 80+ Gold",
      os: "Windows 11 Home",
    },
    highlights: ["ITX form factor 6L", "PCIe 4.0 x4 NVMe", "USB4 40Gbps", "Silent fan curve"],
    color: "#27ae60",
  },
  {
    id: 4, slug: "titan-office-pro",
    name: "Titan Office Pro",
    tagline: "Productivity powerhouse for enterprise",
    category: "Office PC", brand: "Titan",
    price: 849, originalPrice: null,
    rating: 4.6, reviews: 528,
    badge: null,
    specs: {
      cpu: "Intel Core i7-13700",
      gpu: "Intel Arc A380 6GB",
      ram: "32GB DDR4-3200",
      storage: "1TB NVMe + 2TB HDD",
      cooling: "Tower Air Cooler",
      psu: "650W 80+ Gold",
      os: "Windows 11 Pro",
    },
    highlights: ["vPro remote management", "Dual 4K display support", "TPM 2.0 security", "5yr business warranty"],
    color: "#2980b9",
  },
  {
    id: 5, slug: "nova-budget-gamer",
    name: "Nova Budget Gamer",
    tagline: "1080p esports ready at an unbeatable price",
    category: "Gaming PC", brand: "Nova",
    price: 699, originalPrice: 799,
    rating: 4.5, reviews: 892,
    badge: "Best Value",
    specs: {
      cpu: "AMD Ryzen 5 7600",
      gpu: "NVIDIA RTX 4060 8GB",
      ram: "16GB DDR5-4800",
      storage: "1TB NVMe Gen4",
      cooling: "120mm AIO",
      psu: "550W 80+ Bronze",
      os: "Windows 11 Home",
    },
    highlights: ["1080p esports ready", "PCIe 4.0 support", "RGB lighting", "3yr warranty"],
    color: "#f39c12",
  },
  {
    id: 6, slug: "apex-streamer-s1",
    name: "Apex Streamer S1",
    tagline: "Built to broadcast, built to dominate",
    category: "Gaming PC", brand: "Apex",
    price: 2199, originalPrice: 2499,
    rating: 4.8, reviews: 163,
    badge: "Streamer Pick",
    specs: {
      cpu: "Intel Core i7-14700K",
      gpu: "NVIDIA RTX 4070 Ti Super 16GB",
      ram: "32GB DDR5-6000",
      storage: "2TB NVMe + 4TB HDD",
      cooling: "280mm AIO",
      psu: "850W 80+ Gold",
      os: "Windows 11 Home",
    },
    highlights: ["Dual-PC in one chassis", "AV1 encode/decode", "Capture card ready", "OBS-optimised BIOS"],
    color: "#e74c3c",
  },
];

const CATEGORIES = ["All", "Gaming PC", "Workstation", "Mini PC", "Office PC"];
const BRANDS     = ["All", "Apex", "Volt", "Stealth", "Titan", "Nova"];

/* ─────────────────────────────────────────────
   2. CART CONTEXT
───────────────────────────────────────────── */
const CartContext = createContext(null);

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

function useCart() { return useContext(CartContext); }

/* ─────────────────────────────────────────────
   3. HASH ROUTER
───────────────────────────────────────────── */
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

/* ─────────────────────────────────────────────
   4. GLOBAL CSS
───────────────────────────────────────────── */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;600&display=swap');

  :root {
    --bg:      #0a0a0f;
    --bg2:     #111118;
    --bg3:     #1a1a24;
    --bg4:     #22222f;
    --border:  rgba(255,255,255,0.08);
    --border2: rgba(255,255,255,0.15);
    --accent:  #e63946;
    --accent2: #ff6b6b;
    --gold:    #ffd60a;
    --text:    #f0f0f5;
    --muted:   #888898;
    --subtle:  #555565;
    --radius:    8px;
    --radius-lg: 14px;
    --font-display: 'Bebas Neue', sans-serif;
    --font-body:    'DM Sans', sans-serif;
    --font-mono:    'JetBrains Mono', monospace;
  }

  * { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; }
  body { background: var(--bg); color: var(--text); font-family: var(--font-body); min-height: 100vh; }
  a { color: inherit; text-decoration: none; }
  button { cursor: pointer; border: none; background: none; font-family: var(--font-body); }

  /* Layout */
  .container { max-width: 1280px; margin: 0 auto; padding: 0 24px; }
  .page { min-height: calc(100vh - 72px); }

  /* Navbar */
  .nav {
    position: sticky; top: 0; z-index: 100;
    background: rgba(10,10,15,0.95); backdrop-filter: blur(20px);
    border-bottom: 1px solid var(--border);
    height: 72px; display: flex; align-items: center;
  }
  .nav-inner { display: flex; align-items: center; justify-content: space-between; gap: 32px; width: 100%; }
  .nav-logo { font-family: var(--font-display); font-size: 28px; letter-spacing: 2px; color: var(--text); display: flex; align-items: center; gap: 4px; }
  .nav-logo span { color: var(--accent); }
  .nav-links { display: flex; align-items: center; gap: 8px; }
  .nav-link { padding: 8px 14px; border-radius: var(--radius); font-size: 14px; font-weight: 500; color: var(--muted); transition: all .2s; }
  .nav-link:hover, .nav-link.active { color: var(--text); background: var(--bg3); }
  .cart-btn { display: flex; align-items: center; gap: 8px; padding: 8px 18px; border-radius: var(--radius); background: var(--accent); color: white; font-size: 14px; font-weight: 600; transition: all .2s; }
  .cart-btn:hover { background: var(--accent2); transform: translateY(-1px); }
  .cart-badge { background: white; color: var(--accent); border-radius: 50%; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; }

  /* Buttons */
  .btn { display: inline-flex; align-items: center; gap: 8px; padding: 12px 28px; border-radius: var(--radius); font-size: 15px; font-weight: 600; transition: all .2s; }
  .btn-primary { background: var(--accent); color: white; }
  .btn-primary:hover { background: var(--accent2); transform: translateY(-2px); box-shadow: 0 8px 24px rgba(230,57,70,.4); }
  .btn-outline { border: 1.5px solid var(--border2); color: var(--text); }
  .btn-outline:hover { border-color: var(--accent); color: var(--accent); }
  .btn-ghost { color: var(--muted); }
  .btn-ghost:hover { color: var(--text); background: var(--bg3); }
  .btn-sm { padding: 8px 16px; font-size: 13px; }
  .btn-block { width: 100%; justify-content: center; }

  /* Hero */
  .hero { position: relative; padding: 100px 0 80px; overflow: hidden; border-bottom: 1px solid var(--border); }
  .hero::before { content: ''; position: absolute; top: -40%; right: -10%; width: 600px; height: 600px; background: radial-gradient(circle, rgba(230,57,70,.08) 0%, transparent 65%); pointer-events: none; }
  .hero-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 60px; align-items: center; }
  .hero-eyebrow { font-family: var(--font-mono); font-size: 12px; font-weight: 600; letter-spacing: 3px; text-transform: uppercase; color: var(--accent); margin-bottom: 20px; }
  .hero-title { font-family: var(--font-display); font-size: clamp(56px, 8vw, 96px); line-height: .95; letter-spacing: 2px; margin-bottom: 24px; }
  .hero-title .hl { color: var(--accent); }
  .hero-sub { font-size: 18px; color: var(--muted); line-height: 1.6; max-width: 440px; margin-bottom: 36px; }
  .hero-cta { display: flex; gap: 14px; flex-wrap: wrap; }
  .hero-stats { display: flex; gap: 32px; margin-top: 48px; padding-top: 36px; border-top: 1px solid var(--border); }
  .hero-stat-num { font-family: var(--font-display); font-size: 40px; line-height: 1; }
  .hero-stat-label { font-size: 13px; color: var(--muted); margin-top: 4px; }
  .hero-visual { display: flex; align-items: center; justify-content: center; }
  .hero-gfx { width: 100%; max-width: 480px; background: var(--bg3); border: 1px solid var(--border); border-radius: 20px; padding: 40px; position: relative; overflow: hidden; text-align: center; }
  .hero-gfx::before { content: ''; position: absolute; inset: 0; background: radial-gradient(ellipse at 60% 30%, rgba(230,57,70,.15) 0%, transparent 65%); pointer-events: none; }
  .hero-pc-art { font-size: 120px; display: block; filter: drop-shadow(0 0 40px rgba(230,57,70,.3)); animation: float 4s ease-in-out infinite; }
  .hero-pc-label { font-family: var(--font-display); font-size: 22px; letter-spacing: 3px; color: var(--accent); margin-top: 8px; }
  .hero-spec-pills { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 20px; justify-content: center; }
  .spec-pill { background: var(--bg4); border: 1px solid var(--border); border-radius: 100px; padding: 6px 14px; font-size: 12px; font-family: var(--font-mono); color: var(--muted); }
  @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-12px); } }

  /* Sections */
  .section { padding: 80px 0; }
  .section-header { margin-bottom: 48px; }
  .section-eyebrow { font-family: var(--font-mono); font-size: 11px; font-weight: 600; letter-spacing: 3px; text-transform: uppercase; color: var(--accent); margin-bottom: 12px; }
  .section-title { font-family: var(--font-display); font-size: clamp(36px, 5vw, 56px); letter-spacing: 1.5px; }
  .section-sub { color: var(--muted); font-size: 16px; margin-top: 10px; max-width: 520px; }

  /* Product Grid */
  .products-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 24px; }
  .product-card { background: var(--bg2); border: 1px solid var(--border); border-radius: var(--radius-lg); overflow: hidden; transition: all .25s; cursor: pointer; display: flex; flex-direction: column; }
  .product-card:hover { border-color: var(--border2); transform: translateY(-4px); box-shadow: 0 20px 48px rgba(0,0,0,.4); }
  .product-card-img { height: 200px; display: flex; align-items: center; justify-content: center; position: relative; }
  .product-badge { position: absolute; top: 14px; left: 14px; background: var(--accent); color: white; font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 100px; letter-spacing: .5px; }
  .product-card-body { padding: 20px; flex: 1; display: flex; flex-direction: column; }
  .product-category { font-size: 11px; font-weight: 600; letter-spacing: 2px; text-transform: uppercase; color: var(--muted); margin-bottom: 8px; }
  .product-name { font-size: 20px; font-weight: 700; margin-bottom: 6px; }
  .product-tagline { font-size: 13px; color: var(--muted); margin-bottom: 16px; line-height: 1.5; }
  .product-specs-mini { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; margin-bottom: 16px; }
  .spec-mini-item { font-size: 11px; color: var(--muted); font-family: var(--font-mono); }
  .spec-mini-item strong { color: var(--text); display: block; font-size: 12px; }
  .product-card-footer { display: flex; align-items: center; justify-content: space-between; margin-top: auto; padding-top: 16px; border-top: 1px solid var(--border); }
  .product-price { font-size: 26px; font-weight: 700; }
  .product-price-orig { font-size: 14px; color: var(--muted); text-decoration: line-through; margin-left: 8px; }
  .product-rating { font-size: 12px; color: var(--gold); display: flex; align-items: center; gap: 4px; }

  /* Filters */
  .filters { background: var(--bg2); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 20px 24px; margin-bottom: 32px; display: flex; gap: 20px; flex-wrap: wrap; align-items: flex-end; }
  .filter-group { display: flex; flex-direction: column; gap: 6px; }
  .filter-label { font-size: 11px; font-weight: 600; letter-spacing: 1.5px; text-transform: uppercase; color: var(--muted); }
  .filter-select { background: var(--bg3); border: 1px solid var(--border); border-radius: var(--radius); color: var(--text); font-family: var(--font-body); font-size: 14px; padding: 8px 32px 8px 12px; appearance: none; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' fill='none'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23888' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 12px center; cursor: pointer; transition: border-color .2s; }
  .filter-select:focus { outline: none; border-color: var(--accent); }
  .filter-search { background: var(--bg3); border: 1px solid var(--border); border-radius: var(--radius); color: var(--text); font-family: var(--font-body); font-size: 14px; padding: 8px 12px; min-width: 200px; transition: border-color .2s; }
  .filter-search:focus { outline: none; border-color: var(--accent); }
  .filter-search::placeholder { color: var(--subtle); }
  .results-count { font-size: 14px; color: var(--muted); margin-left: auto; align-self: flex-end; }

  /* Detail Page */
  .detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 60px; align-items: start; padding: 60px 0; }
  .detail-visual { background: var(--bg2); border: 1px solid var(--border); border-radius: 20px; padding: 60px; display: flex; flex-direction: column; align-items: center; justify-content: center; position: sticky; top: 96px; gap: 24px; }
  .detail-name { font-family: var(--font-display); font-size: 56px; letter-spacing: 2px; line-height: 1; }
  .detail-tagline { font-size: 18px; color: var(--muted); line-height: 1.6; }
  .detail-price-row { display: flex; align-items: baseline; gap: 12px; margin: 8px 0; }
  .detail-price { font-size: 48px; font-weight: 700; }
  .detail-orig { font-size: 22px; color: var(--muted); text-decoration: line-through; }
  .detail-savings { background: rgba(230,57,70,.15); border: 1px solid rgba(230,57,70,.3); color: var(--accent2); padding: 4px 12px; border-radius: 100px; font-size: 13px; font-weight: 600; }
  .specs-table { width: 100%; border-collapse: collapse; }
  .specs-table tr { border-bottom: 1px solid var(--border); }
  .specs-table td { padding: 12px 0; font-size: 14px; }
  .specs-table td:first-child { color: var(--muted); font-family: var(--font-mono); font-size: 12px; width: 40%; }
  .specs-table td:last-child { font-weight: 500; }
  .highlights-list { list-style: none; display: flex; flex-direction: column; gap: 10px; }
  .highlights-list li { display: flex; align-items: center; gap: 10px; font-size: 14px; }
  .highlights-list li::before { content: 'v'; color: var(--accent); font-weight: 700; font-size: 16px; flex-shrink: 0; }
  .qty-control { display: flex; align-items: center; border: 1px solid var(--border); border-radius: var(--radius); overflow: hidden; }
  .qty-btn { width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; background: var(--bg3); color: var(--text); font-size: 20px; transition: background .15s; }
  .qty-btn:hover { background: var(--bg4); }
  .qty-val { min-width: 48px; text-align: center; font-size: 16px; font-weight: 600; background: var(--bg2); height: 40px; display: flex; align-items: center; justify-content: center; }
  .add-cart-row { display: flex; align-items: center; gap: 12px; }

  /* Cart */
  .cart-layout { display: grid; grid-template-columns: 1fr 360px; gap: 32px; padding: 60px 0; align-items: start; }
  .cart-items { display: flex; flex-direction: column; gap: 16px; }
  .cart-item { background: var(--bg2); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 20px; display: flex; align-items: center; gap: 20px; }
  .cart-item-img { font-size: 52px; flex-shrink: 0; }
  .cart-item-name { font-size: 17px; font-weight: 600; margin-bottom: 4px; }
  .cart-item-cat { font-size: 12px; color: var(--muted); }
  .cart-item-price { font-size: 20px; font-weight: 700; text-align: right; }
  .cart-summary { background: var(--bg2); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 28px; position: sticky; top: 96px; }
  .summary-title { font-family: var(--font-display); font-size: 28px; letter-spacing: 1px; margin-bottom: 24px; }
  .summary-row { display: flex; justify-content: space-between; padding: 10px 0; font-size: 14px; border-bottom: 1px solid var(--border); }
  .summary-row.total { font-size: 20px; font-weight: 700; border: none; padding-top: 16px; margin-top: 4px; }
  .summary-row.total span:last-child { color: var(--accent); }
  .empty-cart { text-align: center; padding: 80px 0; }
  .empty-cart-icon { font-size: 80px; margin-bottom: 20px; }
  .empty-cart h2 { font-family: var(--font-display); font-size: 40px; letter-spacing: 1px; margin-bottom: 8px; }
  .empty-cart p { color: var(--muted); margin-bottom: 28px; }

  /* Checkout */
  .checkout-layout { display: grid; grid-template-columns: 1fr 380px; gap: 40px; padding: 60px 0; align-items: start; }
  .form-card { background: var(--bg2); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 32px; margin-bottom: 24px; }
  .form-card-title { font-family: var(--font-display); font-size: 28px; letter-spacing: 1px; margin-bottom: 24px; }
  .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  .form-field { display: flex; flex-direction: column; gap: 6px; }
  .form-field.full { grid-column: 1 / -1; }
  .form-label { font-size: 12px; font-weight: 600; letter-spacing: 1.5px; text-transform: uppercase; color: var(--muted); }
  .form-input { background: var(--bg3); border: 1px solid var(--border); border-radius: var(--radius); color: var(--text); font-family: var(--font-body); font-size: 15px; padding: 11px 14px; transition: border-color .2s; width: 100%; }
  .form-input:focus { outline: none; border-color: var(--accent); }
  .form-input::placeholder { color: var(--subtle); }
  .payment-icons { display: flex; gap: 10px; margin-bottom: 20px; }
  .payment-icon { background: var(--bg3); border: 1px solid var(--border); border-radius: var(--radius); padding: 8px 16px; font-size: 13px; color: var(--muted); font-family: var(--font-mono); }

  /* Order Success */
  .success-screen { text-align: center; padding: 100px 0; }
  .success-title { font-family: var(--font-display); font-size: 64px; letter-spacing: 2px; margin-bottom: 12px; color: #27ae60; }
  .order-num { font-family: var(--font-mono); background: var(--bg2); border: 1px solid var(--border); padding: 12px 24px; border-radius: var(--radius); display: inline-block; font-size: 22px; color: var(--accent); margin-bottom: 32px; }

  /* Value Props */
  .props-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 24px; }
  .prop-card { background: var(--bg2); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 28px; transition: border-color .2s; }
  .prop-card:hover { border-color: var(--border2); }
  .prop-icon { font-size: 36px; margin-bottom: 14px; display: block; }
  .prop-title { font-size: 17px; font-weight: 700; margin-bottom: 8px; }
  .prop-text { font-size: 14px; color: var(--muted); line-height: 1.6; }

  /* Marquee */
  .marquee-wrap { overflow: hidden; border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); padding: 14px 0; background: var(--bg2); }
  .marquee-track { display: flex; white-space: nowrap; animation: marquee 20s linear infinite; }
  .marquee-item { font-family: var(--font-display); font-size: 18px; letter-spacing: 3px; color: var(--subtle); padding: 0 32px; }
  .marquee-item.red { color: var(--accent); }
  @keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }

  /* Footer */
  .footer { border-top: 1px solid var(--border); padding: 60px 0 32px; background: var(--bg2); }
  .footer-grid { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 40px; margin-bottom: 48px; }
  .footer-brand-name { font-family: var(--font-display); font-size: 32px; letter-spacing: 2px; margin-bottom: 12px; }
  .footer-brand-name span { color: var(--accent); }
  .footer-brand-tagline { font-size: 14px; color: var(--muted); line-height: 1.6; max-width: 280px; }
  .social-links { display: flex; gap: 10px; margin-top: 20px; }
  .social-link { width: 36px; height: 36px; background: var(--bg3); border: 1px solid var(--border); border-radius: var(--radius); display: flex; align-items: center; justify-content: center; font-size: 16px; transition: all .2s; }
  .social-link:hover { border-color: var(--accent); background: rgba(230,57,70,.1); }
  .footer-col-title { font-size: 12px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: var(--muted); margin-bottom: 16px; }
  .footer-link { display: block; font-size: 14px; color: var(--muted); padding: 5px 0; transition: color .15s; background: none; border: none; text-align: left; cursor: pointer; font-family: var(--font-body); }
  .footer-link:hover { color: var(--text); }
  .footer-bottom { display: flex; justify-content: space-between; align-items: center; padding-top: 24px; border-top: 1px solid var(--border); font-size: 13px; color: var(--subtle); }

  /* Breadcrumb */
  .breadcrumb { display: flex; align-items: center; gap: 8px; padding: 20px 0; font-size: 13px; color: var(--muted); }
  .bc-btn { background: none; border: none; color: var(--muted); cursor: pointer; font-size: 13px; font-family: var(--font-body); transition: color .15s; }
  .bc-btn:hover { color: var(--text); }
  .bc-sep { color: var(--subtle); }

  /* Steps */
  .steps { display: flex; gap: 8px; align-items: center; margin: 16px 0 8px; }
  .step-dot { width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; flex-shrink: 0; }

  /* Toast */
  .toast-wrap { position: fixed; bottom: 28px; right: 28px; z-index: 999; display: flex; flex-direction: column; gap: 10px; pointer-events: none; }
  .toast { background: var(--bg3); border: 1px solid var(--border2); border-left: 3px solid var(--accent); border-radius: var(--radius); padding: 14px 20px; font-size: 14px; font-weight: 500; color: var(--text); animation: slideIn .3s ease; max-width: 320px; box-shadow: 0 8px 24px rgba(0,0,0,.4); }
  @keyframes slideIn { from { opacity: 0; transform: translateX(24px); } to { opacity: 1; transform: translateX(0); } }

  .divider { border: none; border-top: 1px solid var(--border); }

  /* Responsive */
  @media (max-width: 1024px) {
    .cart-layout, .checkout-layout { grid-template-columns: 1fr; }
    .footer-grid { grid-template-columns: 1fr 1fr; }
    .detail-grid { grid-template-columns: 1fr; }
    .detail-visual { position: static; }
  }
  @media (max-width: 768px) {
    .hero-grid { grid-template-columns: 1fr; }
    .hero-visual { display: none; }
    .nav-links { display: none; }
    .footer-grid { grid-template-columns: 1fr; }
    .form-grid { grid-template-columns: 1fr; }
    .add-cart-row { flex-direction: column; align-items: stretch; }
  }
`;

/* ─────────────────────────────────────────────
   5. SHARED COMPONENTS
───────────────────────────────────────────── */

function Toast({ toasts }) {
  return (
    <div className="toast-wrap">
      {toasts.map(t => <div key={t.id} className="toast">{t.msg}</div>)}
    </div>
  );
}

function Stars({ rating }) {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  return (
    <span style={{ color: "var(--gold)" }}>
      {"★".repeat(full)}{half ? "½" : ""}{"☆".repeat(5 - full - (half ? 1 : 0))}
    </span>
  );
}

function Navbar({ navigate, hash }) {
  const { count } = useCart();
  return (
    <nav className="nav">
      <div className="container nav-inner">
        <button className="nav-logo" onClick={() => navigate("#/")}>APEX<span>SYS</span></button>
        <div className="nav-links">
          {[["#/", "Home"], ["#/products", "Products"]].map(([path, label]) => (
            <button key={path} className={`nav-link${hash === path ? " active" : ""}`} onClick={() => navigate(path)}>
              {label}
            </button>
          ))}
        </div>
        <button className="cart-btn" onClick={() => navigate("#/cart")}>
          🛒 Cart {count > 0 && <span className="cart-badge">{count}</span>}
        </button>
      </div>
    </nav>
  );
}

function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <div className="footer-brand-name">APEX<span>SYS</span></div>
            <p className="footer-brand-tagline">Hand-built performance PCs for those who demand absolute excellence.</p>
            <div className="social-links">
              {["X", "YT", "IG", "DC"].map((icon, i) => (
                <a key={i} className="social-link" href="#">{icon}</a>
              ))}
            </div>
          </div>
          {[
            { title: "Shop",    links: ["Gaming PCs", "Workstations", "Mini PCs", "Office PCs", "Components"] },
            { title: "Support", links: ["FAQ", "Shipping Policy", "Returns", "Warranty", "Contact Us"] },
            { title: "Company", links: ["About", "Blog", "Careers", "Press", "Partners"] },
          ].map(col => (
            <div key={col.title}>
              <div className="footer-col-title">{col.title}</div>
              {col.links.map(l => <button key={l} className="footer-link">{l}</button>)}
            </div>
          ))}
        </div>
        <div className="footer-bottom">
          <span>© 2025 ApexSys Inc. All rights reserved.</span>
          <span>Built with precision. Powered by passion.</span>
        </div>
      </div>
    </footer>
  );
}

function Marquee() {
  const items = ["GAMING RIGS", "WORKSTATIONS", "CUSTOM BUILDS", "APEX SYSTEMS",
                 "GAMING RIGS", "WORKSTATIONS", "CUSTOM BUILDS", "APEX SYSTEMS"];
  return (
    <div className="marquee-wrap">
      <div className="marquee-track">
        {[...items, ...items].map((item, i) => (
          <span key={i} className={`marquee-item${i % 4 === 3 ? " red" : ""}`}>{item} •</span>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   6. PRODUCT CARD
───────────────────────────────────────────── */
function ProductCard({ product: p, navigate, addToast }) {
  const { dispatch } = useCart();
  function handleAdd(e) {
    e.stopPropagation();
    dispatch({ type: "ADD", product: p });
    addToast(`${p.name} added to cart!`);
  }
  return (
    <TiltCard>
      <AnimatedCard 
        hoverScale={1.03}
        hoverElevation={15}
        glowColor={`${p.color}30`}
        style={{ 
          background: '#1a1a2e', 
          border: '1px solid #333', 
          borderRadius: '16px', 
          overflow: 'hidden', 
          cursor: 'pointer',
          display: 'flex',
          flexDirection: 'column',
        }}
        onClick={() => navigate(`#/product/${p.slug}`)}
      >
        <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', background: `${p.color}15` }}>
          {p.badge && <span style={{ position: 'absolute', top: '14px', left: '14px', background: p.color, color: 'white', fontSize: '11px', fontWeight: '700', padding: '4px 10px', borderRadius: '100px', letterSpacing: '0.5px' }}>{p.badge}</span>}
          <div style={{ fontSize: '48px', fontWeight: 'bold', color: p.color }}>{p.name.charAt(0)}</div>
        </div>
        <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: '11px', fontWeight: '600', letterSpacing: '2px', textTransform: 'uppercase', color: '#666', marginBottom: '8px' }}>{p.category}</div>
          <FadeContent>
            <div style={{ fontSize: '20px', fontWeight: '700', marginBottom: '6px', color: '#fff' }}>{p.name}</div>
            <div style={{ fontSize: '13px', color: '#666', marginBottom: '16px', lineHeight: '1.5' }}>{p.tagline}</div>
          </FadeContent>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginBottom: '16px' }}>
            {[
              { label: "CPU", val: p.specs.cpu.split(" ").slice(-2).join(" ") },
              { label: "GPU", val: p.specs.gpu.split(" ").slice(-3).join(" ") },
              { label: "RAM", val: p.specs.ram },
              { label: "Storage", val: p.specs.storage.split("+")[0].trim() },
            ].map(s => (
              <div key={s.label} style={{ fontSize: '11px', color: '#666' }}>{s.label}<strong style={{ color: '#fff', display: 'block', fontSize: '12px' }}>{s.val}</strong></div>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid #333' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'baseline' }}>
                <span style={{ fontSize: '26px', fontWeight: '700', color: '#fff' }}>$<CountUp end={p.price} /></span>
                {p.originalPrice && <span style={{ fontSize: '18px', color: '#666', textDecoration: 'line-through', marginLeft: '8px' }}>${p.originalPrice.toLocaleString()}</span>}
              </div>
            </div>
            <div className="product-rating">
              <Stars rating={p.rating} />
              <span style={{ color: "var(--muted)" }}>({p.reviews})</span>
            </div>
          </div>
          <ShinyButton style={{ width: '100%', padding: '10px' }} onClick={handleAdd}>+ Cart</ShinyButton>
        </div>
      </AnimatedCard>
    </TiltCard>
  );
}

/* ─────────────────────────────────────────────
   7. PAGES
───────────────────────────────────────────── */

function HomePage({ navigate, addToast }) {
  const featured = PRODUCTS.filter(p => p.badge).slice(0, 3);
  return (
    <div className="page">
      <section className="hero">
        <div className="container hero-grid">
          <div>
            <FadeContent>
              <div className="hero-eyebrow">// Next-Gen Performance Systems</div>
              <h1 className="hero-title">BUILD YOUR<br /><span className="hl">LEGEND</span></h1>
              <p className="hero-sub">Hand-assembled performance PCs engineered for dominance. From esports champions to Hollywood studios.</p>
            </FadeContent>
            <FadeContent delay={200}>
              <div className="hero-cta">
                <ShinyButton onClick={() => navigate("#/products")}>Shop All PCs →</ShinyButton>
                <ShinyButton style={{ background: 'transparent', border: '1px solid #333' }} onClick={() => navigate("#/products")}>View Builds</ShinyButton>
              </div>
            </FadeContent>
            <FadeContent delay={400}>
              <div className="hero-stats">
                {[{num:"50K+",label:"PCs Shipped"},{num:"4.9",label:"Avg Rating"},{num:"3-5yr",label:"Warranty"},{num:"24/7",label:"Support"}].map(s => (
                  <div key={s.label}>
                    <div className="hero-stat-num">{s.num}</div>
                    <div className="hero-stat-label">{s.label}</div>
                  </div>
                ))}
              </div>
            </FadeContent>
          </div>
          <FadeContent delay={600}>
            <div className="hero-visual">
              <AnimatedCard hoverScale={1.05} style={{ height: '100%' }}>
                <div className="hero-gfx">
                  <span className="hero-pc-art">PC</span>
                  <div className="hero-pc-label">APEX PREDATOR X</div>
                  <div className="hero-spec-pills">
                    {["RTX 4090","i9-14900KS","64GB DDR5","4K@165fps"].map(s => (
                      <span key={s} className="spec-pill">{s}</span>
                    ))}
                  </div>
                </div>
              </AnimatedCard>
            </div>
          </FadeContent>
        </div>
      </section>

      <Marquee />

      <section className="section">
        <div className="container">
          <FadeContent>
            <div className="props-grid">
              {[
                { icon:"⚡", title:"Same-Day Build",   text:"Orders placed before 2pm ship same business day, fully tested and quality-checked." },
                { icon:"🛡️", title:"3–5 Year Warranty", text:"Industry-leading coverage with on-site support. We stand behind every build." },
                { icon:"🔧", title:"Free Upgrades",     text:"Lifetime upgrade consulting. Bring your Apex PC back at any time for component swaps." },
                { icon:"💬", title:"Expert Support",    text:"Real engineers, not chatbots. Available 24/7 via phone, chat, or email." },
              ].map(p => (
                <AnimatedCard key={p.title} hoverScale={1.02} style={{ background: '#1a1a2e', border: '1px solid #333', borderRadius: '12px', padding: '30px' }}>
                  <span className="prop-icon">{p.icon}</span>
                  <div className="prop-title">{p.title}</div>
                  <p className="prop-text">{p.text}</p>
                </AnimatedCard>
              ))}
            </div>
          </FadeContent>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <FadeContent delay={200}>
            <div className="section-header">
              <div className="section-eyebrow">// Top Picks</div>
              <h2 className="section-title">FEATURED BUILDS</h2>
              <p className="section-sub">Our most popular systems — hand-picked by our engineers.</p>
            </div>
          </FadeContent>
          <FadeContent delay={400}>
            <div className="products-grid">
              {featured.map(p => <ProductCard key={p.id} product={p} navigate={navigate} addToast={addToast} />)}
            </div>
          </FadeContent>
        </div>
      </section>
    </div>
  );
}

function ProductsPage({ navigate, addToast }) {
  const [search, setSearch]     = useState("");
  const [category, setCategory] = useState("All");
  const [brand, setBrand]       = useState("All");
  const [sort, setSort]         = useState("featured");

  const filtered = PRODUCTS
    .filter(p => {
      if (category !== "All" && p.category !== category) return false;
      if (brand    !== "All" && p.brand    !== brand)    return false;
      if (search && !p.name.toLowerCase().includes(search.toLowerCase()) &&
          !p.tagline.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => {
      if (sort === "price-asc")  return a.price - b.price;
      if (sort === "price-desc") return b.price - a.price;
      if (sort === "rating")     return b.rating - a.rating;
      return 0;
    });

  return (
    <div className="page">
      <div className="container" style={{ paddingTop: 48 }}>
        <FadeContent>
          <div className="section-header">
            <div className="section-eyebrow">// Our Catalogue</div>
            <h1 className="section-title">ALL BUILDS</h1>
            <p className="section-sub">Every machine is hand-assembled, stress-tested and shipped ready to run.</p>
          </div>
        </FadeContent>
        <FadeContent delay={200}>
          <div className="filters">
            <div className="filter-group">
              <label className="filter-label">Search</label>
              <input className="filter-search" placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <div className="filter-group">
              <label className="filter-label">Category</label>
              <select className="filter-select" value={category} onChange={e => setCategory(e.target.value)}>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="filter-group">
              <label className="filter-label">Brand</label>
              <select className="filter-select" value={brand} onChange={e => setBrand(e.target.value)}>
                {BRANDS.map(b => <option key={b}>{b}</option>)}
              </select>
            </div>
            <div className="filter-group">
              <label className="filter-label">Sort By</label>
              <select className="filter-select" value={sort} onChange={e => setSort(e.target.value)}>
                <option value="featured">Featured</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating">Top Rated</option>
              </select>
            </div>
            <span className="results-count">{filtered.length} product{filtered.length !== 1 ? "s" : ""}</span>
          </div>
        </FadeContent>

        {filtered.length === 0 ? (
          <FadeContent delay={400}>
            <div style={{ textAlign: "center", padding: "60px 0", color: "var(--muted)" }}>
              <div style={{ fontSize: 60, marginBottom: 16 }}>🔍</div>
              <div style={{ fontSize: 18 }}>No products match your filters.</div>
              <ShinyButton style={{ marginTop: 16 }} onClick={() => { setSearch(""); setCategory("All"); setBrand("All"); }}>
                Clear Filters
              </ShinyButton>
            </div>
          </FadeContent>
        ) : (
          <FadeContent delay={400}>
            <div className="products-grid">
              {filtered.map(p => <ProductCard key={p.id} product={p} navigate={navigate} addToast={addToast} />)}
            </div>
          </FadeContent>
        )}
      </div>
    </div>
  );
}

function ProductDetailPage({ slug, navigate, addToast }) {
  const product = PRODUCTS.find(p => p.slug === slug);
  const { dispatch } = useCart();
  const [qty, setQty] = useState(1);

  if (!product) {
    return (
      <FadeContent>
        <div className="page" style={{ textAlign: "center", paddingTop: 80 }}>
          <div style={{ fontSize: 60 }}>404</div>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 40, marginTop: 16 }}>PRODUCT NOT FOUND</h2>
          <ShinyButton style={{ marginTop: 24 }} onClick={() => navigate("#/products")}>Back to Products</ShinyButton>
        </div>
      </FadeContent>
    );
  }

  const savings = product.originalPrice ? product.originalPrice - product.price : 0;

  function handleAdd() {
    for (let i = 0; i < qty; i++) dispatch({ type: "ADD", product });
    addToast(`${qty}x ${product.name} added to cart!`);
  }

  return (
    <div className="page">
      <div className="container">
        <FadeContent>
          <div className="breadcrumb">
            <button className="bc-btn" onClick={() => navigate("#/")}>Home</button>
            <span className="bc-sep">›</span>
            <button className="bc-btn" onClick={() => navigate("#/products")}>Products</button>
            <span className="bc-sep">›</span>
            <span style={{ color: "var(--text)" }}>{product.name}</span>
          </div>
        </FadeContent>
        <div className="detail-grid">
          <FadeContent delay={200}>
            <TiltCard>
              <AnimatedCard hoverScale={1.02} style={{ background: `${product.color}10`, borderRadius: '20px', padding: '60px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'sticky', top: 96, gap: '24px' }}>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 12, letterSpacing: 3, textTransform: "uppercase", color: "#666", fontFamily: "var(--font-mono)" }}>
                    {product.category} · {product.brand}
                  </div>
                  {product.badge && <span className="product-badge" style={{ position: "static", display: "inline-block", marginTop: 8 }}>{product.badge}</span>}
                  <div style={{ fontSize: '120px', fontWeight: 'bold', color: product.color, marginTop: '20px' }}>{product.name.charAt(0)}</div>
                </div>
              </AnimatedCard>
            </TiltCard>
          </FadeContent>
          <FadeContent delay={400}>
            <div>
              <h1 className="detail-name">{product.name}</h1>
              <p className="detail-tagline">{product.tagline}</p>
              <div style={{ display: "flex", alignItems: "center", gap: 8, margin: "16px 0" }}>
                <Stars rating={product.rating} />
                <span style={{ fontWeight: 600, fontSize: 16 }}>{product.rating}</span>
                <span style={{ color: "var(--muted)", fontSize: 14 }}>({product.reviews} reviews)</span>
              </div>
              <div className="detail-price-row">
                <span className="detail-price">$<CountUp end={product.price} /></span>
                {product.originalPrice && <>
                  <span className="detail-orig">${product.originalPrice.toLocaleString()}</span>
                  <span className="detail-savings">Save ${savings.toLocaleString()}</span>
                </>}
              </div>
              <hr className="divider" style={{ margin: "24px 0" }} />
              <div style={{ marginBottom: 28 }}>
                <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", color: "var(--muted)", marginBottom: 12 }}>Highlights</div>
                <ul className="highlights-list">
                  {product.highlights.map(h => <li key={h}>{h}</li>)}
                </ul>
              </div>
              <div style={{ marginBottom: 28 }}>
                <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", color: "var(--muted)", marginBottom: 12 }}>Full Specifications</div>
                <table className="specs-table">
                  <tbody>
                    {Object.entries(product.specs).map(([k, v]) => (
                      <tr key={k}><td>{k.toUpperCase()}</td><td>{v}</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="add-cart-row">
                <div className="qty-control">
                  <button className="qty-btn" onClick={() => setQty(q => Math.max(1, q - 1))}>−</button>
                  <div className="qty-val">{qty}</div>
                  <button className="qty-btn" onClick={() => setQty(q => q + 1)}>+</button>
                </div>
                <ShinyButton style={{ flex: 1 }} onClick={handleAdd}>
                  Add to Cart — ${(product.price * qty).toLocaleString()}
                </ShinyButton>
              </div>
              <ShinyButton style={{ marginTop: 12, background: 'transparent', border: '1px solid #333' }} onClick={() => { handleAdd(); navigate("#/cart"); }}>
                Buy Now
              </ShinyButton>
            </div>
          </FadeContent>
        </div>
      </div>
    </div>
  );
}

function CartPage({ navigate }) {
  const { items, dispatch, total } = useCart();
  const shipping = total > 2000 ? 0 : 49;
  const tax = Math.round(total * 0.08);

  if (items.length === 0) {
    return (
      <div className="page">
        <div className="container empty-cart">
          <div className="empty-cart-icon">🛒</div>
          <h2>YOUR CART IS EMPTY</h2>
          <p>You have not added any machines yet.</p>
          <button className="btn btn-primary" onClick={() => navigate("#/products")}>Browse Products</button>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="container">
        <div style={{ padding: "40px 0 0" }}>
          <div className="section-eyebrow">// Your Selection</div>
          <h1 className="section-title">SHOPPING CART</h1>
        </div>
        <div className="cart-layout">
          <div className="cart-items">
            {items.map(item => (
              <div key={item.id} className="cart-item">
                <div style={{ flex: 1 }}>
                  <div className="cart-item-name">{item.name}</div>
                  <div className="cart-item-cat">{item.category} · {item.brand}</div>
                  <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 4 }}>{item.specs.cpu} / {item.specs.gpu}</div>
                </div>
                <div className="qty-control" style={{ margin: "0 16px" }}>
                  <button className="qty-btn" onClick={() => dispatch({ type: "SET_QTY", id: item.id, qty: item.qty - 1 })}>−</button>
                  <div className="qty-val">{item.qty}</div>
                  <button className="qty-btn" onClick={() => dispatch({ type: "SET_QTY", id: item.id, qty: item.qty + 1 })}>+</button>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div className="cart-item-price">${(item.price * item.qty).toLocaleString()}</div>
                  <div style={{ fontSize: 13, color: "var(--muted)" }}>${item.price.toLocaleString()} each</div>
                  <button className="btn btn-ghost btn-sm" style={{ color: "var(--accent)", marginTop: 8 }} onClick={() => dispatch({ type: "REMOVE", id: item.id })}>Remove</button>
                </div>
              </div>
            ))}
            <button className="btn btn-ghost" onClick={() => navigate("#/products")}>← Continue Shopping</button>
          </div>
          <div className="cart-summary">
            <div className="summary-title">ORDER SUMMARY</div>
            <div className="summary-row"><span>Subtotal ({items.reduce((s, i) => s + i.qty, 0)} items)</span><span>${total.toLocaleString()}</span></div>
            <div className="summary-row"><span>Shipping</span><span>{shipping === 0 ? <span style={{ color: "#27ae60" }}>FREE</span> : `$${shipping}`}</span></div>
            <div className="summary-row"><span>Tax (8%)</span><span>${tax.toLocaleString()}</span></div>
            {total < 2000 && <div style={{ fontSize: 12, color: "var(--muted)", margin: "8px 0" }}>🎁 Spend ${(2000 - total).toLocaleString()} more for free shipping!</div>}
            <div className="summary-row total"><span>Total</span><span>${(total + shipping + tax).toLocaleString()}</span></div>
            <button className="btn btn-primary btn-block" style={{ marginTop: 20 }} onClick={() => navigate("#/checkout")}>Proceed to Checkout →</button>
            <div style={{ textAlign: "center", marginTop: 16, fontSize: 12, color: "var(--muted)" }}>🔒 Secure checkout · SSL encrypted</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CheckoutPage({ navigate }) {
  const { items, total, dispatch } = useCart();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ firstName:"", lastName:"", email:"", phone:"", address:"", city:"", state:"", zip:"", cardName:"", cardNum:"", expiry:"", cvv:"" });
  const shipping = total > 2000 ? 0 : 49;
  const tax = Math.round(total * 0.08);
  const grandTotal = total + shipping + tax;
  const orderNum = "APX-" + Math.random().toString(36).slice(2, 8).toUpperCase();

  function update(k, v) { setForm(f => ({ ...f, [k]: v })); }

  function Field({ label, id, placeholder, span, type = "text" }) {
    return (
      <div className={`form-field${span ? " full" : ""}`}>
        <label className="form-label">{label}</label>
        <input className="form-input" type={type} placeholder={placeholder} value={form[id]} onChange={e => update(id, e.target.value)} />
      </div>
    );
  }

  if (items.length === 0 && step !== 3) {
    return (
      <div className="page" style={{ textAlign: "center", paddingTop: 80 }}>
        <div style={{ fontSize: 60 }}>🛒</div>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: 40, marginTop: 16 }}>NOTHING TO CHECK OUT</h2>
        <button className="btn btn-primary" style={{ marginTop: 24 }} onClick={() => navigate("#/products")}>Browse Products</button>
      </div>
    );
  }

  if (step === 3) {
    return (
      <div className="page">
        <div className="container success-screen">
          <div style={{ fontSize: 80, marginBottom: 24 }}>✅</div>
          <div className="success-title">ORDER PLACED!</div>
          <p style={{ fontSize: 18, color: "var(--muted)", marginBottom: 28 }}>Your beast is being hand-assembled right now. Delivery in 2–4 business days.</p>
          <div className="order-num">{orderNum}</div>
          <p style={{ color: "var(--muted)", marginBottom: 32 }}>A confirmation has been sent to {form.email || "your email"}.</p>
          <div style={{ display: "flex", gap: 14, justifyContent: "center" }}>
            <button className="btn btn-primary" onClick={() => { dispatch({ type: "CLEAR" }); navigate("#/"); }}>Back to Home</button>
            <button className="btn btn-outline" onClick={() => navigate("#/products")}>Shop More</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="container">
        <div style={{ padding: "40px 0 0" }}>
          <div className="section-eyebrow">// Secure Checkout</div>
          <h1 className="section-title">CHECKOUT</h1>
          <div className="steps">
            {["Shipping", "Payment"].map((s, i) => (
              <div key={s} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div className="step-dot" style={{ background: step > i+1 ? "#27ae60" : step === i+1 ? "var(--accent)" : "var(--bg3)", border: `1px solid ${step >= i+1 ? "transparent" : "var(--border)"}`, color: step >= i+1 ? "white" : "var(--muted)" }}>
                  {step > i+1 ? "✓" : i+1}
                </div>
                <span style={{ fontSize: 14, color: step === i+1 ? "var(--text)" : "var(--muted)" }}>{s}</span>
                {i < 1 && <span style={{ color: "var(--border2)", margin: "0 4px" }}>›</span>}
              </div>
            ))}
          </div>
        </div>
        <div className="checkout-layout">
          <div>
            {step === 1 && (
              <div className="form-card">
                <div className="form-card-title">SHIPPING INFO</div>
                <div className="form-grid">
                  <Field label="First Name" id="firstName" placeholder="John" />
                  <Field label="Last Name"  id="lastName"  placeholder="Doe" />
                  <Field label="Email"  id="email"  placeholder="john@example.com" type="email" />
                  <Field label="Phone"  id="phone"  placeholder="+1 (555) 000-0000" />
                  <Field label="Address" id="address" placeholder="123 Main Street" span />
                  <Field label="City"  id="city"  placeholder="New York" />
                  <Field label="State" id="state" placeholder="NY" />
                  <Field label="ZIP Code" id="zip" placeholder="10001" />
                </div>
                <button className="btn btn-primary" style={{ marginTop: 24 }} onClick={() => setStep(2)}>Continue to Payment →</button>
              </div>
            )}
            {step === 2 && (
              <div className="form-card">
                <div className="form-card-title">PAYMENT</div>
                <div className="payment-icons">
                  {["VISA", "MC", "AMEX", "PayPal"].map(c => <span key={c} className="payment-icon">{c}</span>)}
                </div>
                <div style={{ background:"rgba(255,214,10,.08)", border:"1px solid rgba(255,214,10,.2)", borderRadius:"var(--radius)", padding:"10px 14px", fontSize:13, color:"var(--muted)", marginBottom:20 }}>
                  🔒 Mock checkout — no real payment will be processed.
                </div>
                <div className="form-grid">
                  <Field label="Cardholder Name" id="cardName" placeholder="John Doe" span />
                  <Field label="Card Number" id="cardNum" placeholder="4242 4242 4242 4242" span />
                  <Field label="Expiry (MM/YY)" id="expiry" placeholder="12/27" />
                  <Field label="CVV" id="cvv" placeholder="123" />
                </div>
                <div style={{ display:"flex", gap:12, marginTop:24 }}>
                  <button className="btn btn-outline" onClick={() => setStep(1)}>← Back</button>
                  <button className="btn btn-primary" style={{ flex:1 }} onClick={() => setStep(3)}>Place Order — ${grandTotal.toLocaleString()}</button>
                </div>
              </div>
            )}
          </div>
          <div className="cart-summary">
            <div className="summary-title">YOUR ORDER</div>
            {items.map(item => (
              <div key={item.id} style={{ display:"flex", gap:10, alignItems:"center", marginBottom:14 }}>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:14, fontWeight:600 }}>{item.name}</div>
                  <div style={{ fontSize:12, color:"var(--muted)" }}>Qty: {item.qty}</div>
                </div>
                <div style={{ fontSize:14, fontWeight:600 }}>${(item.price * item.qty).toLocaleString()}</div>
              </div>
            ))}
            <hr className="divider" style={{ margin:"16px 0" }} />
            <div className="summary-row"><span>Subtotal</span><span>${total.toLocaleString()}</span></div>
            <div className="summary-row"><span>Shipping</span><span>{shipping === 0 ? "FREE" : `$${shipping}`}</span></div>
            <div className="summary-row"><span>Tax</span><span>${tax.toLocaleString()}</span></div>
            <div className="summary-row total"><span>Total</span><span>${grandTotal.toLocaleString()}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}

function LoginPage({ navigate, onAuthSuccess, addToast }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState("login");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === "login") {
        const { data, error } = await db.signIn(email, password);
        if (error) throw error;
        addToast("✅ Logged in successfully");
        onAuthSuccess(data.user);
        navigate("#/admin");
      } else {
        const { data, error } = await db.signUp(email, password, {
          is_admin: email === import.meta.env.VITE_ADMIN_EMAIL,
        });
        if (error) throw error;
        addToast("✅ Registration successful. Check your email to confirm.");
        onAuthSuccess(data.user);
        navigate("#/");
      }
    } catch (err) {
      addToast(`❌ ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page" style={{ minHeight: "80vh" }}>
      <div className="container auth-screen">
        <div className="auth-card">
          <h1>{mode === "login" ? "Admin Login" : "Create Admin Account"}</h1>
          <p className="auth-subtitle">Secure access for store administrators.</p>
          <form onSubmit={handleSubmit} className="auth-form">
            <label className="form-label">Email</label>
            <input
              className="form-input"
              type="email"
              placeholder="admin@apexsys.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <label className="form-label">Password</label>
            <input
              className="form-input"
              type="password"
              placeholder="Strong password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
            />
            <button className="btn btn-primary btn-block" disabled={loading}>
              {loading ? "Working..." : mode === "login" ? "Sign In" : "Create Account"}
            </button>
          </form>
          <button
            className="btn btn-outline btn-block"
            onClick={() => setMode(mode === "login" ? "register" : "login")}
          >
            {mode === "login" ? "Need an account? Register" : "Already have an account? Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   8. ROOT APP
───────────────────────────────────────────── */
export default function App() {
  const { hash, navigate } = useRoute();
  const [toasts, setToasts] = useState([]);

  function addToast(msg) {
    const id = Date.now();
    setToasts(t => [...t, { id, msg }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3000);
  }

  useEffect(() => { window.scrollTo(0, 0); }, [hash]);

  let page = null;
  if      (hash === "#/" || hash === "" || hash === "#") page = <HomePage navigate={navigate} addToast={addToast} />;
  else if (hash === "#/products")                        page = <ProductsPage navigate={navigate} addToast={addToast} />;
  else if (hash.startsWith("#/product/"))               page = <ProductDetailPage slug={hash.replace("#/product/", "")} navigate={navigate} addToast={addToast} />;
  else if (hash === "#/cart")                            page = <CartPage navigate={navigate} />;
  else if (hash === "#/checkout")                        page = <CheckoutPage navigate={navigate} />;
  else if (hash === "#/login")                           page = <LoginForm />;
  else if (hash === "#/register")                        page = <RegisterForm />;
  else if (hash === "#/dashboard")                       page = <UserDashboard />;
  else if (hash === "#/admin")                           page = <AdminDashboard />;
  else page = (
    <div className="page" style={{ textAlign:"center", paddingTop:80 }}>
      <div style={{ fontSize:60 }}>🗺️</div>
      <h2 style={{ fontFamily:"var(--font-display)", fontSize:48, marginTop:16 }}>PAGE NOT FOUND</h2>
      <button className="btn btn-primary" style={{ marginTop:24 }} onClick={() => navigate("#/")}>Go Home</button>
    </div>
  );

  return (
    <AuthProvider>
      <CartProvider>
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        <Navbar navigate={navigate} hash={hash} />
        {page}
        <Footer />
        <Toast toasts={toasts} />
      </CartProvider>
    </AuthProvider>
  );
}
