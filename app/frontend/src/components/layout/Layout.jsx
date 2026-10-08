import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import useAppStore from '../../store/appStore.js';
import styles from './Layout.module.css';

const NAV_ITEMS = [
  { to: '/',          icon: '⊞',  label: 'Dashboard'  },
  { to: '/tasks',     icon: '✓',  label: 'Tasks'       },
  { to: '/plan',      icon: '📅', label: 'Daily Plan'  },
  { to: '/approvals', icon: '🔐', label: 'Approvals'   },
  { to: '/activity',  icon: '📋', label: 'Activity'    },
];

export default function Layout() {
  const { userProfile, userMode, pendingApprovals, reset } = useAppStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const pendingCount = pendingApprovals.filter((a) => a.status === 'pending').length;

  function handleReset() {
    if (window.confirm('Reset all data and return to onboarding?')) {
      reset();
      navigate('/onboarding');
    }
  }

  return (
    <div className={styles.shell}>
      {/* Sidebar */}
      <aside className={`${styles.sidebar} ${sidebarOpen ? styles.open : ''}`}>
        <div className={styles.sidebarLogo}>
          <span className={styles.logoIcon}>⚡</span>
          <span>2am Deployers</span>
        </div>

        <div className={styles.modeChip}>
          {userMode === 'student' ? '🎓 Student' : '💼 Working Adult'}
        </div>

        <nav className={styles.nav}>
          {NAV_ITEMS.map(({ to, icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `${styles.navItem} ${isActive ? styles.active : ''}`
              }
              onClick={() => setSidebarOpen(false)}
            >
              <span className={styles.navIcon}>{icon}</span>
              <span>{label}</span>
              {label === 'Approvals' && pendingCount > 0 && (
                <span className={styles.badge}>{pendingCount}</span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className={styles.sidebarFooter}>
          <div className={styles.userInfo}>
            <div className={styles.avatar}>
              {userProfile?.name?.[0]?.toUpperCase() ?? 'U'}
            </div>
            <div>
              <div className={styles.userName}>{userProfile?.name ?? 'User'}</div>
              <div className={styles.userSub}>{userProfile?.email ?? ''}</div>
            </div>
          </div>
          <button className={styles.resetBtn} onClick={handleReset} title="Reset">
            ↺
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className={styles.overlay} onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main content */}
      <div className={styles.main}>
        <header className={styles.topbar}>
          <button
            className={styles.menuBtn}
            onClick={() => setSidebarOpen((v) => !v)}
            aria-label="Toggle sidebar"
          >
            ☰
          </button>
          <div className={styles.topbarRight}>
            {pendingCount > 0 && (
              <NavLink to="/approvals" className={styles.approvalAlert}>
                🔐 {pendingCount} pending approval{pendingCount !== 1 ? 's' : ''}
              </NavLink>
            )}
          </div>
        </header>

        <main className={styles.content}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
