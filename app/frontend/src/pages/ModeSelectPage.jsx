import React from 'react';
import { useNavigate } from 'react-router-dom';
import useAppStore  from '../store/appStore.js';
import useAuthStore from '../store/authStore.js';
import styles from './ModeSelectPage.module.css';

export default function ModeSelectPage() {
  const { setAppMode, customerProfile, merchantProfile, reset } = useAppStore();
  const { currentUser, isAdmin, logout } = useAuthStore();
  const navigate = useNavigate();

  function choose(mode) {
    setAppMode(mode);
    if (mode === 'customer') {
      navigate(customerProfile ? '/customer' : '/customer/onboarding');
    } else {
      navigate(merchantProfile ? '/business' : '/business/onboarding');
    }
  }

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <div className={styles.page}>
      {/* Top bar */}
      <div className={styles.topbar}>
        <span className={styles.topbarLogo}>🛒 2am Shoppers</span>
        <div className={styles.topbarRight}>
          <span className={styles.userChip}>
            {isAdmin() && <span className={styles.adminBadge}>⚡ Admin</span>}
            {currentUser?.username}
          </span>
          <button className={styles.logoutBtn} onClick={handleLogout}>Sign out</button>
        </div>
      </div>

      <div className={styles.inner}>
        <div className={styles.logo}>🛒</div>
        <h1 className={styles.title}>
          The <span className="gradient-text">2am Shoppers</span>
        </h1>
        <p className={styles.sub}>
          An AI shopping companion for working youths and the businesses that serve them.
        </p>

        {/* Admin shortcut banner */}
        {isAdmin() && (
          <div className={styles.adminBanner}>
            <span>⚡</span>
            <span>
              Admin account — you can access both views and skip onboarding.
              {(customerProfile || merchantProfile) && (
                <button className={styles.resetLink} onClick={() => { reset(); }}>
                  Reset all data
                </button>
              )}
            </span>
          </div>
        )}

        <div className={styles.cards}>
          <button
            className={`${styles.card} ${styles.cardCustomer}`}
            onClick={() => choose('customer')}
          >
            <span className={styles.cardEmoji}>👤</span>
            <h2>I'm a shopper</h2>
            <p>Save products, set budgets, get personalised reminders and shop smarter.</p>
            {customerProfile && (
              <span className={styles.returning}>← Continue as {customerProfile.name}</span>
            )}
            <span className={styles.cardArrow}>→</span>
          </button>

          <button
            className={`${styles.card} ${styles.cardBusiness}`}
            onClick={() => choose('business')}
          >
            <span className={styles.cardEmoji}>💼</span>
            <h2>I'm a merchant</h2>
            <p>Turn existing customer data into personalised journeys that drive repeat purchases.</p>
            {merchantProfile && (
              <span className={styles.returning}>← Continue as {merchantProfile.name}</span>
            )}
            <span className={styles.cardArrow}>→</span>
          </button>
        </div>

        <p className={styles.hackathon}>Eslitec Hackathon · Problem Statement 1</p>
      </div>
    </div>
  );
}
