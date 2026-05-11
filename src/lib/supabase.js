import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Missing Supabase configuration. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env');
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');

// Helper functions for common database operations
export const db = {
  // ===== PRODUCTS =====
  async getProducts(filters = {}) {
    let query = supabase.from('products').select('*, product_specs(*), product_highlights(*)').eq('is_active', true);
    
    if (filters.category && filters.category !== 'All') {
      query = query.eq('category', filters.category);
    }
    if (filters.brand && filters.brand !== 'All') {
      query = query.eq('brand', filters.brand);
    }
    if (filters.search) {
      query = query.or(`name.ilike.%${filters.search}%,tagline.ilike.%${filters.search}%`);
    }
    if (filters.featured) {
      query = query.eq('is_featured', true);
    }

    const { data, error } = await query;
    return { data, error };
  },

  async getProductBySlug(slug) {
    const { data, error } = await supabase
      .from('products')
      .select('*, product_specs(*), product_highlights(*)')
      .eq('slug', slug)
      .eq('is_active', true)
      .single();
    return { data, error };
  },

  async getFeaturedProducts() {
    const { data, error } = await supabase
      .from('products')
      .select('*, product_specs(*), product_highlights(*)')
      .eq('is_featured', true)
      .eq('is_active', true)
      .limit(3);
    return { data, error };
  },

  // ===== ORDERS =====
  async createOrder(orderData) {
    const { data, error } = await supabase
      .from('orders')
      .insert([orderData])
      .select()
      .single();
    return { data, error };
  },

  async addOrderItems(items) {
    const { data, error } = await supabase
      .from('order_items')
      .insert(items);
    return { data, error };
  },

  async getOrders(userId) {
    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    return { data, error };
  },

  async getOrderByNumber(orderNumber) {
    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('order_number', orderNumber)
      .single();
    return { data, error };
  },

  // ===== USER CART =====
  async getCart(userId) {
    const { data, error } = await supabase
      .from('cart_items')
      .select('*, products(*)')
      .eq('user_id', userId);
    return { data, error };
  },

  async addToCart(userId, productId, quantity = 1) {
    const { data: existing } = await supabase
      .from('cart_items')
      .select()
      .eq('user_id', userId)
      .eq('product_id', productId)
      .single();

    if (existing) {
      const { data, error } = await supabase
        .from('cart_items')
        .update({ quantity: existing.quantity + quantity })
        .eq('id', existing.id);
      return { data, error };
    }

    const { data, error } = await supabase
      .from('cart_items')
      .insert([{ user_id: userId, product_id: productId, quantity }]);
    return { data, error };
  },

  async updateCartItem(cartItemId, quantity) {
    const { data, error } = await supabase
      .from('cart_items')
      .update({ quantity: Math.max(1, quantity) })
      .eq('id', cartItemId);
    return { data, error };
  },

  async removeFromCart(cartItemId) {
    const { data, error } = await supabase
      .from('cart_items')
      .delete()
      .eq('id', cartItemId);
    return { data, error };
  },

  async clearCart(userId) {
    const { data, error } = await supabase
      .from('cart_items')
      .delete()
      .eq('user_id', userId);
    return { data, error };
  },

  // ===== REVIEWS =====
  async getProductReviews(productId) {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('product_id', productId)
      .order('created_at', { ascending: false });
    return { data, error };
  },

  async addReview(productId, userId, rating, reviewText) {
    const { data, error } = await supabase
      .from('reviews')
      .insert([{ product_id: productId, user_id: userId, rating, review_text: reviewText }]);
    return { data, error };
  },

  // ===== WISHLIST =====
  async getWishlist(userId) {
    const { data, error } = await supabase
      .from('wishlist_items')
      .select('*, products(*)')
      .eq('user_id', userId);
    return { data, error };
  },

  async addToWishlist(userId, productId) {
    const { data, error } = await supabase
      .from('wishlist_items')
      .insert([{ user_id: userId, product_id: productId }]);
    return { data, error };
  },

  async removeFromWishlist(userId, productId) {
    const { data, error } = await supabase
      .from('wishlist_items')
      .delete()
      .eq('user_id', userId)
      .eq('product_id', productId);
    return { data, error };
  },

  // ===== USER PROFILE =====
  async getUserProfile(userId) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
    return { data, error };
  },

  async updateUserProfile(userId, updates) {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId);
    return { data, error };
  },

  async createUserProfile(userId, email, profile) {
    const { data, error } = await supabase
      .from('users')
      .insert([{ id: userId, email, ...profile }]);
    return { data, error };
  },

  // ===== ADMIN: PRODUCT MANAGEMENT =====
  async createProduct(productData) {
    const { data, error } = await supabase
      .from('products')
      .insert([productData])
      .select()
      .single();
    return { data, error };
  },

  async updateProduct(productId, updates) {
    const { data, error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', productId)
      .select()
      .single();
    return { data, error };
  },

  async deleteProduct(productId) {
    const { data, error } = await supabase
      .from('products')
      .delete()
      .eq('id', productId);
    return { data, error };
  },

  async getAllProducts() {
    const { data, error } = await supabase
      .from('products')
      .select('*, product_specs(*), product_highlights(*)');
    return { data, error };
  },

  async addProductSpec(productId, specData) {
    const { data, error } = await supabase
      .from('product_specs')
      .insert([{ product_id: productId, ...specData }]);
    return { data, error };
  },

  async updateProductSpec(specId, updates) {
    const { data, error } = await supabase
      .from('product_specs')
      .update(updates)
      .eq('id', specId);
    return { data, error };
  },

  async deleteProductSpec(specId) {
    const { data, error } = await supabase
      .from('product_specs')
      .delete()
      .eq('id', specId);
    return { data, error };
  },

  async addProductHighlight(productId, highlightText) {
    const { data, error } = await supabase
      .from('product_highlights')
      .insert([{ product_id: productId, highlight: highlightText }]);
    return { data, error };
  },

  async updateProductHighlight(highlightId, highlightText) {
    const { data, error } = await supabase
      .from('product_highlights')
      .update({ highlight: highlightText })
      .eq('id', highlightId);
    return { data, error };
  },

  async deleteProductHighlight(highlightId) {
    const { data, error } = await supabase
      .from('product_highlights')
      .delete()
      .eq('id', highlightId);
    return { data, error };
  },

  // ===== ADMIN: ORDER MANAGEMENT =====
  async getAllOrders(filters = {}) {
    let query = supabase
      .from('orders')
      .select('*, order_items(*, products(*)), users(email, first_name, last_name)')
      .order('created_at', { ascending: false });

    if (filters.status) {
      query = query.eq('status', filters.status);
    }
    if (filters.userId) {
      query = query.eq('user_id', filters.userId);
    }

    const { data, error } = await query;
    return { data, error };
  },

  async updateOrderStatus(orderId, status, notes = '') {
    const { data, error } = await supabase
      .from('orders')
      .update({ status, updated_at: new Date().toISOString(), admin_notes: notes })
      .eq('id', orderId)
      .select()
      .single();
    return { data, error };
  },

  async getOrderStats() {
    const { data: allOrders } = await supabase
      .from('orders')
      .select('id, status, total_amount, created_at');

    const { data: todayOrders } = await supabase
      .from('orders')
      .select('id, total_amount')
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

    const stats = {
      totalOrders: allOrders?.length || 0,
      totalRevenue: allOrders?.reduce((sum, o) => sum + (o.total_amount || 0), 0) || 0,
      todayRevenue: todayOrders?.reduce((sum, o) => sum + (o.total_amount || 0), 0) || 0,
      pendingOrders: allOrders?.filter(o => o.status === 'pending').length || 0,
      completedOrders: allOrders?.filter(o => o.status === 'completed').length || 0,
    };

    return { data: stats, error: null };
  },

  // ===== ADMIN: USER MANAGEMENT =====
  async getAllUsers() {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });
    return { data, error };
  },

  async setUserRole(userId, role) {
    const { data, error } = await supabase
      .from('users')
      .update({ role })
      .eq('id', userId);
    return { data, error };
  },

  // ===== EMAIL NOTIFICATIONS =====
  async sendOrderConfirmationEmail(orderId, userEmail, userName) {
    const { data: order } = await supabase
      .from('orders')
      .select('*, order_items(*, products(name, price))')
      .eq('id', orderId)
      .single();

    if (!order) return { data: null, error: 'Order not found' };

    const emailData = {
      to: userEmail,
      subject: `Order Confirmation - ${order.order_number}`,
      template: 'order_confirmation',
      variables: {
        name: userName,
        orderNumber: order.order_number,
        orderDate: new Date(order.created_at).toLocaleDateString(),
        items: order.order_items.map(item => ({
          name: item.products.name,
          quantity: item.quantity,
          price: item.products.price
        })),
        totalAmount: order.total_amount,
        shippingAddress: order.shipping_address,
        trackingUrl: `${import.meta.env.VITE_APP_URL}/#/track/${order.order_number}`,
      }
    };

    try {
      // Send to Edge Function or Email Service
      const response = await fetch(`${supabaseUrl}/functions/v1/send-email`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${supabaseAnonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailData),
      });

      const result = await response.json();
      return { data: result, error: null };
    } catch (err) {
      console.error('Email send error:', err);
      return { data: null, error: err.message };
    }
  },

  async sendOrderStatusEmail(orderId, userEmail, userName, newStatus) {
    const { data: order } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (!order) return { data: null, error: 'Order not found' };

    const statusMessages = {
      pending: 'Your order is being processed',
      processing: 'Your order is being prepared',
      shipped: 'Your order has been shipped',
      delivered: 'Your order has been delivered',
      cancelled: 'Your order has been cancelled',
    };

    const emailData = {
      to: userEmail,
      subject: `Order Status Update - ${order.order_number}`,
      template: 'order_status',
      variables: {
        name: userName,
        orderNumber: order.order_number,
        status: newStatus,
        statusMessage: statusMessages[newStatus] || 'Order status updated',
        trackingUrl: `${import.meta.env.VITE_APP_URL}/#/track/${order.order_number}`,
      }
    };

    try {
      const response = await fetch(`${supabaseUrl}/functions/v1/send-email`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${supabaseAnonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailData),
      });

      const result = await response.json();
      return { data: result, error: null };
    } catch (err) {
      console.error('Email send error:', err);
      return { data: null, error: err.message };
    }
  },

  async sendAdminNotification(subject, message, data) {
    const emailData = {
      to: import.meta.env.VITE_EMAIL_ADMIN_CC || 'admin@apexsys.com',
      subject: `[Admin Alert] ${subject}`,
      template: 'admin_notification',
      variables: {
        subject,
        message,
        timestamp: new Date().toLocaleString(),
        data,
      }
    };

    try {
      const response = await fetch(`${supabaseUrl}/functions/v1/send-email`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${supabaseAnonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailData),
      });

      const result = await response.json();
      return { data: result, error: null };
    } catch (err) {
      console.error('Admin notification error:', err);
      return { data: null, error: err.message };
    }
  },

  // ===== AUTHENTICATION HELPERS =====
  async signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    return { data, error };
  },

  async signUp(email, password, profile = {}) {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) return { data: null, error };

    if (data?.user) {
      const profilePayload = {
        id: data.user.id,
        email,
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        is_admin: profile.is_admin || false,
      };
      await supabase.from('users').upsert(profilePayload);
    }

    return { data, error };
  },

  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    return { data: user, error };
  },

  async checkAdminRole(userId) {
    const { data: user, error } = await supabase
      .from('users')
      .select('is_admin')
      .eq('id', userId)
      .single();

    if (error) return { isAdmin: false, data: null, error };
    return { isAdmin: user?.is_admin === true, data: user, error: null };
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    return { error };
  },
};

export default supabase;
