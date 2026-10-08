import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import useAppStore from '../../store/appStore.js';
import styles from './Layout.module.css';

const NAV = [
  { to: '/customer',          icon: '⊞',  label: 'Home',     end: true },
  { to: '/customer/feed',     icon: '🎥', label: 'Discover'  },
  { to: '/customer/wishlist', icon: '❤️', label: 'Wishlist'  },
  { to: '/customer/chat',     icon: '💬', label: 'Chat'      },
  { to: '/customer/settings', icon: '⚙️', label: 'Settings'  },
];

export default function CustomerLayout() {
  const { customerProfile, reminders, reset } = useAppStore();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const dueReminders = reminders.filter((r) => !r.fired).length;

  return (
    <div className={styles.shell}>
      <aside className={`${styles.sidebar} ${open ? styles.open : ''}`}>
        <div className={styles.logo}>
          <span>🛒</span><span>2am Shoppers</span>
        </div>
        <div className={styles.modeChip} style={{ background: 'rgba(240,78,110,.12)', color: 'var(--coral-light)', borderColor: 'rgba(240,78,110,.25)' }}>
          👤 Customer
        </div>
        <nav className={styles.nav}>
          {NAV.map(({ to, icon, label, end }) => (
            <NavLink key={to} to={to} end={end}
              className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
              onClick={() => setOpen(false)}
            >
              <span className={styles.navIcon}>{icon}</span>
              <span>{label}</span>
              {label === 'Wishlist' && dueReminders > 0 && (
                <span className={styles.badge}>{dueReminders}</span>
              )}
            </NavLink>
          ))}
        </nav>
        <div className={styles.sidebarFooter}>
          <div className={styles.userInfo}>
            <div className={styles.avatar} style={{ background: 'var(--gradient)' }}>
              {customerProfile?.name?.[0]?.toUpperCase() ?? 'U'}
            </div>
            <div>
              <div className={styles.userName}>{customerProfile?.name ?? 'Shopper'}</div>
              <div className={styles.userSub}>Customer</div>
            </div>
          </div>
          <button className={styles.switchBtn} title="Switch view"
            onClick={() => { reset(); navigate('/'); }}
          >⇄</button>
        </div>
      </aside>
      {open && <div className={styles.overlay} onClick={() => setOpen(false)} />}
      <div className={styles.main}>
        <header className={styles.topbar}>
          <button className={styles.menuBtn} onClick={() => setOpen(v => !v)}>☰</button>
          <div className={styles.topbarRight}>
            {dueReminders > 0 && (
              <NavLink to="/customer/wishlist" className={styles.alertBadge}>
                🔔 {dueReminders} reminder{dueReminders !== 1 ? 's' : ''} due
              </NavLink>
            )}
          </div>
        </header>
        <main className={styles.content}><Outlet /></main>
      </div>
    </div>
  );
}
