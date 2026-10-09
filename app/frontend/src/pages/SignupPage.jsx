import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuthStore from '../store/authStore.js';
import styles from './AuthPage.module.css';

export default function SignupPage() {
  const [username,   setUsername]   = useState('');
  const [email,      setEmail]      = useState('');
  const [password,   setPassword]   = useState('');
  const [confirm,    setConfirm]    = useState('');
  const [role,       setRole]       = useState('customer');
  const [showPass,   setShowPass]   = useState(false);
  const [error,      setError]      = useState('');
  const [loading,    setLoading]    = useState(false);

  const { signup }   = useAuthStore();
  const navigate     = useNavigate();

  function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const result = signup(username, email, password, role);
      setLoading(false);

      if (!result.success) {
        setError(result.error);
        return;
      }

      // New users go to onboarding for their chosen role
      if (result.role === 'merchant') {
        navigate('/business/onboarding');
      } else {
        navigate('/customer/onboarding');
      }
    }, 400);
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.header}>
          <Link to="/" className={styles.logo}>🛒 2am Shoppers</Link>
          <h1 className={styles.title}>Create your account</h1>
          <p className={styles.sub}>Join as a shopper or a merchant</p>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>

          {/* Role toggle */}
          <div className={styles.roleToggle}>
            <button
              type="button"
              className={`${styles.roleBtn} ${role === 'customer' ? styles.roleActive : ''}`}
              onClick={() => setRole('customer')}
            >
              👤 Shopper
            </button>
            <button
              type="button"
              className={`${styles.roleBtn} ${role === 'merchant' ? styles.roleActive : ''}`}
              onClick={() => setRole('merchant')}
            >
              💼 Merchant
            </button>
          </div>

          <label className={styles.label}>
            Username
            <input
              className={styles.input}
              type="text"
              autoComplete="username"
              placeholder="Choose a username"
              value={username}
              onChange={e => { setUsername(e.target.value); setError(''); }}
              required
            />
          </label>

          <label className={styles.label}>
            Email <span className={styles.optional}>(optional)</span>
            <input
              className={styles.input}
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </label>

          <label className={styles.label}>
            Password
            <div className={styles.passwordWrap}>
              <input
                className={styles.input}
                type={showPass ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="At least 6 characters"
                value={password}
                onChange={e => { setPassword(e.target.value); setError(''); }}
                required
              />
              <button
                type="button"
                className={styles.togglePass}
                onClick={() => setShowPass(v => !v)}
                aria-label={showPass ? 'Hide password' : 'Show password'}
              >
                {showPass ? '🙈' : '👁️'}
              </button>
            </div>
          </label>

          <label className={styles.label}>
            Confirm password
            <input
              className={styles.input}
              type={showPass ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="Repeat password"
              value={confirm}
              onChange={e => { setConfirm(e.target.value); setError(''); }}
              required
            />
          </label>

          {error && <div className={styles.error}>{error}</div>}

          <button
            type="submit"
            className={`btn btn-primary ${styles.submitBtn}`}
            disabled={loading}
          >
            {loading ? 'Creating account…' : 'Create account →'}
          </button>
        </form>

        <div className={styles.footer}>
          <span>Already have an account?</span>
          <Link to="/login" className={styles.switchLink}>Sign in</Link>
        </div>
      </div>
    </div>
  );
}
