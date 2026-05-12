import { createContext, useContext, useState, useEffect } from 'react';
import { supabase, supabaseAdmin, db } from '../../lib/supabase';

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
      console.log('Auth state change:', event, session?.user?.id);
      if (session?.user) {
        console.log('Setting user and ensuring profile exists...');
        setUser(session.user);
        // Ensure profile exists first before checking admin role
        await ensureUserProfile(session.user);
        console.log('Profile ensured, now checking admin role...');
        await checkAdminRole(session.user.id);
        console.log('Admin role check complete');
      } else {
        console.log('No session, clearing user');
        setUser(null);
        setIsAdmin(false);
      }
      setLoading(false);
      console.log('Loading set to false');
    });

    return () => authListener.subscription.unsubscribe();
  }, []);

  const checkUser = async () => {
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    if (currentUser) {
      setUser(currentUser);
      // Ensure profile exists before checking admin role
      await ensureUserProfile(currentUser);
      await checkAdminRole(currentUser.id);
    }
    setLoading(false);
  };

  const checkAdminRole = async (userId) => {
    console.log('Checking admin role for user:', userId);
    try {
      const { isAdmin } = await db.checkAdminRole(userId);
      console.log('Admin role result:', isAdmin);
      setIsAdmin(isAdmin);
    } catch (err) {
      console.error('Error checking admin role:', err);
      setIsAdmin(false);
    }
  };

  const ensureUserProfile = async (user) => {
    if (!user?.id) return;

    try {
      // Use admin client to check if profile exists (bypass RLS)
      const client = supabaseAdmin || supabase;
      const { data: existingProfile, error: existingError } = await client
        .from('users')
        .select('id')
        .eq('id', user.id)
        .single();

      if (existingError && existingError.code !== 'PGRST116') {
        console.warn('Error checking existing profile:', existingError);
        return; // Don't create if we can't check
      }

      if (!existingProfile) {
        const profilePayload = {
          id: user.id,
          email: user.email || '',
          first_name: user.user_metadata?.first_name || '',
          last_name: user.user_metadata?.last_name || '',
          is_admin: false,
        };

        console.log('Creating missing user profile:', profilePayload);
        const { error: insertError } = await client.from('users').upsert(profilePayload);
        if (insertError) {
          console.error('Failed to create missing user profile:', insertError);
        } else {
          console.log('Created missing user profile successfully');
        }
      } else {
        console.log('User profile already exists');
      }
    } catch (err) {
      console.error('Unexpected error ensuring user profile:', err);
    }
  };

  const signUp = async (email, password, metadata) => {
    try {
      console.log('Starting sign up for:', email);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
          emailRedirectTo: window.location.origin,
        },
      });

      if (error && error.message !== 'User already registered') {
        console.error('Sign up error:', error);
        throw error;
      }

      let userId;
      let authUser = data?.user;

      if (!authUser) {
        const { data: { user: existingUser } } = await supabase.auth.getUser();
        if (existingUser) {
          userId = existingUser.id;
          authUser = existingUser;
        }
      } else {
        userId = authUser.id;
      }

      if (userId) {
        const profilePayload = {
          id: userId,
          email,
          first_name: metadata.first_name || '',
          last_name: metadata.last_name || '',
          is_admin: metadata.is_admin || false,
        };

        console.log('Attempting to upsert user profile:', profilePayload);
        const client = supabaseAdmin || supabase;
        const { error: upsertError } = await client.from('users').upsert(profilePayload);

        if (upsertError) {
          console.error('Failed to upsert user profile:', upsertError);
          throw new Error(`Failed to create user profile: ${upsertError.message}`);
        }

        console.log('User profile created/updated successfully');

        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) {
          console.error('Sign in after sign up error:', signInError);
          if (signInError.status === 422) {
            console.log('User needs email confirmation, attempting to bypass...');
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
              return { user: session.user, session };
            }
          }
          throw signInError;
        }

        return signInData;
      }

      return data;
    } catch (err) {
      console.error('Sign up error:', err);
      throw err;
    }
  };

  const signIn = async (email, password) => {
    try {
      console.log('Starting sign in for:', email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Sign in error:', error);
        if (error.status === 422) {
          console.log('422 error - likely email confirmation required');
          throw new Error('Please confirm your email address before signing in. Check your inbox for the confirmation link.');
        }
        if (error.message?.includes('Failed to fetch') || error.message?.includes('ERR_NAME_NOT_RESOLVED')) {
          console.log('Network error - check internet connection and Supabase URL');
          throw new Error('Network error. Please check your internet connection and ensure the Supabase URL is correct in your environment variables.');
        }
        throw error;
      }

      if (!data?.user) {
        const msg = 'Sign in failed. Please check your credentials and try again.';
        console.warn(msg, data);
        throw new Error(msg);
      }

      await ensureUserProfile(data.user);
      console.log('Sign in successful, user:', data.user.id);
      return data;
    } catch (err) {
      console.error('Sign in error:', err);
      throw err;
    }
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
