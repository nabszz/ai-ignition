import React from 'react';
import { useNavigate } from 'react-router-dom';
import useAppStore from '../store/appStore.js';
import styles from './ModeSelectPage.module.css';

export default function ModeSelectPage() {
  const { setAppMode, customerProfile, merchantProfile } = useAppStore();
  const navigate = useNavigate();

  function choose(mode) {
    setAppMode(mode);
    if (mode === 'customer') {
      navigate(customerProfile ? '/customer' : '/customer/onboarding');
    } else {
      navigate(merchantProfile ? '/business' : '/business/onboarding');
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <div className={styles.logo}>🛒</div>
        <h1 className={styles.title}>The <span className="gradient-text">2am Shoppers</span></h1>
        <p className={styles.sub}>An AI shopping companion for working youths and the businesses that serve them.</p>

        <div className={styles.cards}>
          <button className={`${styles.card} ${styles.cardCustomer}`} onClick={() => choose('customer')}>
            <span className={styles.cardEmoji}>👤</span>
            <h2>I'm a shopper</h2>
            <p>Save products, set budgets, get personalized reminders and shop smarter.</p>
            <span className={styles.cardArrow}>→</span>
          </button>
          <button className={`${styles.card} ${styles.cardBusiness}`} onClick={() => choose('business')}>
            <span className={styles.cardEmoji}>💼</span>
            <h2>I'm a merchant</h2>
            <p>Turn existing customer data into personalized journeys that drive repeat purchases.</p>
            <span className={styles.cardArrow}>→</span>
          </button>
        </div>

        <p className={styles.hackathon}>Eslitec Hackathon · Problem Statement 1</p>
      </div>
    </div>
  );
}
