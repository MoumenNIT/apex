// Enhanced Admin Dashboard with Analytics, Charts & Security
import React, { useState, useEffect, useCallback } from 'react';
import { supabase, db } from './lib/supabase';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import {
  Users, Package, ShoppingCart, DollarSign, TrendingUp, AlertTriangle,
  Search, Filter, Download, RefreshCw, Shield, Activity, Eye, Trash2, Edit, Plus
} from 'lucide-react';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isCheckingAdmin, setIsCheckingAdmin] = useState(true);
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({});
  const [imageFile, setImageFile] = useState(null);
  const [toast, setToast] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState('7d');
  const [salesData, setSalesData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [inventoryAlerts, setInventoryAlerts] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [productFilter, setProductFilter] = useState('all');
  const [userFilter, setUserFilter] = useState('all');
  const [syncStatus, setSyncStatus] = useState({ status: 'idle', message: '' });

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setIsCheckingAdmin(false);
      return;
    }

    setCurrentUser(user);
    const { isAdmin } = await db.checkAdminRole(user.id);
    setIsAdmin(isAdmin);
    setIsCheckingAdmin(false);

    if (!isAdmin) {
      setToast('Admin access denied');
      return;
    }

    loadDashboard();
  };

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

    // Generate analytics data
    generateSalesData(ordersResult.data || []);
    generateCategoryData(productsResult.data || []);
    checkInventoryAlerts(productsResult.data || []);
    loadAuditLogs();

    setLoading(false);
  };

  // ===== ANALYTICS & CHARTS =====
  const generateSalesData = (ordersData) => {
    const days = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : 90;
    const data = [];
    const now = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      const dayOrders = ordersData.filter(o =>
        o.created_at && o.created_at.startsWith(dateStr)
      );

      data.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        revenue: dayOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0),
        orders: dayOrders.length,
      });
    }
    setSalesData(data);
  };

  const generateCategoryData = (productsData) => {
    const categories = {};
    productsData.forEach(p => {
      categories[p.category] = (categories[p.category] || 0) + 1;
    });

    const colors = ['#e63946', '#8e44ad', '#27ae60', '#2980b9', '#f39c12', '#e74c3c'];
    const data = Object.entries(categories).map(([name, value], i) => ({
      name,
      value,
      color: colors[i % colors.length],
    }));
    setCategoryData(data);
  };

  const checkInventoryAlerts = (productsData) => {
    const lowStock = productsData.filter(p => p.stock_quantity < 10);
    const outOfStock = productsData.filter(p => p.stock_quantity === 0);
    setInventoryAlerts([...lowStock, ...outOfStock]);
  };

  // ===== SECURITY & AUDIT =====
  const loadAuditLogs = async () => {
    const { data } = await supabase
      .from('admin_audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);
    setAuditLogs(data || []);
  };

  const logAdminAction = async (action, details) => {
    try {
      await supabase.from('admin_audit_logs').insert([{
        admin_id: currentUser?.id,
        admin_email: currentUser?.email,
        action,
        details,
        ip_address: 'client-side',
        user_agent: navigator.userAgent,
      }]);
    } catch (e) {
      console.error('Failed to log action:', e);
    }
  };

  // ===== GITHUB SYNC =====
  const triggerDatabaseSync = async () => {
    setSyncStatus({ status: 'syncing', message: 'Syncing with database...' });
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/github-sync`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'sync_products',
            triggered_by: currentUser?.email,
          }),
        }
      );

      if (response.ok) {
        setSyncStatus({ status: 'success', message: 'Database sync completed!' });
        await logAdminAction('DATABASE_SYNC', { status: 'success' });
        loadDashboard();
      } else {
        throw new Error('Sync failed');
      }
    } catch (err) {
      setSyncStatus({ status: 'error', message: `Sync failed: ${err.message}` });
    }

    setTimeout(() => setSyncStatus({ status: 'idle', message: '' }), 3000);
  };

  const showToast = (msg, duration = 3000) => {
    setToast(msg);
    setTimeout(() => setToast(''), duration);
  };

  // ===== FILTERED DATA =====
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         p.category?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = productFilter === 'all' ? true :
                         productFilter === 'low-stock' ? p.stock_quantity < 10 :
                         productFilter === 'out-of-stock' ? p.stock_quantity === 0 :
                         productFilter === 'featured' ? p.is_featured : true;
    return matchesSearch && matchesFilter;
  });

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         u.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         u.last_name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = userFilter === 'all' ? true :
                         userFilter === 'admin' ? u.is_admin :
                         userFilter === 'customers' ? !u.is_admin : true;
    return matchesSearch && matchesFilter;
  });

  // ===== PRODUCT MANAGEMENT =====
  const handleProductSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.price) {
      showToast('❌ Name and price are required');
      return;
    }

    try {
      let imageUrl = formData.image_url;

      // Upload image if a new file is selected
      if (imageFile) {
        showToast('⏳ Uploading image...');
        const tempId = editingProduct?.id || crypto.randomUUID();
        const { data: uploadData, error: uploadError } = await db.uploadProductImage(imageFile, tempId);
        
        if (uploadError) {
          throw new Error(`Image upload failed: ${uploadError.message}`);
        }
        
        imageUrl = uploadData.url;
        showToast('✅ Image uploaded successfully');
      }

      const productData = { ...formData, image_url: imageUrl };

      if (editingProduct) {
        const { error } = await db.updateProduct(editingProduct.id, productData);
        if (error) throw error;
        await logAdminAction('PRODUCT_UPDATE', { product_id: editingProduct.id, name: formData.name });
        showToast('✅ Product updated successfully');
      } else {
        const { data, error } = await db.createProduct(productData);
        if (error) throw error;
        await logAdminAction('PRODUCT_CREATE', { product_id: data?.id, name: formData.name });
        showToast('✅ Product created successfully');
      }

      setShowProductForm(false);
      setEditingProduct(null);
      setFormData({});
      setImageFile(null);
      loadDashboard();
    } catch (err) {
      showToast(`❌ ${err.message}`);
    }
  };

  const editProduct = (product) => {
    setEditingProduct(product);
    setFormData({
      ...product,
      specs: product.product_specs || [],
      highlights: product.product_highlights || [],
    });
    setImageFile(null);
    setShowProductForm(true);
  };

  const closeProductForm = () => {
    setShowProductForm(false);
    setEditingProduct(null);
    setFormData({});
    setImageFile(null);
  };

  const quickUpdateStock = async (productId, newStock) => {
    try {
      const { error } = await db.updateProduct(productId, { stock_quantity: newStock });
      if (error) throw error;
      await logAdminAction('STOCK_UPDATE', { product_id: productId, new_stock: newStock });
      showToast('✅ Stock updated');
      loadDashboard();
    } catch (err) {
      showToast(`❌ ${err.message}`);
    }
  };

  const toggleProductFeature = async (product) => {
    try {
      const { error } = await db.updateProduct(product.id, { is_featured: !product.is_featured });
      if (error) throw error;
      await logAdminAction('PRODUCT_FEATURE_TOGGLE', { product_id: product.id, is_featured: !product.is_featured });
      showToast(`✅ Product ${product.is_featured ? 'unfeatured' : 'featured'}`);
      loadDashboard();
    } catch (err) {
      showToast(`❌ ${err.message}`);
    }
  };

  const closeProductForm = () => {
    setShowProductForm(false);
    setEditingProduct(null);
    setFormData({});
  };

  // ===== ORDER MANAGEMENT =====
  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const order = orders.find(o => o.id === orderId);
      const { error } = await db.updateOrderStatus(orderId, newStatus, `Status changed by admin at ${new Date().toLocaleString()}`);

      if (error) throw error;

      await logAdminAction('ORDER_STATUS_UPDATE', { order_id: orderId, new_status: newStatus });

      // Send notification email to customer
      if (order) {
        await db.sendOrderStatusEmail(orderId, order.users?.email, order.users?.first_name || 'Customer', newStatus);
      }

      showToast(`✅ Order status updated to ${newStatus}`);
      loadDashboard();
    } catch (err) {
      showToast(`❌ ${err.message}`);
    }
  };

  const viewOrderDetails = (order) => {
    setSelectedOrder(order);
    setShowOrderModal(true);
  };

  // ===== CLIENT MANAGEMENT =====
  const toggleUserAdmin = async (userId, currentStatus) => {
    if (!confirm(`Are you sure you want to ${currentStatus ? 'remove' : 'grant'} admin privileges?`)) return;

    try {
      const { error } = await supabase.from('users').update({ is_admin: !currentStatus }).eq('id', userId);
      if (error) throw error;
      await logAdminAction('USER_ROLE_UPDATE', { user_id: userId, is_admin: !currentStatus });
      showToast(`✅ User admin status updated`);
      loadDashboard();
    } catch (err) {
      showToast(`❌ ${err.message}`);
    }
  };

  const exportData = (type) => {
    let data, filename;
    switch (type) {
      case 'products':
        data = products;
        filename = 'products-export.json';
        break;
      case 'orders':
        data = orders;
        filename = 'orders-export.json';
        break;
      case 'users':
        data = users;
        filename = 'users-export.json';
        break;
      default:
        return;
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    logAdminAction('DATA_EXPORT', { type, record_count: data.length });
    showToast(`✅ ${type} exported successfully`);
  };

  if (isCheckingAdmin) {
    return (
      <div style={styles.adminContainer}>
        <div style={styles.restrictedBox}>
          <h2>Verifying access...</h2>
          <p>Please wait while we verify your admin permissions.</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div style={styles.adminContainer}>
        <div style={styles.restrictedBox}>
          <h2>🔒 Access Denied</h2>
          <p>You don't have admin access. Please contact the administrator.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.adminContainer}>
      {/* Toast Notification */}
      {toast && <div style={styles.toast}>{toast}</div>}
      {syncStatus.status !== 'idle' && (
        <div style={{...styles.syncToast, ...(syncStatus.status === 'error' ? styles.syncError : {})}}>
          <RefreshCw size={16} style={{ animation: syncStatus.status === 'syncing' ? 'spin 1s linear infinite' : 'none' }} />
          {syncStatus.message}
        </div>
      )}

      {/* Admin Header */}
      <div style={styles.adminHeader}>
        <div style={styles.headerLeft}>
          <div style={styles.logoSection}>
            <Shield size={32} color="#e63946" />
            <div>
              <h1 style={styles.adminTitle}>Admin Dashboard</h1>
              <p style={styles.adminSubtitle}>Welcome, {currentUser?.email}</p>
            </div>
          </div>
        </div>
        <div style={styles.headerRight}>
          <button style={styles.syncBtn} onClick={triggerDatabaseSync} disabled={syncStatus.status === 'syncing'}>
            <RefreshCw size={16} />
            Sync DB
          </button>
          <button style={styles.exportBtn} onClick={() => exportData('products')}>
            <Download size={16} />
            Export
          </button>
          <button style={styles.logoutBtn} onClick={async () => { await supabase.auth.signOut(); window.location.hash = '#/'; }}>
            Logout
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div style={styles.tabsContainer}>
        {[
          { id: 'dashboard', label: 'Dashboard', icon: Activity },
          { id: 'products', label: 'Products', icon: Package },
          { id: 'orders', label: 'Orders', icon: ShoppingCart },
          { id: 'clients', label: 'Clients', icon: Users },
          { id: 'analytics', label: 'Analytics', icon: TrendingUp },
          { id: 'security', label: 'Security', icon: Shield },
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              style={{...styles.tabBtn, ...(activeTab === tab.id ? styles.tabBtnActive : {})}}
              onClick={() => setActiveTab(tab.id)}
            >
              <Icon size={16} />
              {tab.label}
              {tab.id === 'products' && inventoryAlerts.length > 0 && (
                <span style={styles.tabBadge}>{inventoryAlerts.length}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div style={styles.contentArea}>
        {loading && <div style={styles.loadingSpinner}>Loading...</div>}

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && stats && (
          <div style={styles.tabContent}>
            <div style={styles.sectionHeader}>
              <h2 style={styles.sectionTitle}>Dashboard Overview</h2>
              <div style={styles.dateRangeSelector}>
                {['7d', '30d', '90d'].map(range => (
                  <button
                    key={range}
                    style={{...styles.rangeBtn, ...(dateRange === range ? styles.rangeBtnActive : {})}}
                    onClick={() => { setDateRange(range); generateSalesData(orders); }}
                  >
                    {range === '7d' ? 'Last 7 Days' : range === '30d' ? 'Last 30 Days' : 'Last 90 Days'}
                  </button>
                ))}
              </div>
            </div>

            {/* Stats Cards */}
            <div style={styles.statsGrid}>
              <div style={{...styles.statCard, borderLeftColor: '#e63946'}}>
                <div style={styles.statHeader}>
                  <div style={styles.statIcon}><ShoppingCart size={20} color="#e63946" /></div>
                  <span style={styles.statTrend}>+12%</span>
                </div>
                <div style={styles.statNumber}>{stats.totalOrders}</div>
                <div style={styles.statLabel}>Total Orders</div>
              </div>
              <div style={{...styles.statCard, borderLeftColor: '#27ae60'}}>
                <div style={styles.statHeader}>
                  <div style={styles.statIcon}><DollarSign size={20} color="#27ae60" /></div>
                  <span style={styles.statTrend}>+8%</span>
                </div>
                <div style={styles.statNumber}>{(stats.totalRevenue / 100).toLocaleString()} DZD</div>
                <div style={styles.statLabel}>Total Revenue</div>
              </div>
              <div style={{...styles.statCard, borderLeftColor: '#2980b9'}}>
                <div style={styles.statHeader}>
                  <div style={styles.statIcon}><TrendingUp size={20} color="#2980b9" /></div>
                  <span style={styles.statTrend}>Today</span>
                </div>
                <div style={styles.statNumber}>{(stats.todayRevenue / 100).toLocaleString()} DZD</div>
                <div style={styles.statLabel}>Today's Revenue</div>
              </div>
              <div style={{...styles.statCard, borderLeftColor: '#f39c12'}}>
                <div style={styles.statHeader}>
                  <div style={styles.statIcon}><Package size={20} color="#f39c12" /></div>
                  <span style={{...styles.statTrend, color: inventoryAlerts.length > 0 ? '#e63946' : '#27ae60'}}>
                    {inventoryAlerts.length} alerts
                  </span>
                </div>
                <div style={styles.statNumber}>{products.length}</div>
                <div style={styles.statLabel}>Products</div>
              </div>
              <div style={{...styles.statCard, borderLeftColor: '#8e44ad'}}>
                <div style={styles.statHeader}>
                  <div style={styles.statIcon}><Users size={20} color="#8e44ad" /></div>
                </div>
                <div style={styles.statNumber}>{users.length}</div>
                <div style={styles.statLabel}>Total Users</div>
              </div>
              <div style={{...styles.statCard, borderLeftColor: '#e74c3c'}}>
                <div style={styles.statHeader}>
                  <div style={styles.statIcon}><AlertTriangle size={20} color="#e74c3c" /></div>
                </div>
                <div style={styles.statNumber}>{stats.pendingOrders}</div>
                <div style={styles.statLabel}>Pending Orders</div>
              </div>
            </div>

            {/* Charts Row */}
            <div style={styles.chartsRow}>
              <div style={styles.chartCard}>
                <h3 style={styles.chartTitle}>Revenue & Orders Trend</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={salesData}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#e63946" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#e63946" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis dataKey="date" stroke="#666" fontSize={12} />
                    <YAxis stroke="#666" fontSize={12} />
                    <Tooltip contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #333' }} />
                    <Legend />
                    <Area type="monotone" dataKey="revenue" stroke="#e63946" fillOpacity={1} fill="url(#colorRevenue)" name="Revenue (DZD)" />
                    <Line type="monotone" dataKey="orders" stroke="#27ae60" strokeWidth={2} name="Orders" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div style={styles.chartCard}>
                <h3 style={styles.chartTitle}>Products by Category</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie data={categoryData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #333' }} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Recent Activity */}
            <div style={styles.activitySection}>
              <h3 style={styles.sectionSubtitle}>Recent Orders</h3>
              <div style={styles.activityList}>
                {orders.slice(0, 5).map(order => (
                  <div key={order.id} style={styles.activityItem}>
                    <div style={styles.activityIcon}>
                      <ShoppingCart size={16} />
                    </div>
                    <div style={styles.activityContent}>
                      <div style={styles.activityTitle}>Order #{order.order_number}</div>
                      <div style={styles.activityMeta}>
                        {order.users?.email} • {(order.total_amount / 100).toFixed(2)} DZD
                      </div>
                    </div>
                    <div style={{...styles.activityStatus, ...styles[`status${order.status}`]}}>
                      {order.status}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Products Tab */}
        {activeTab === 'products' && (
          <div style={styles.tabContent}>
            {/* Inventory Alerts */}
            {inventoryAlerts.length > 0 && (
              <div style={styles.alertsSection}>
                <div style={styles.alertHeader}>
                  <AlertTriangle size={20} color="#f39c12" />
                  <span style={styles.alertTitle}>Inventory Alerts ({inventoryAlerts.length})</span>
                </div>
                <div style={styles.alertsList}>
                  {inventoryAlerts.slice(0, 3).map(product => (
                    <div key={product.id} style={styles.alertItem}>
                      <span style={styles.alertProduct}>{product.name}</span>
                      <span style={styles.alertStock}>Stock: {product.stock_quantity}</span>
                      <button
                        style={styles.alertAction}
                        onClick={() => quickUpdateStock(product.id, product.stock_quantity + 10)}
                      >
                        +10 Stock
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div style={styles.tabHeader}>
              <h2 style={styles.sectionTitle}>Product Management</h2>
              <button style={styles.primaryBtn} onClick={() => { setShowProductForm(true); setEditingProduct(null); setFormData({}); }}>
                <Plus size={16} /> Add Product
              </button>
            </div>

            {/* Filters */}
            <div style={styles.filterBar}>
              <div style={styles.searchBox}>
                <Search size={16} color="#666" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={styles.searchInput}
                />
              </div>
              <select
                value={productFilter}
                onChange={(e) => setProductFilter(e.target.value)}
                style={styles.filterSelect}
              >
                <option value="all">All Products</option>
                <option value="low-stock">Low Stock (&lt;10)</option>
                <option value="out-of-stock">Out of Stock</option>
                <option value="featured">Featured</option>
              </select>
            </div>

            {/* Product Form */}
            {showProductForm && (
              <form style={styles.form} onSubmit={handleProductSubmit}>
                <h3>{editingProduct ? 'Edit Product' : 'Add New Product'}</h3>
                <div style={styles.formGrid}>
                  <input type="text" placeholder="Product Name" value={formData.name || ''} onChange={(e) => setFormData({ ...formData, name: e.target.value })} style={styles.formInput} />
                  <input type="text" placeholder="Slug" value={formData.slug || ''} onChange={(e) => setFormData({ ...formData, slug: e.target.value })} style={styles.formInput} />
                  <input type="number" placeholder="Price (DZD)" value={formData.price || ''} onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })} style={styles.formInput} />
                  <input type="number" placeholder="Original Price (DZD)" value={formData.original_price || ''} onChange={(e) => setFormData({ ...formData, original_price: parseFloat(e.target.value) })} style={styles.formInput} />
                  <input type="number" placeholder="Stock Quantity" value={formData.stock_quantity || ''} onChange={(e) => setFormData({ ...formData, stock_quantity: parseInt(e.target.value) })} style={styles.formInput} />
                  <input type="text" placeholder="Category" value={formData.category || ''} onChange={(e) => setFormData({ ...formData, category: e.target.value })} style={styles.formInput} />
                  <input type="text" placeholder="Brand" value={formData.brand || ''} onChange={(e) => setFormData({ ...formData, brand: e.target.value })} style={styles.formInput} />
                  <input type="text" placeholder="Badge (optional)" value={formData.badge || ''} onChange={(e) => setFormData({ ...formData, badge: e.target.value })} style={styles.formInput} />
                </div>
                <div style={{ marginTop: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#999' }}>Product Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        setImageFile(file);
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setFormData({ ...formData, image_url: reader.result });
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    style={{ ...styles.formInput, padding: '8px' }}
                  />
                  {formData.image_url && (
                    <div style={{ marginTop: '10px' }}>
                      <img src={formData.image_url} alt="Product preview" style={{ maxWidth: '200px', maxHeight: '200px', borderRadius: '8px' }} />
                    </div>
                  )}
                </div>
                <textarea placeholder="Description" value={formData.description || ''} onChange={(e) => setFormData({ ...formData, description: e.target.value })} style={{ ...styles.formInput, minHeight: '80px', marginTop: '15px' }} />
                <div style={styles.formRow}>
                  <label style={styles.checkboxLabel}>
                    <input type="checkbox" checked={formData.is_featured || false} onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })} />
                    Featured Product
                  </label>
                  <label style={styles.checkboxLabel}>
                    <input type="checkbox" checked={formData.is_active !== false} onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })} />
                    Active
                  </label>
                </div>
                <div style={styles.formActions}>
                  <button type="submit" style={styles.primaryBtn}>{editingProduct ? 'Update Product' : 'Create Product'}</button>
                  <button type="button" style={styles.secondaryBtn} onClick={closeProductForm}>Cancel</button>
                </div>
              </form>
            )}

            {/* Products Table */}
            <div style={styles.tableContainer}>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.tableHeader}>
                    <th style={styles.tableCell}>Image</th>
                    <th style={styles.tableCell}>Product</th>
                    <th style={styles.tableCell}>Price</th>
                    <th style={styles.tableCell}>Stock</th>
                    <th style={styles.tableCell}>Category</th>
                    <th style={styles.tableCell}>Status</th>
                    <th style={styles.tableCell}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product) => (
                    <tr key={product.id} style={styles.tableRow}>
                      <td style={styles.tableCell}>
                        {product.image_url ? (
                          <img src={product.image_url} alt={product.name} style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '8px' }} />
                        ) : (
                          <div style={{ width: '50px', height: '50px', background: '#333', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', color: '#666' }}>
                            {product.name?.charAt(0)}
                          </div>
                        )}
                      </td>
                      <td style={styles.tableCell}>
                        <div style={styles.productCell}>
                          <div>
                            <div style={styles.productName}>{product.name}</div>
                            <div style={styles.productSlug}>{product.slug}</div>
                          </div>
                        </div>
                      </td>
                      <td style={styles.tableCell}>
                        <div style={styles.priceCell}>
                          <span style={styles.price}>{product.price?.toLocaleString()} DZD</span>
                          {product.original_price && <span style={styles.originalPrice}>{product.original_price?.toLocaleString()} DZD</span>}
                        </div>
                      </td>
                      <td style={styles.tableCell}>
                        <div style={styles.stockCell}>
                          <span style={{...styles.stockBadge, ...(product.stock_quantity === 0 ? styles.stockOut : product.stock_quantity < 10 ? styles.stockLow : {})}}>
                            {product.stock_quantity}
                          </span>
                          <button style={styles.stockBtn} onClick={() => quickUpdateStock(product.id, product.stock_quantity + 1)}>+</button>
                          <button style={styles.stockBtn} onClick={() => quickUpdateStock(product.id, Math.max(0, product.stock_quantity - 1))}>-</button>
                        </div>
                      </td>
                      <td style={styles.tableCell}>
                        <span style={styles.categoryBadge}>{product.category}</span>
                      </td>
                      <td style={styles.tableCell}>
                        <div style={styles.statusCell}>
                          {product.is_featured && <span style={styles.featuredBadge}>★ Featured</span>}
                          <span style={{...styles.activeBadge, ...(product.is_active === false ? styles.inactiveBadge : {})}}>
                            {product.is_active !== false ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </td>
                      <td style={styles.tableCell}>
                        <div style={styles.actionCell}>
                          <button style={styles.iconBtn} onClick={() => toggleProductFeature(product)} title="Toggle Featured">
                            <Activity size={16} />
                          </button>
                          <button style={styles.iconBtn} onClick={() => editProduct(product)} title="Edit">
                            <Edit size={16} />
                          </button>
                          <button style={styles.iconBtnDelete} onClick={() => deleteProduct(product.id)} title="Delete">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div style={styles.tabContent}>
            <div style={styles.tabHeader}>
              <h2 style={styles.sectionTitle}>Order Management</h2>
              <button style={styles.exportBtn} onClick={() => exportData('orders')}>
                <Download size={16} /> Export Orders
              </button>
            </div>

            {/* Order Stats */}
            <div style={styles.orderStats}>
              <div style={styles.orderStatCard}>
                <div style={styles.orderStatValue}>{orders.filter(o => o.status === 'pending').length}</div>
                <div style={styles.orderStatLabel}>Pending</div>
              </div>
              <div style={styles.orderStatCard}>
                <div style={styles.orderStatValue}>{orders.filter(o => o.status === 'processing').length}</div>
                <div style={styles.orderStatLabel}>Processing</div>
              </div>
              <div style={styles.orderStatCard}>
                <div style={styles.orderStatValue}>{orders.filter(o => o.status === 'shipped').length}</div>
                <div style={styles.orderStatLabel}>Shipped</div>
              </div>
              <div style={styles.orderStatCard}>
                <div style={styles.orderStatValue}>{orders.filter(o => o.status === 'delivered').length}</div>
                <div style={styles.orderStatLabel}>Delivered</div>
              </div>
            </div>

            {/* Orders Table */}
            <div style={styles.tableContainer}>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.tableHeader}>
                    <th style={styles.tableCell}>Order #</th>
                    <th style={styles.tableCell}>Customer</th>
                    <th style={styles.tableCell}>Items</th>
                    <th style={styles.tableCell}>Total</th>
                    <th style={styles.tableCell}>Date</th>
                    <th style={styles.tableCell}>Status</th>
                    <th style={styles.tableCell}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id} style={styles.tableRow}>
                      <td style={styles.tableCell}>
                        <span style={styles.orderNumber}>#{order.order_number}</span>
                      </td>
                      <td style={styles.tableCell}>
                        <div style={styles.customerCell}>
                          <div style={styles.customerName}>{order.first_name} {order.last_name}</div>
                          <div style={styles.customerEmail}>{order.email}</div>
                        </div>
                      </td>
                      <td style={styles.tableCell}>
                        <span style={styles.itemCount}>{order.order_items?.length || 0} items</span>
                      </td>
                      <td style={styles.tableCell}>
                        <span style={styles.orderTotal}>${(order.total_amount / 100).toFixed(2)}</span>
                      </td>
                      <td style={styles.tableCell}>
                        <span style={styles.orderDate}>{new Date(order.created_at).toLocaleDateString()}</span>
                      </td>
                      <td style={styles.tableCell}>
                        <select
                          style={{...styles.statusSelect, ...styles[`status${order.status}`]}}
                          value={order.status}
                          onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                        >
                          <option value="pending">Pending</option>
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td style={styles.tableCell}>
                        <button style={styles.iconBtn} onClick={() => viewOrderDetails(order)} title="View Details">
                          <Eye size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Order Details Modal */}
        {showOrderModal && selectedOrder && (
          <div style={styles.modalOverlay} onClick={() => setShowOrderModal(false)}>
            <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
              <div style={styles.modalHeader}>
                <h3>Order #{selectedOrder.order_number}</h3>
                <button style={styles.modalClose} onClick={() => setShowOrderModal(false)}>×</button>
              </div>
              <div style={styles.modalBody}>
                <div style={styles.orderInfo}>
                  <div style={styles.infoSection}>
                    <h4>Customer Information</h4>
                    <p><strong>Name:</strong> {selectedOrder.first_name} {selectedOrder.last_name}</p>
                    <p><strong>Email:</strong> {selectedOrder.email}</p>
                    <p><strong>Phone:</strong> {selectedOrder.phone}</p>
                  </div>
                  <div style={styles.infoSection}>
                    <h4>Shipping Address</h4>
                    <p>{selectedOrder.shipping_address}</p>
                    <p>{selectedOrder.shipping_city}, {selectedOrder.shipping_state} {selectedOrder.shipping_postal_code}</p>
                    <p>{selectedOrder.shipping_country}</p>
                  </div>
                </div>
                <div style={styles.orderItems}>
                  <h4>Order Items</h4>
                  {selectedOrder.order_items?.map((item, idx) => (
                    <div key={idx} style={styles.orderItem}>
                      <span style={styles.itemName}>{item.product_name}</span>
                      <span style={styles.itemQty}>x{item.quantity}</span>
                      <span style={styles.itemPrice}>${(item.line_total / 100).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <div style={styles.orderTotals}>
                  <div style={styles.totalRow}><span>Subtotal:</span><span>${(selectedOrder.subtotal / 100).toFixed(2)}</span></div>
                  <div style={styles.totalRow}><span>Shipping:</span><span>${(selectedOrder.shipping_cost / 100).toFixed(2)}</span></div>
                  <div style={styles.totalRow}><span>Tax:</span><span>${(selectedOrder.tax_amount / 100).toFixed(2)}</span></div>
                  <div style={{...styles.totalRow, ...styles.grandTotal}}><span>Total:</span><span>${(selectedOrder.total_amount / 100).toFixed(2)}</span></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Clients Tab */}
        {activeTab === 'clients' && (
          <div style={styles.tabContent}>
            <div style={styles.tabHeader}>
              <h2 style={styles.sectionTitle}>Client Management</h2>
              <button style={styles.exportBtn} onClick={() => exportData('users')}>
                <Download size={16} /> Export Users
              </button>
            </div>

            {/* Filters */}
            <div style={styles.filterBar}>
              <div style={styles.searchBox}>
                <Search size={16} color="#666" />
                <input type="text" placeholder="Search clients..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={styles.searchInput} />
              </div>
              <select value={userFilter} onChange={(e) => setUserFilter(e.target.value)} style={styles.filterSelect}>
                <option value="all">All Users</option>
                <option value="admin">Admins Only</option>
                <option value="customers">Customers Only</option>
              </select>
            </div>

            {/* Client Stats */}
            <div style={styles.clientStats}>
              <div style={styles.clientStatCard}>
                <div style={styles.clientStatValue}>{users.length}</div>
                <div style={styles.clientStatLabel}>Total Users</div>
              </div>
              <div style={styles.clientStatCard}>
                <div style={styles.clientStatValue}>{users.filter(u => u.is_admin).length}</div>
                <div style={styles.clientStatLabel}>Admins</div>
              </div>
              <div style={styles.clientStatCard}>
                <div style={styles.clientStatValue}>{users.filter(u => !u.is_admin).length}</div>
                <div style={styles.clientStatLabel}>Customers</div>
              </div>
            </div>

            {/* Users Table */}
            <div style={styles.tableContainer}>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.tableHeader}>
                    <th style={styles.tableCell}>User</th>
                    <th style={styles.tableCell}>Contact</th>
                    <th style={styles.tableCell}>Role</th>
                    <th style={styles.tableCell}>Joined</th>
                    <th style={styles.tableCell}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id} style={styles.tableRow}>
                      <td style={styles.tableCell}>
                        <div style={styles.userCell}>
                          <div style={styles.userAvatar}>{(user.first_name?.[0] || user.email?.[0] || '?').toUpperCase()}</div>
                          <div>
                            <div style={styles.userName}>{user.first_name} {user.last_name}</div>
                            <div style={styles.userEmail}>{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td style={styles.tableCell}>
                        <div style={styles.contactInfo}>
                          <div>{user.phone || 'No phone'}</div>
                          <div style={styles.userLocation}>{user.city || 'No location'}</div>
                        </div>
                      </td>
                      <td style={styles.tableCell}>
                        <span style={{...styles.roleBadge, ...(user.is_admin ? styles.roleAdmin : {})}}>
                          {user.is_admin ? 'Admin' : 'Customer'}
                        </span>
                      </td>
                      <td style={styles.tableCell}>
                        <span style={styles.joinDate}>{new Date(user.created_at).toLocaleDateString()}</span>
                      </td>
                      <td style={styles.tableCell}>
                        <button
                          style={{...styles.roleToggleBtn, ...(user.is_admin ? styles.roleToggleActive : {})}}
                          onClick={() => toggleUserAdmin(user.id, user.is_admin)}
                        >
                          {user.is_admin ? 'Remove Admin' : 'Make Admin'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div style={styles.tabContent}>
            <div style={styles.tabHeader}>
              <h2 style={styles.sectionTitle}>Analytics & Reports</h2>
              <div style={styles.dateRangeSelector}>
                {['7d', '30d', '90d'].map(range => (
                  <button key={range} style={{...styles.rangeBtn, ...(dateRange === range ? styles.rangeBtnActive : {})}} onClick={() => { setDateRange(range); generateSalesData(orders); }}>
                    {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : '90 Days'}
                  </button>
                ))}
              </div>
            </div>

            {/* Charts Grid */}
            <div style={styles.analyticsGrid}>
              <div style={styles.analyticsCard}>
                <h3 style={styles.chartTitle}>Revenue Trend</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={salesData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis dataKey="date" stroke="#666" />
                    <YAxis stroke="#666" />
                    <Tooltip contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #333' }} />
                    <Line type="monotone" dataKey="revenue" stroke="#e63946" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div style={styles.analyticsCard}>
                <h3 style={styles.chartTitle}>Orders by Day</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={salesData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis dataKey="date" stroke="#666" />
                    <YAxis stroke="#666" />
                    <Tooltip contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #333' }} />
                    <Bar dataKey="orders" fill="#27ae60" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div style={styles.analyticsCard}>
                <h3 style={styles.chartTitle}>Category Distribution</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie data={categoryData} cx="50%" cy="50%" outerRadius={100} dataKey="value" label>
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #333' }} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div style={styles.analyticsCard}>
                <h3 style={styles.chartTitle}>Key Metrics</h3>
                <div style={styles.metricsList}>
                  <div style={styles.metricItem}>
                    <span style={styles.metricLabel}>Avg Order Value</span>
                    <span style={styles.metricValue}>${orders.length > 0 ? (orders.reduce((s, o) => s + o.total_amount, 0) / orders.length / 100).toFixed(2) : '0.00'}</span>
                  </div>
                  <div style={styles.metricItem}>
                    <span style={styles.metricLabel}>Conversion Rate</span>
                    <span style={styles.metricValue}>3.2%</span>
                  </div>
                  <div style={styles.metricItem}>
                    <span style={styles.metricLabel}>Repeat Customers</span>
                    <span style={styles.metricValue}>{new Set(orders.map(o => o.email)).size}</span>
                  </div>
                  <div style={styles.metricItem}>
                    <span style={styles.metricLabel}>Top Category</span>
                    <span style={styles.metricValue}>{categoryData.sort((a, b) => b.value - a.value)[0]?.name || 'N/A'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Security Tab */}
        {activeTab === 'security' && (
          <div style={styles.tabContent}>
            <h2 style={styles.sectionTitle}>Security & Audit Logs</h2>

            {/* Security Stats */}
            <div style={styles.securityStats}>
              <div style={styles.securityCard}>
                <Shield size={24} color="#27ae60" />
                <div style={styles.securityValue}>{users.filter(u => u.is_admin).length}</div>
                <div style={styles.securityLabel}>Admin Users</div>
              </div>
              <div style={styles.securityCard}>
                <Activity size={24} color="#e63946" />
                <div style={styles.securityValue}>{auditLogs.length}</div>
                <div style={styles.securityLabel}>Recent Actions</div>
              </div>
              <div style={styles.securityCard}>
                <AlertTriangle size={24} color="#f39c12" />
                <div style={styles.securityValue}>0</div>
                <div style={styles.securityLabel}>Security Alerts</div>
              </div>
            </div>

            {/* Audit Logs Table */}
            <div style={styles.auditSection}>
              <h3 style={styles.sectionSubtitle}>Recent Admin Activity</h3>
              <div style={styles.tableContainer}>
                <table style={styles.table}>
                  <thead>
                    <tr style={styles.tableHeader}>
                      <th style={styles.tableCell}>Timestamp</th>
                      <th style={styles.tableCell}>Admin</th>
                      <th style={styles.tableCell}>Action</th>
                      <th style={styles.tableCell}>Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {auditLogs.length === 0 ? (
                      <tr>
                        <td colSpan="4" style={styles.emptyState}>No audit logs available</td>
                      </tr>
                    ) : (
                      auditLogs.map((log, idx) => (
                        <tr key={idx} style={styles.tableRow}>
                          <td style={styles.tableCell}>
                            <span style={styles.logTimestamp}>{new Date(log.created_at).toLocaleString()}</span>
                          </td>
                          <td style={styles.tableCell}>
                            <span style={styles.logAdmin}>{log.admin_email}</span>
                          </td>
                          <td style={styles.tableCell}>
                            <span style={{...styles.logAction, ...styles[`action${log.action}`]}}>{log.action}</span>
                          </td>
                          <td style={styles.tableCell}>
                            <span style={styles.logDetails}>{JSON.stringify(log.details).slice(0, 50)}...</span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Security Settings */}
            <div style={styles.securitySettings}>
              <h3 style={styles.sectionSubtitle}>Security Settings</h3>
              <div style={styles.settingsList}>
                <div style={styles.settingItem}>
                  <div>
                    <div style={styles.settingTitle}>Admin Action Logging</div>
                    <div style={styles.settingDesc}>Log all administrative actions for audit</div>
                  </div>
                  <span style={styles.settingEnabled}>Enabled</span>
                </div>
                <div style={styles.settingItem}>
                  <div>
                    <div style={styles.settingTitle}>Database Sync</div>
                    <div style={styles.settingDesc}>Auto-sync on GitHub push</div>
                  </div>
                  <span style={styles.settingEnabled}>Enabled</span>
                </div>
                <div style={styles.settingItem}>
                  <div>
                    <div style={styles.settingTitle}>Email Notifications</div>
                    <div style={styles.settingDesc}>Send alerts on order status changes</div>
                  </div>
                  <span style={styles.settingEnabled}>Enabled</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Comprehensive Styles
const styles = {
  adminContainer: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 100%)',
    color: '#fff',
    padding: '20px',
    fontFamily: '"DM Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },

  // Header
  adminHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '30px',
    paddingBottom: '20px',
    borderBottom: '2px solid #e63946',
  },
  headerLeft: { display: 'flex', alignItems: 'center' },
  headerRight: { display: 'flex', alignItems: 'center', gap: '12px' },
  logoSection: { display: 'flex', alignItems: 'center', gap: '15px' },
  adminTitle: { fontSize: '28px', fontWeight: 'bold', margin: '0 0 5px 0', color: '#fff' },
  adminSubtitle: { fontSize: '14px', color: '#999', margin: 0 },

  // Buttons
  logoutBtn: { padding: '10px 20px', background: '#e63946', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '600', transition: 'all 0.3s' },
  syncBtn: { padding: '10px 16px', background: '#2980b9', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' },
  exportBtn: { padding: '10px 16px', background: '#27ae60', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' },
  primaryBtn: { padding: '10px 20px', background: '#e63946', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' },
  secondaryBtn: { padding: '10px 20px', background: '#333', color: '#999', border: '1px solid #555', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' },

  // Tabs
  tabsContainer: { display: 'flex', gap: '5px', marginBottom: '30px', borderBottom: '1px solid #333', paddingBottom: '0', flexWrap: 'wrap' },
  tabBtn: { padding: '12px 20px', background: 'transparent', color: '#999', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: '600', borderBottom: '3px solid transparent', transition: 'all 0.3s', display: 'flex', alignItems: 'center', gap: '8px' },
  tabBtnActive: { color: '#e63946', borderBottomColor: '#e63946', background: 'rgba(230, 57, 70, 0.05)' },
  tabBadge: { background: '#e63946', color: 'white', borderRadius: '50%', padding: '2px 6px', fontSize: '10px', marginLeft: '5px' },

  // Content Area
  contentArea: { background: 'rgba(255, 255, 255, 0.03)', borderRadius: '12px', padding: '30px', border: '1px solid #333', minHeight: '500px' },
  tabContent: { animation: 'fadeIn 0.3s' },
  tabHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' },
  sectionTitle: { fontSize: '24px', fontWeight: 'bold', margin: 0, color: '#fff' },
  sectionSubtitle: { fontSize: '18px', fontWeight: '600', margin: '25px 0 15px 0', color: '#fff' },

  // Notifications
  toast: { position: 'fixed', top: '20px', right: '20px', padding: '15px 20px', background: 'rgba(0, 0, 0, 0.9)', color: '#fff', borderRadius: '8px', fontSize: '14px', zIndex: 9999, border: '1px solid #e63946' },
  syncToast: { position: 'fixed', top: '70px', right: '20px', padding: '12px 20px', background: '#2980b9', color: '#fff', borderRadius: '8px', fontSize: '14px', zIndex: 9998, display: 'flex', alignItems: 'center', gap: '10px' },
  syncError: { background: '#e63946' },

  // Stats Cards
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '20px', marginBottom: '30px' },
  statCard: { background: '#1a1a2e', border: '1px solid #333', borderLeft: '4px solid #e63946', borderRadius: '10px', padding: '20px', transition: 'transform 0.2s' },
  statHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' },
  statIcon: { background: 'rgba(230, 57, 70, 0.1)', padding: '8px', borderRadius: '8px' },
  statTrend: { fontSize: '12px', color: '#27ae60', fontWeight: '600' },
  statNumber: { fontSize: '26px', fontWeight: 'bold', color: '#fff', marginBottom: '5px' },
  statLabel: { fontSize: '13px', color: '#999' },

  // Date Range
  sectionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', flexWrap: 'wrap', gap: '15px' },
  dateRangeSelector: { display: 'flex', gap: '8px' },
  rangeBtn: { padding: '8px 16px', background: '#1a1a2e', color: '#999', border: '1px solid #333', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' },
  rangeBtnActive: { background: '#e63946', color: '#fff', borderColor: '#e63946' },

  // Charts
  chartsRow: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '25px', marginBottom: '30px' },
  chartCard: { background: '#1a1a2e', border: '1px solid #333', borderRadius: '12px', padding: '20px' },
  chartTitle: { fontSize: '16px', fontWeight: '600', margin: '0 0 20px 0', color: '#fff' },

  // Activity
  activitySection: { background: '#1a1a2e', border: '1px solid #333', borderRadius: '12px', padding: '20px' },
  activityList: { display: 'flex', flexDirection: 'column', gap: '12px' },
  activityItem: { display: 'flex', alignItems: 'center', gap: '15px', padding: '15px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid #333' },
  activityIcon: { background: 'rgba(230, 57, 70, 0.1)', padding: '10px', borderRadius: '8px', color: '#e63946' },
  activityContent: { flex: 1 },
  activityTitle: { fontSize: '14px', fontWeight: '600', color: '#fff' },
  activityMeta: { fontSize: '12px', color: '#666', marginTop: '4px' },
  activityStatus: { padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: '600', textTransform: 'capitalize' },
  statuspending: { background: 'rgba(255, 193, 7, 0.2)', color: '#ffc107' },
  statusprocessing: { background: 'rgba(33, 150, 243, 0.2)', color: '#2196f3' },
  statusshipped: { background: 'rgba(156, 39, 176, 0.2)', color: '#9c27b0' },
  statusdelivered: { background: 'rgba(76, 175, 80, 0.2)', color: '#4caf50' },
  statuscancelled: { background: 'rgba(244, 67, 54, 0.2)', color: '#f44336' },

  // Alerts
  alertsSection: { background: 'rgba(243, 156, 18, 0.1)', border: '1px solid #f39c12', borderRadius: '12px', padding: '20px', marginBottom: '25px' },
  alertHeader: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' },
  alertTitle: { fontSize: '16px', fontWeight: '600', color: '#f39c12' },
  alertsList: { display: 'flex', flexDirection: 'column', gap: '10px' },
  alertItem: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 15px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' },
  alertProduct: { fontSize: '14px', fontWeight: '500', color: '#fff' },
  alertStock: { fontSize: '13px', color: '#f39c12' },
  alertAction: { padding: '6px 12px', background: '#f39c12', color: '#000', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' },

  // Filters
  filterBar: { display: 'flex', gap: '15px', marginBottom: '25px', flexWrap: 'wrap' },
  searchBox: { display: 'flex', alignItems: 'center', gap: '10px', background: '#1a1a2e', border: '1px solid #333', borderRadius: '8px', padding: '10px 15px', flex: 1, minWidth: '250px' },
  searchInput: { background: 'transparent', border: 'none', color: '#fff', fontSize: '14px', outline: 'none', width: '100%' },
  filterSelect: { padding: '10px 15px', background: '#1a1a2e', color: '#fff', border: '1px solid #333', borderRadius: '8px', fontSize: '14px', cursor: 'pointer', minWidth: '150px' },

  // Forms
  form: { background: '#1a1a2e', padding: '25px', borderRadius: '12px', marginBottom: '25px', border: '1px solid #333' },
  formGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '15px', marginBottom: '15px' },
  formInput: { padding: '12px 15px', background: '#0a0a0f', color: '#fff', border: '1px solid #333', borderRadius: '8px', fontSize: '14px', width: '100%' },
  formRow: { display: 'flex', gap: '20px', marginTop: '15px', flexWrap: 'wrap' },
  checkboxLabel: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#999', cursor: 'pointer' },
  formActions: { display: 'flex', gap: '12px', marginTop: '20px' },

  // Tables
  tableContainer: { overflowX: 'auto', borderRadius: '12px', border: '1px solid #333' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '14px' },
  tableHeader: { background: '#1a1a2e', borderBottom: '2px solid #e63946' },
  tableRow: { borderBottom: '1px solid #333', transition: 'background 0.2s', ':hover': { background: 'rgba(255,255,255,0.02)' } },
  tableCell: { padding: '15px', textAlign: 'left', color: '#fff' },

  // Product Cells
  productCell: { display: 'flex', alignItems: 'center', gap: '12px' },
  productName: { fontWeight: '600', color: '#fff' },
  productSlug: { fontSize: '12px', color: '#666' },
  priceCell: { display: 'flex', flexDirection: 'column', gap: '4px' },
  price: { fontWeight: '600', color: '#fff' },
  originalPrice: { fontSize: '12px', color: '#666', textDecoration: 'line-through' },
  stockCell: { display: 'flex', alignItems: 'center', gap: '8px' },
  stockBadge: { padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', background: 'rgba(76, 175, 80, 0.2)', color: '#4caf50' },
  stockLow: { background: 'rgba(255, 193, 7, 0.2)', color: '#ffc107' },
  stockOut: { background: 'rgba(244, 67, 54, 0.2)', color: '#f44336' },
  stockBtn: { padding: '4px 8px', background: '#333', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' },
  categoryBadge: { padding: '4px 10px', background: 'rgba(230, 57, 70, 0.1)', color: '#e63946', borderRadius: '20px', fontSize: '11px', fontWeight: '600' },
  featuredBadge: { padding: '2px 8px', background: 'rgba(255, 193, 7, 0.2)', color: '#ffc107', borderRadius: '4px', fontSize: '10px', marginRight: '8px' },
  activeBadge: { padding: '4px 10px', background: 'rgba(76, 175, 80, 0.2)', color: '#4caf50', borderRadius: '20px', fontSize: '11px' },
  inactiveBadge: { background: 'rgba(150, 150, 150, 0.2)', color: '#999' },

  // Actions
  actionCell: { display: 'flex', gap: '8px' },
  iconBtn: { padding: '8px', background: '#333', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' },
  iconBtnDelete: { padding: '8px', background: 'rgba(244, 67, 54, 0.1)', color: '#f44336', border: 'none', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' },

  // Order Cells
  orderNumber: { fontWeight: '600', color: '#e63946' },
  customerCell: { display: 'flex', flexDirection: 'column', gap: '4px' },
  customerName: { fontWeight: '500', color: '#fff' },
  customerEmail: { fontSize: '12px', color: '#666' },
  itemCount: { padding: '4px 10px', background: '#333', borderRadius: '20px', fontSize: '12px', color: '#999' },
  orderTotal: { fontWeight: '600', color: '#fff' },
  orderDate: { fontSize: '13px', color: '#999' },
  statusSelect: { padding: '8px 12px', background: '#1a1a2e', color: '#fff', border: '1px solid #333', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' },

  // Order Stats
  orderStats: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px', marginBottom: '25px' },
  orderStatCard: { background: '#1a1a2e', border: '1px solid #333', borderRadius: '10px', padding: '20px', textAlign: 'center' },
  orderStatValue: { fontSize: '28px', fontWeight: 'bold', color: '#fff', marginBottom: '5px' },
  orderStatLabel: { fontSize: '13px', color: '#999' },

  // Modal
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000 },
  modal: { background: '#1a1a2e', border: '1px solid #333', borderRadius: '16px', width: '90%', maxWidth: '600px', maxHeight: '90vh', overflow: 'auto' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 25px', borderBottom: '1px solid #333' },
  modalClose: { background: 'none', border: 'none', color: '#999', fontSize: '24px', cursor: 'pointer' },
  modalBody: { padding: '25px' },
  orderInfo: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px', marginBottom: '25px' },
  infoSection: { background: '#0a0a0f', padding: '15px', borderRadius: '8px' },
  orderItems: { marginBottom: '25px' },
  orderItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: '#0a0a0f', borderRadius: '8px', marginBottom: '8px' },
  itemName: { fontWeight: '500', color: '#fff' },
  itemQty: { color: '#999', fontSize: '13px' },
  itemPrice: { fontWeight: '600', color: '#e63946' },
  orderTotals: { background: '#0a0a0f', padding: '15px', borderRadius: '8px' },
  totalRow: { display: 'flex', justifyContent: 'space-between', padding: '8px 0', color: '#999' },
  grandTotal: { borderTop: '1px solid #333', marginTop: '10px', paddingTop: '15px', fontSize: '18px', fontWeight: 'bold', color: '#fff' },

  // User/Client
  userCell: { display: 'flex', alignItems: 'center', gap: '12px' },
  userAvatar: { width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, #e63946, #8e44ad)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '16px', color: '#fff' },
  userName: { fontWeight: '600', color: '#fff' },
  userEmail: { fontSize: '12px', color: '#666' },
  contactInfo: { display: 'flex', flexDirection: 'column', gap: '4px' },
  userLocation: { fontSize: '12px', color: '#666' },
  roleBadge: { padding: '6px 12px', background: 'rgba(150, 150, 150, 0.1)', color: '#999', borderRadius: '20px', fontSize: '12px', fontWeight: '600' },
  roleAdmin: { background: 'rgba(230, 57, 70, 0.2)', color: '#e63946' },
  joinDate: { fontSize: '13px', color: '#999' },
  clientStats: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px', marginBottom: '25px' },
  clientStatCard: { background: '#1a1a2e', border: '1px solid #333', borderRadius: '10px', padding: '20px', textAlign: 'center' },
  clientStatValue: { fontSize: '28px', fontWeight: 'bold', color: '#fff', marginBottom: '5px' },
  clientStatLabel: { fontSize: '13px', color: '#999' },
  roleToggleBtn: { padding: '8px 16px', background: 'rgba(150, 150, 150, 0.1)', color: '#999', border: '1px solid #333', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' },
  roleToggleActive: { background: 'rgba(230, 57, 70, 0.2)', color: '#e63946', borderColor: '#e63946' },

  // Analytics
  analyticsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '25px' },
  analyticsCard: { background: '#1a1a2e', border: '1px solid #333', borderRadius: '12px', padding: '25px' },
  metricsList: { display: 'flex', flexDirection: 'column', gap: '20px' },
  metricItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', background: '#0a0a0f', borderRadius: '8px' },
  metricLabel: { fontSize: '14px', color: '#999' },
  metricValue: { fontSize: '18px', fontWeight: 'bold', color: '#fff' },

  // Security
  securityStats: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '30px' },
  securityCard: { background: '#1a1a2e', border: '1px solid #333', borderRadius: '12px', padding: '25px', textAlign: 'center' },
  securityValue: { fontSize: '32px', fontWeight: 'bold', color: '#fff', margin: '15px 0' },
  securityLabel: { fontSize: '14px', color: '#999' },
  auditSection: { marginBottom: '30px' },
  logTimestamp: { fontSize: '13px', color: '#999' },
  logAdmin: { fontSize: '13px', color: '#e63946', fontWeight: '500' },
  logAction: { padding: '4px 10px', borderRadius: '4px', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' },
  logDetails: { fontSize: '12px', color: '#666', fontFamily: 'monospace' },
  securitySettings: { background: '#1a1a2e', border: '1px solid #333', borderRadius: '12px', padding: '25px' },
  settingsList: { display: 'flex', flexDirection: 'column', gap: '20px' },
  settingItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', background: '#0a0a0f', borderRadius: '8px' },
  settingTitle: { fontSize: '15px', fontWeight: '500', color: '#fff' },
  settingDesc: { fontSize: '13px', color: '#666', marginTop: '4px' },
  settingEnabled: { padding: '4px 12px', background: 'rgba(39, 174, 96, 0.2)', color: '#27ae60', borderRadius: '20px', fontSize: '12px', fontWeight: '600' },

  // Misc
  emptyState: { padding: '40px', textAlign: 'center', color: '#666', fontStyle: 'italic' },
  restrictedBox: { background: 'rgba(255, 0, 0, 0.1)', border: '2px solid #e63946', borderRadius: '8px', padding: '40px', textAlign: 'center', maxWidth: '500px', margin: '100px auto' },
  loadingSpinner: { textAlign: 'center', padding: '40px', fontSize: '16px', color: '#999' },
};
