// Admin Dashboard Component with Product & Order Management
import React, { useState, useEffect } from 'react';
import { supabase, db } from '../lib/supabase';

export default function AdminDashboard() {
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
  const [toast, setToast] = useState('');

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    setCurrentUser(user);
    const { isAdmin } = await db.checkAdminRole(user.id);
    setIsAdmin(isAdmin);

    if (!isAdmin) {
      setToast('⛔ Admin access denied');
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
    setLoading(false);
  };

  const showToast = (msg, duration = 3000) => {
    setToast(msg);
    setTimeout(() => setToast(''), duration);
  };

  // ===== PRODUCT MANAGEMENT =====
  const handleProductSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.price) {
      showToast('❌ Name and price are required');
      return;
    }

    try {
      if (editingProduct) {
        const { error } = await db.updateProduct(editingProduct.id, formData);
        if (error) throw error;
        showToast('✅ Product updated successfully');
      } else {
        const { error } = await db.createProduct(formData);
        if (error) throw error;
        showToast('✅ Product created successfully');
      }

      setShowProductForm(false);
      setEditingProduct(null);
      setFormData({});
      loadDashboard();
    } catch (err) {
      showToast(`❌ ${err.message}`);
    }
  };

  const editProduct = (product) => {
    setEditingProduct(product);
    setFormData(product);
    setShowProductForm(true);
  };

  const deleteProduct = async (id) => {
    if (!confirm('Are you sure? This cannot be undone.')) return;

    try {
      const { error } = await db.deleteProduct(id);
      if (error) throw error;
      showToast('✅ Product deleted');
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

      {/* Admin Header */}
      <div style={styles.adminHeader}>
        <div>
          <h1 style={styles.adminTitle}>⚙️ Admin Dashboard</h1>
          <p style={styles.adminSubtitle}>Welcome, {currentUser?.email}</p>
        </div>
        <button
          style={styles.logoutBtn}
          onClick={async () => {
            await supabase.auth.signOut();
            window.location.hash = '#/';
          }}
        >
          Logout
        </button>
      </div>

      {/* Navigation Tabs */}
      <div style={styles.tabsContainer}>
        {['dashboard', 'products', 'orders', 'users'].map(tab => (
          <button
            key={tab}
            style={{
              ...styles.tabBtn,
              ...(activeTab === tab ? styles.tabBtnActive : {}),
            }}
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={styles.contentArea}>
        {loading && <div style={styles.loadingSpinner}>Loading...</div>}

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && stats && (
          <div style={styles.tabContent}>
            <h2>Dashboard Overview</h2>
            <div style={styles.statsGrid}>
              <div style={styles.statCard}>
                <div style={styles.statNumber}>{stats.totalOrders}</div>
                <div style={styles.statLabel}>Total Orders</div>
              </div>
              <div style={styles.statCard}>
                <div style={styles.statNumber}>${(stats.totalRevenue / 100).toFixed(2)}</div>
                <div style={styles.statLabel}>Total Revenue</div>
              </div>
              <div style={styles.statCard}>
                <div style={styles.statNumber}>${(stats.todayRevenue / 100).toFixed(2)}</div>
                <div style={styles.statLabel}>Today's Revenue</div>
              </div>
              <div style={styles.statCard}>
                <div style={styles.statNumber}>{stats.pendingOrders}</div>
                <div style={styles.statLabel}>Pending Orders</div>
              </div>
              <div style={styles.statCard}>
                <div style={styles.statNumber}>{stats.completedOrders}</div>
                <div style={styles.statLabel}>Completed Orders</div>
              </div>
              <div style={styles.statCard}>
                <div style={styles.statNumber}>{products.length}</div>
                <div style={styles.statLabel}>Total Products</div>
              </div>
            </div>
          </div>
        )}

        {/* Products Tab */}
        {activeTab === 'products' && (
          <div style={styles.tabContent}>
            <div style={styles.tabHeader}>
              <h2>Product Management</h2>
              <button
                style={styles.primaryBtn}
                onClick={() => {
                  setShowProductForm(true);
                  setEditingProduct(null);
                  setFormData({});
                }}
              >
                + Add New Product
              </button>
            </div>

            {/* Product Form */}
            {showProductForm && (
              <form style={styles.form} onSubmit={handleProductSubmit}>
                <h3>{editingProduct ? 'Edit Product' : 'Add New Product'}</h3>
                <div style={styles.formGrid}>
                  <input
                    type="text"
                    placeholder="Product Name"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    style={styles.formInput}
                  />
                  <input
                    type="text"
                    placeholder="Slug (e.g., apex-predator-x)"
                    value={formData.slug || ''}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    style={styles.formInput}
                  />
                  <input
                    type="number"
                    placeholder="Price (cents)"
                    value={formData.price || ''}
                    onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) })}
                    style={styles.formInput}
                  />
                  <input
                    type="number"
                    placeholder="Stock Quantity"
                    value={formData.stock || ''}
                    onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) })}
                    style={styles.formInput}
                  />
                  <input
                    type="text"
                    placeholder="Category"
                    value={formData.category || ''}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    style={styles.formInput}
                  />
                  <input
                    type="text"
                    placeholder="Brand"
                    value={formData.brand || ''}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    style={styles.formInput}
                  />
                </div>
                <textarea
                  placeholder="Description"
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  style={{ ...styles.formInput, minHeight: '100px' }}
                />
                <div style={styles.formActions}>
                  <button type="submit" style={styles.primaryBtn}>
                    {editingProduct ? 'Update Product' : 'Create Product'}
                  </button>
                  <button
                    type="button"
                    style={styles.secondaryBtn}
                    onClick={closeProductForm}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {/* Products List */}
            <div style={styles.tableContainer}>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.tableHeader}>
                    <th style={styles.tableCell}>Product Name</th>
                    <th style={styles.tableCell}>Price</th>
                    <th style={styles.tableCell}>Stock</th>
                    <th style={styles.tableCell}>Category</th>
                    <th style={styles.tableCell}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id} style={styles.tableRow}>
                      <td style={styles.tableCell}>{product.name}</td>
                      <td style={styles.tableCell}>${(product.price / 100).toFixed(2)}</td>
                      <td style={styles.tableCell}>
                        <span style={{
                          ...styles.stockBadge,
                          ...(product.stock < 5 ? styles.stockLow : {}),
                        }}>
                          {product.stock}
                        </span>
                      </td>
                      <td style={styles.tableCell}>{product.category}</td>
                      <td style={styles.tableCell}>
                        <button
                          style={styles.editBtn}
                          onClick={() => editProduct(product)}
                        >
                          Edit
                        </button>
                        <button
                          style={styles.deleteBtn}
                          onClick={() => deleteProduct(product.id)}
                        >
                          Delete
                        </button>
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
            <h2>Order Management</h2>
            <div style={styles.tableContainer}>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.tableHeader}>
                    <th style={styles.tableCell}>Order #</th>
                    <th style={styles.tableCell}>Customer</th>
                    <th style={styles.tableCell}>Date</th>
                    <th style={styles.tableCell}>Amount</th>
                    <th style={styles.tableCell}>Status</th>
                    <th style={styles.tableCell}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id} style={styles.tableRow}>
                      <td style={styles.tableCell}>{order.order_number}</td>
                      <td style={styles.tableCell}>
                        {order.users?.first_name} {order.users?.last_name}
                      </td>
                      <td style={styles.tableCell}>
                        {new Date(order.created_at).toLocaleDateString()}
                      </td>
                      <td style={styles.tableCell}>${(order.total_amount / 100).toFixed(2)}</td>
                      <td style={styles.tableCell}>
                        <span style={{
                          ...styles.statusBadge,
                          ...styles[`status${order.status.charAt(0).toUpperCase() + order.status.slice(1)}`],
                        }}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </td>
                      <td style={styles.tableCell}>
                        <select
                          style={styles.statusSelect}
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
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div style={styles.tabContent}>
            <h2>User Management</h2>
            <div style={styles.tableContainer}>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.tableHeader}>
                    <th style={styles.tableCell}>Email</th>
                    <th style={styles.tableCell}>Name</th>
                    <th style={styles.tableCell}>Role</th>
                    <th style={styles.tableCell}>Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} style={styles.tableRow}>
                      <td style={styles.tableCell}>{user.email}</td>
                      <td style={styles.tableCell}>
                        {user.first_name} {user.last_name}
                      </td>
                      <td style={styles.tableCell}>
                        <span style={{
                          ...styles.roleBadge,
                          ...(user.role === 'admin' ? styles.roleAdmin : {}),
                        }}>
                          {user.role || 'user'}
                        </span>
                      </td>
                      <td style={styles.tableCell}>
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Styles
const styles = {
  adminContainer: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 100%)',
    color: '#fff',
    padding: '20px',
    fontFamily: '"DM Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },
  adminHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '30px',
    paddingBottom: '20px',
    borderBottom: '2px solid #e63946',
  },
  adminTitle: {
    fontSize: '32px',
    fontWeight: 'bold',
    margin: '0 0 5px 0',
  },
  adminSubtitle: {
    fontSize: '14px',
    color: '#999',
    margin: 0,
  },
  logoutBtn: {
    padding: '10px 20px',
    background: '#e63946',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    transition: 'all 0.3s',
  },
  tabsContainer: {
    display: 'flex',
    gap: '10px',
    marginBottom: '30px',
    borderBottom: '1px solid #333',
    paddingBottom: '0',
  },
  tabBtn: {
    padding: '12px 20px',
    background: 'transparent',
    color: '#999',
    border: 'none',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    borderBottom: '3px solid transparent',
    transition: 'all 0.3s',
  },
  tabBtnActive: {
    color: '#e63946',
    borderBottomColor: '#e63946',
  },
  contentArea: {
    background: 'rgba(255, 255, 255, 0.03)',
    borderRadius: '12px',
    padding: '30px',
    border: '1px solid #333',
    minHeight: '500px',
  },
  tabContent: {
    animation: 'fadeIn 0.3s',
  },
  tabHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  primaryBtn: {
    padding: '10px 20px',
    background: '#e63946',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    transition: 'all 0.3s',
  },
  secondaryBtn: {
    padding: '10px 20px',
    background: '#333',
    color: '#999',
    border: '1px solid #555',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    transition: 'all 0.3s',
  },
  form: {
    background: 'rgba(255, 255, 255, 0.05)',
    padding: '20px',
    borderRadius: '8px',
    marginBottom: '20px',
    border: '1px solid #333',
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '15px',
    marginBottom: '15px',
  },
  formInput: {
    padding: '10px 15px',
    background: '#1a1a2e',
    color: '#fff',
    border: '1px solid #333',
    borderRadius: '6px',
    fontSize: '14px',
    fontFamily: 'inherit',
  },
  formActions: {
    display: 'flex',
    gap: '10px',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '20px',
    marginTop: '20px',
  },
  statCard: {
    background: 'rgba(230, 57, 70, 0.1)',
    border: '1px solid #e63946',
    borderRadius: '8px',
    padding: '20px',
    textAlign: 'center',
  },
  statNumber: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#e63946',
    marginBottom: '10px',
  },
  statLabel: {
    fontSize: '14px',
    color: '#999',
  },
  tableContainer: {
    overflowX: 'auto',
    marginTop: '20px',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  tableHeader: {
    background: 'rgba(230, 57, 70, 0.1)',
    borderBottom: '2px solid #e63946',
  },
  tableRow: {
    borderBottom: '1px solid #333',
    transition: 'background 0.3s',
  },
  tableCell: {
    padding: '12px 15px',
    textAlign: 'left',
    fontSize: '14px',
  },
  editBtn: {
    padding: '6px 12px',
    background: '#0066cc',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px',
    marginRight: '5px',
  },
  deleteBtn: {
    padding: '6px 12px',
    background: '#cc0000',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px',
  },
  statusSelect: {
    padding: '6px 10px',
    background: '#1a1a2e',
    color: '#fff',
    border: '1px solid #333',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px',
  },
  statusBadge: {
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600',
  },
  statusPending: {
    background: 'rgba(255, 193, 7, 0.2)',
    color: '#ffc107',
  },
  statusProcessing: {
    background: 'rgba(33, 150, 243, 0.2)',
    color: '#2196f3',
  },
  statusShipped: {
    background: 'rgba(156, 39, 176, 0.2)',
    color: '#9c27b0',
  },
  statusDelivered: {
    background: 'rgba(76, 175, 80, 0.2)',
    color: '#4caf50',
  },
  statusCancelled: {
    background: 'rgba(244, 67, 54, 0.2)',
    color: '#f44336',
  },
  roleBadge: {
    padding: '4px 12px',
    background: 'rgba(150, 150, 150, 0.2)',
    color: '#999',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600',
  },
  roleAdmin: {
    background: 'rgba(230, 57, 70, 0.2)',
    color: '#e63946',
  },
  stockBadge: {
    padding: '4px 12px',
    background: 'rgba(76, 175, 80, 0.2)',
    color: '#4caf50',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600',
  },
  stockLow: {
    background: 'rgba(255, 193, 7, 0.2)',
    color: '#ffc107',
  },
  toast: {
    position: 'fixed',
    top: '20px',
    right: '20px',
    padding: '15px 20px',
    background: 'rgba(0, 0, 0, 0.9)',
    color: '#fff',
    borderRadius: '8px',
    fontSize: '14px',
    zIndex: 9999,
    animation: 'slideIn 0.3s',
    border: '1px solid #e63946',
  },
  restrictedBox: {
    background: 'rgba(255, 0, 0, 0.1)',
    border: '2px solid #e63946',
    borderRadius: '8px',
    padding: '40px',
    textAlign: 'center',
    maxWidth: '500px',
    margin: '100px auto',
  },
  loadingSpinner: {
    textAlign: 'center',
    padding: '40px',
    fontSize: '16px',
    color: '#999',
  },
};
