import React from 'react';
import { Link } from 'react-router-dom';
import useAppStore from '../store/appStore.js';
import styles from './DashboardPage.module.css';

export default function DashboardPage() {
  const { userProfile, userMode, tasks, pendingApprovals, activityLog, integrations } = useAppStore();

  const today = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });
  const pendingCount    = pendingApprovals.filter((a) => a.status === 'pending').length;
  const activeTasks     = tasks.filter((t) => t.status !== 'done').length;
  const connectedCount  = Object.values(integrations).filter(Boolean).length;
  const recentActivity  = activityLog.slice(0, 5);

  return (
    <div>
      <p className="page-sub">{today}</p>
      <h1 className="page-title">
        Good {getGreeting()}, {userProfile?.name ?? 'there'} 👋
      </h1>
      <p className="page-sub" style={{ marginBottom: 32 }}>
        {userMode === 'student' ? 'Here\'s your study overview for today.' : 'Here\'s your work overview for today.'}
      </p>

      {/* Stats */}
      <div className={styles.statsGrid}>
        <div className={`card ${styles.statCard}`}>
          <div className={styles.statNum}>{activeTasks}</div>
          <div className={styles.statLabel}>Active tasks</div>
          <Link to="/tasks" className={styles.statLink}>View all →</Link>
        </div>
        <div className={`card ${styles.statCard} ${pendingCount > 0 ? styles.urgent : ''}`}>
          <div className={styles.statNum}>{pendingCount}</div>
          <div className={styles.statLabel}>Pending approvals</div>
          <Link to="/approvals" className={styles.statLink}>Review →</Link>
        </div>
        <div className={`card ${styles.statCard}`}>
          <div className={styles.statNum}>{connectedCount}</div>
          <div className={styles.statLabel}>Connected tools</div>
        </div>
        <div className={`card ${styles.statCard}`}>
          <div className={styles.statNum}>{activityLog.length}</div>
          <div className={styles.statLabel}>Actions logged</div>
          <Link to="/activity" className={styles.statLink}>View log →</Link>
        </div>
      </div>

      {/* Quick actions */}
      <h2 className={styles.sectionTitle}>Quick actions</h2>
      <div className={styles.quickGrid}>
        <Link to="/tasks" className={styles.quickCard}>
          <span className={styles.quickIcon}>✚</span>
          <div>
            <div className={styles.quickTitle}>Add a task</div>
            <div className={styles.quickSub}>Record a deadline or deliverable</div>
          </div>
        </Link>
        <Link to="/plan" className={styles.quickCard}>
          <span className={styles.quickIcon}>📅</span>
          <div>
            <div className={styles.quickTitle}>View today's plan</div>
            <div className={styles.quickSub}>See your scheduled focus blocks</div>
          </div>
        </Link>
        {pendingCount > 0 && (
          <Link to="/approvals" className={`${styles.quickCard} ${styles.urgentCard}`}>
            <span className={styles.quickIcon}>🔐</span>
            <div>
              <div className={styles.quickTitle}>{pendingCount} approval{pendingCount !== 1 ? 's' : ''} waiting</div>
              <div className={styles.quickSub}>Review and approve proposed changes</div>
            </div>
          </Link>
        )}
      </div>

      {/* Recent activity */}
      <h2 className={styles.sectionTitle}>Recent activity</h2>
      {recentActivity.length === 0 ? (
        <div className={`card ${styles.empty}`}>
          <span>No activity yet. Add your first task to get started.</span>
        </div>
      ) : (
        <div className={styles.activityList}>
          {recentActivity.map((entry) => (
            <div key={entry.id} className={`card ${styles.activityItem}`}>
              <span className={styles.actIcon}>{entry.icon ?? '⚡'}</span>
              <div>
                <div className={styles.actTitle}>{entry.title}</div>
                <div className={styles.actTime}>{formatRelative(entry.timestamp)}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}

function formatRelative(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1)  return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `${hrs}h ago`;
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}
