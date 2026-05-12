import { useState } from 'react';
import { useAuth } from '../auth/AuthProvider';
import ShinyButton from '../ui/ShinyButton';
import FadeContent from '../ui/FadeContent';

export default function RegisterForm() {
  const { signUp } = useAuth();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const newErrors = {};
    
    if (!formData.firstName) {
      newErrors.firstName = 'First name is required';
    }
    
    if (!formData.lastName) {
      newErrors.lastName = 'Last name is required';
    }
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain uppercase, lowercase, and number';
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setErrors({});
    
    try {
      console.log('Form submitted with email:', formData.email);
      const result = await signUp(formData.email, formData.password, {
        first_name: formData.firstName,
        last_name: formData.lastName,
      });
      
      console.log('Sign up successful:', result);
      // Show success and redirect
      setTimeout(() => {
        window.location.hash = '#/login';
      }, 500);
    } catch (error) {
      console.error('Registration error:', error);
      const errorMsg = error?.message || 'Registration failed. Please try again.';
      setErrors({ general: errorMsg });
      setLoading(false);
    }
  };

  return (
    <FadeContent>
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0a0f', padding: '20px' }}>
        <div style={{ width: '100%', maxWidth: '400px', background: '#1a1a2e', border: '1px solid #333', borderRadius: '16px', padding: '40px' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '10px' }}>Create Account</h1>
            <p style={{ color: '#666', fontSize: '14px' }}>Join Apex Store today</p>
          </div>

          {errors.general && (
            <div style={{ background: 'rgba(230, 57, 70, 0.1)', border: '1px solid #e63946', borderRadius: '8px', padding: '12px', marginBottom: '20px', color: '#e63946', fontSize: '14px' }}>
              {errors.general}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#999' }}>First Name</label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: '#0a0a0f',
                    border: errors.firstName ? '1px solid #e63946' : '1px solid #333',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '14px',
                    outline: 'none',
                  }}
                  placeholder="John"
                />
                {errors.firstName && <div style={{ color: '#e63946', fontSize: '12px', marginTop: '6px' }}>{errors.firstName}</div>}
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#999' }}>Last Name</label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: '#0a0a0f',
                    border: errors.lastName ? '1px solid #e63946' : '1px solid #333',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '14px',
                    outline: 'none',
                  }}
                  placeholder="Doe"
                />
                {errors.lastName && <div style={{ color: '#e63946', fontSize: '12px', marginTop: '6px' }}>{errors.lastName}</div>}
              </div>
            </div>

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

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#999' }}>Confirm Password</label>
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: '#0a0a0f',
                  border: errors.confirmPassword ? '1px solid #e63946' : '1px solid #333',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '14px',
                  outline: 'none',
                }}
                placeholder="••••••••"
              />
              {errors.confirmPassword && <div style={{ color: '#e63946', fontSize: '12px', marginTop: '6px' }}>{errors.confirmPassword}</div>}
            </div>

            <div style={{ fontSize: '12px', color: '#666', lineHeight: '1.5' }}>
              By creating an account, you agree to our Terms of Service and Privacy Policy
            </div>

            <ShinyButton type="submit" disabled={loading} style={{ width: '100%' }}>
              {loading ? 'Creating account...' : 'Create Account'}
            </ShinyButton>
          </form>

          <div style={{ textAlign: 'center', marginTop: '30px', paddingTop: '20px', borderTop: '1px solid #333' }}>
            <p style={{ color: '#666', fontSize: '14px' }}>
              Already have an account? <a href="#/login" style={{ color: '#e63946', textDecoration: 'none' }}>Sign in</a>
            </p>
          </div>
        </div>
      </div>
    </FadeContent>
  );
}
