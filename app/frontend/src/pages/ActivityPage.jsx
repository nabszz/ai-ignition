import React from 'react';
import useAppStore from '../store/appStore.js';
import styles from './ActivityPage.module.css';

export default function ActivityPage() {
  const { activityLog, tasks } = useAppStore();

  const doneTasks   = tasks.filter((t) => t.status === 'done').length;
  const totalTasks  = tasks.length;
  const actionsRun  = activityLog.length;

  // Rough time-saved estimate: 2 min per completed coordination action
  const estimatedSaved = actionsRun * 2;

  return (
    <div>
      <h1 className="page-title">Activity Log</h1>
      <p className="page-sub">A record of every action the agent has completed or attempted.</p>

      {/* Summary metrics */}
      <div className={styles.metricGrid}>
        <div className={`card ${styles.metric}`}>
          <div className={styles.metricVal}>{actionsRun}</div>
          <div className={styles.metricLabel}>Actions logged</div>
        </div>
        <div className={`card ${styles.metric}`}>
          <div className={styles.metricVal}>{doneTasks} / {totalTasks}</div>
          <div className={styles.metricLabel}>Tasks completed</div>
        </div>
        <div className={`card ${styles.metric} ${styles.saved}`}>
          <div className={styles.metricVal}>~{estimatedSaved} min</div>
          <div className={styles.metricLabel}>
            Estimated time saved
            <span className={styles.est}> (estimated)</span>
          </div>
        </div>
      </div>

      <p className={styles.disclaimer}>
        Time saved is estimated at ~2 minutes per coordination action. For precise measurement, record manual vs assisted workflow times using the same starting data.
      </p>

      {/* Log */}
      {activityLog.length === 0 ? (
        <div className={`card ${styles.empty}`}>
          No activity yet. Add a task or approve an action to see the log.
        </div>
      ) : (
        <div className={styles.log}>
          {activityLog.map((entry, i) => (
            <div key={entry.id} className={styles.logItem}>
              <div className={styles.logLeft}>
                <div className={styles.logDot} />
                {i < activityLog.length - 1 && <div className={styles.logLine} />}
              </div>
              <div className={styles.logBody}>
                <span className={styles.logIcon}>{entry.icon ?? '⚡'}</span>
                <div>
                  <div className={styles.logTitle}>{entry.title}</div>
                  <div className={styles.logTime}>{formatTime(entry.timestamp)}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function formatTime(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleString('en-GB', {
    day: 'numeric', month: 'short',
    hour: '2-digit', minute: '2-digit',
  });
}
