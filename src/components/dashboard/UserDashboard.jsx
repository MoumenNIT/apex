import { useState, useEffect, useContext, createContext } from 'react';
import { supabase, db } from '../../lib/supabase';
import FadeContent from '../ui/FadeContent';
import CountUp from '../ui/CountUp';
import AnimatedCard from '../ui/AnimatedCard';
import ShinyButton from '../ui/ShinyButton';

const DashboardContext = createContext(null);

export const useDashboard = () => useContext(DashboardContext);

export default function UserDashboard() {
  const [currentUser, setCurrentUser] = useState(null);
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalSpent: 0,
    pendingOrders: 0,
    completedOrders: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    setCurrentUser(user);
    await loadUserStats(user.id);
    await loadRecentOrders(user.id);
    setLoading(false);
  };

  const loadUserStats = async (userId) => {
    const { data: orders } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', userId);

    if (orders) {
      setStats({
        totalOrders: orders.length,
        totalSpent: orders.reduce((sum, o) => sum + (o.total_amount || 0), 0),
        pendingOrders: orders.filter(o => o.status === 'pending' || o.status === 'processing').length,
        completedOrders: orders.filter(o => o.status === 'delivered').length,
      });
    }
  };

  const loadRecentOrders = async (userId) => {
    const { data: orders } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(5);

    setRecentOrders(orders || []);
  };

  if (loading) {
    return (
      <div style={{ padding: '60px 20px', textAlign: 'center', color: '#999' }}>
        Loading dashboard...
      </div>
    );
  }

  return (
    <DashboardContext.Provider value={{ currentUser, stats, recentOrders }}>
      <div style={{ minHeight: '100vh', background: '#0a0a0f', color: '#fff', padding: '20px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          {/* Header */}
          <FadeContent>
            <div style={{ marginBottom: '40px' }}>
              <h1 style={{ fontSize: '36px', fontWeight: 'bold', marginBottom: '10px' }}>
                Welcome back, {currentUser?.user_metadata?.first_name || 'User'}
              </h1>
              <p style={{ color: '#666', fontSize: '16px' }}>
                Manage your orders and account settings
              </p>
            </div>
          </FadeContent>

          {/* Stats Cards */}
          <FadeContent delay={200}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '40px' }}>
              <AnimatedCard style={{ background: '#1a1a2e', border: '1px solid #333', borderRadius: '12px', padding: '24px' }}>
                <div style={{ fontSize: '14px', color: '#666', marginBottom: '10px' }}>Total Orders</div>
                <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#e63946' }}>
                  <CountUp end={stats.totalOrders} />
                </div>
              </AnimatedCard>
              
              <AnimatedCard style={{ background: '#1a1a2e', border: '1px solid #333', borderRadius: '12px', padding: '24px' }}>
                <div style={{ fontSize: '14px', color: '#666', marginBottom: '10px' }}>Total Spent</div>
                <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#27ae60' }}>
                  $<CountUp end={stats.totalSpent / 100} decimals={2} />
                </div>
              </AnimatedCard>
              
              <AnimatedCard style={{ background: '#1a1a2e', border: '1px solid #333', borderRadius: '12px', padding: '24px' }}>
                <div style={{ fontSize: '14px', color: '#666', marginBottom: '10px' }}>Pending Orders</div>
                <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#f39c12' }}>
                  <CountUp end={stats.pendingOrders} />
                </div>
              </AnimatedCard>
              
              <AnimatedCard style={{ background: '#1a1a2e', border: '1px solid #333', borderRadius: '12px', padding: '24px' }}>
                <div style={{ fontSize: '14px', color: '#666', marginBottom: '10px' }}>Completed Orders</div>
                <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#2980b9' }}>
                  <CountUp end={stats.completedOrders} />
                </div>
              </AnimatedCard>
            </div>
          </FadeContent>

          {/* Tabs */}
          <FadeContent delay={400}>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '30px', borderBottom: '1px solid #333', paddingBottom: '0' }}>
              {['overview', 'orders', 'profile', 'settings'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  style={{
                    padding: '12px 24px',
                    background: 'transparent',
                    color: activeTab === tab ? '#e63946' : '#666',
                    border: 'none',
                    borderBottom: activeTab === tab ? '3px solid #e63946' : '3px solid transparent',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '600',
                    textTransform: 'capitalize',
                  }}
                >
                  {tab}
                </button>
              ))}
            </div>
          </FadeContent>

          {/* Tab Content */}
          <FadeContent delay={600}>
            {activeTab === 'overview' && (
              <div>
                <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>Recent Orders</h2>
                {recentOrders.length === 0 ? (
                  <div style={{ background: '#1a1a2e', padding: '40px', borderRadius: '12px', textAlign: 'center', color: '#666' }}>
                    No orders yet
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    {recentOrders.map(order => (
                      <AnimatedCard key={order.id} style={{ background: '#1a1a2e', border: '1px solid #333', borderRadius: '12px', padding: '20px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '5px' }}>
                              Order #{order.order_number}
                            </div>
                            <div style={{ fontSize: '13px', color: '#666' }}>
                              {new Date(order.created_at).toLocaleDateString()}
                            </div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#e63946' }}>
                              ${(order.total_amount / 100).toFixed(2)}
                            </div>
                            <div style={{ 
                              padding: '4px 12px', 
                              borderRadius: '20px', 
                              fontSize: '11px', 
                              fontWeight: '600',
                              background: order.status === 'delivered' ? 'rgba(39, 174, 96, 0.2)' : 'rgba(243, 156, 18, 0.2)',
                              color: order.status === 'delivered' ? '#27ae60' : '#f39c12'
                            }}>
                              {order.status}
                            </div>
                          </div>
                        </div>
                      </AnimatedCard>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'profile' && (
              <div style={{ background: '#1a1a2e', border: '1px solid #333', borderRadius: '12px', padding: '30px' }}>
                <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>Profile Settings</h2>
                <form style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#666' }}>First Name</label>
                    <input 
                      type="text" 
                      defaultValue={currentUser?.user_metadata?.first_name}
                      style={{ 
                        width: '100%', 
                        padding: '12px', 
                        background: '#0a0a0f', 
                        border: '1px solid #333', 
                        borderRadius: '8px', 
                        color: '#fff',
                        fontSize: '14px'
                      }} 
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#666' }}>Last Name</label>
                    <input 
                      type="text" 
                      defaultValue={currentUser?.user_metadata?.last_name}
                      style={{ 
                        width: '100%', 
                        padding: '12px', 
                        background: '#0a0a0f', 
                        border: '1px solid #333', 
                        borderRadius: '8px', 
                        color: '#fff',
                        fontSize: '14px'
                      }} 
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#666' }}>Email</label>
                    <input 
                      type="email" 
                      defaultValue={currentUser?.email}
                      disabled
                      style={{ 
                        width: '100%', 
                        padding: '12px', 
                        background: '#0a0a0f', 
                        border: '1px solid #333', 
                        borderRadius: '8px', 
                        color: '#666',
                        fontSize: '14px'
                      }} 
                    />
                  </div>
                  <ShinyButton type="submit">Save Changes</ShinyButton>
                </form>
              </div>
            )}

            {activeTab === 'orders' && (
              <div>
                <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>All Orders</h2>
                {/* Full orders list with filtering and pagination */}
                <div style={{ background: '#1a1a2e', border: '1px solid #333', borderRadius: '12px', padding: '30px' }}>
                  <p style={{ color: '#666' }}>Full order history coming soon...</p>
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div>
                <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>Account Settings</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  <AnimatedCard style={{ background: '#1a1a2e', border: '1px solid #333', borderRadius: '12px', padding: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontSize: '16px', fontWeight: 'bold' }}>Email Notifications</div>
                        <div style={{ fontSize: '13px', color: '#666' }}>Receive order updates and promotions</div>
                      </div>
                      <div style={{ width: '50px', height: '26px', background: '#e63946', borderRadius: '13px', position: 'relative', cursor: 'pointer' }}>
                        <div style={{ width: '22px', height: '22px', background: '#fff', borderRadius: '50%', position: 'absolute', right: '2px', top: '2px' }}></div>
                      </div>
                    </div>
                  </AnimatedCard>
                  
                  <AnimatedCard style={{ background: '#1a1a2e', border: '1px solid #333', borderRadius: '12px', padding: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontSize: '16px', fontWeight: 'bold' }}>Two-Factor Authentication</div>
                        <div style={{ fontSize: '13px', color: '#666' }}>Add an extra layer of security</div>
                      </div>
                      <div style={{ width: '50px', height: '26px', background: '#333', borderRadius: '13px', position: 'relative', cursor: 'pointer' }}>
                        <div style={{ width: '22px', height: '22px', background: '#fff', borderRadius: '50%', position: 'absolute', left: '2px', top: '2px' }}></div>
                      </div>
                    </div>
                  </AnimatedCard>

                  <div style={{ marginTop: '30px' }}>
                    <ShinyButton style={{ background: '#e63946' }}>Change Password</ShinyButton>
                    <ShinyButton style={{ background: '#333', marginLeft: '10px' }}>Delete Account</ShinyButton>
                  </div>
                </div>
              </div>
            )}
          </FadeContent>
        </div>
      </div>
    </DashboardContext.Provider>
  );
}
