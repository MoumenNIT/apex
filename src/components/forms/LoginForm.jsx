import { useState } from 'react';
import { useAuth } from '../auth/AuthProvider';
import ShinyButton from '../ui/ShinyButton';
import FadeContent from '../ui/FadeContent';

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
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0a0f', padding: '20px' }}>
        <div style={{ width: '100%', maxWidth: '400px', background: '#1a1a2e', border: '1px solid #333', borderRadius: '16px', padding: '40px' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '10px' }}>Sign In</h1>
            <p style={{ color: '#666', fontSize: '14px' }}>Welcome back to Apex Store</p>
          </div>

          {errors.general && (
            <div style={{ background: 'rgba(230, 57, 70, 0.1)', border: '1px solid #e63946', borderRadius: '8px', padding: '12px', marginBottom: '20px', color: '#e63946', fontSize: '14px' }}>
              {errors.general}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#999' }}>Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: '#0a0a0f',
                  border: errors.email ? '1px solid #e63946' : '1px solid #333',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '14px',
                  outline: 'none',
                }}
                placeholder="your@email.com"
              />
              {errors.email && <div style={{ color: '#e63946', fontSize: '12px', marginTop: '6px' }}>{errors.email}</div>}
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#999' }}>Password</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: '#0a0a0f',
                  border: errors.password ? '1px solid #e63946' : '1px solid #333',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '14px',
                  outline: 'none',
                }}
                placeholder="••••••••"
              />
              {errors.password && <div style={{ color: '#e63946', fontSize: '12px', marginTop: '6px' }}>{errors.password}</div>}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <a href="#/forgot-password" style={{ color: '#e63946', fontSize: '13px', textDecoration: 'none' }}>Forgot password?</a>
            </div>

            <ShinyButton type="submit" disabled={loading} style={{ width: '100%' }}>
              {loading ? 'Signing in...' : 'Sign In'}
            </ShinyButton>
          </form>

          <div style={{ textAlign: 'center', marginTop: '30px', paddingTop: '20px', borderTop: '1px solid #333' }}>
            <p style={{ color: '#666', fontSize: '14px' }}>
              Don't have an account? <a href="#/register" style={{ color: '#e63946', textDecoration: 'none' }}>Sign up</a>
            </p>
          </div>
        </div>
      </div>
    </FadeContent>
  );
}
