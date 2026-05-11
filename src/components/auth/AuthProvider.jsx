import { createContext, useContext, useState, useEffect } from 'react';
import { supabase, db } from '../../lib/supabase';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    checkUser();
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(session.user);
        await checkAdminRole(session.user.id);
      } else {
        setUser(null);
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => authListener.subscription.unsubscribe();
  }, []);

  const checkUser = async () => {
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    if (currentUser) {
      setUser(currentUser);
      await checkAdminRole(currentUser.id);
    }
    setLoading(false);
  };

  const checkAdminRole = async (userId) => {
    const { isAdmin } = await db.checkAdminRole(userId);
    setIsAdmin(isAdmin);
  };

  const signUp = async (email, password, metadata) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
      },
    });
    if (error) throw error;

    if (data?.user) {
      const profilePayload = {
        id: data.user.id,
        email,
        first_name: metadata.first_name || '',
        last_name: metadata.last_name || '',
        is_admin: metadata.is_admin || false,
      };
      await supabase.from('users').upsert(profilePayload);
    }
    return data;
  };

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setIsAdmin(false);
  };

  const updateProfile = async (updates) => {
    const { data, error } = await supabase.auth.updateUser({
      data: updates,
    });
    if (error) throw error;
    setUser(data.user);
    return data;
  };

  const value = {
    user,
    loading,
    isAdmin,
    signUp,
    signIn,
    signOut,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

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
