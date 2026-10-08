import React, { useState } from 'react';
import useAppStore from '../store/appStore.js';
import styles from './PlanPage.module.css';

// Demo plan blocks (will come from backend scheduler in full build)
const DEMO_BLOCKS = [
  { id: '1', time: '09:00–10:30', label: 'Prepare proposal',       type: 'focus',   source: 'Agent scheduled' },
  { id: '2', time: '10:30–10:45', label: 'Review proposal',        type: 'focus',   source: 'Agent scheduled' },
  { id: '3', time: '10:45–11:00', label: 'Buffer',                 type: 'buffer',  source: '' },
  { id: '4', time: '11:00–11:30', label: 'Team meeting',           type: 'fixed',   source: 'Outlook Calendar' },
  { id: '5', time: '11:30–11:45', label: 'Final prep & delivery',  type: 'focus',   source: 'Agent scheduled' },
  { id: '6', time: '12:00',       label: 'Client meeting',         type: 'fixed',   source: 'Outlook Calendar' },
];

const TYPE_STYLES = {
  focus:  { color: 'var(--blue-light)',   bg: 'rgba(37,99,235,.1)',   icon: '🔵' },
  buffer: { color: 'var(--text-dim)',     bg: 'rgba(255,255,255,.03)', icon: '⬜' },
  fixed:  { color: 'var(--amber-light)',  bg: 'rgba(217,119,6,.08)',  icon: '🟡' },
};

export default function PlanPage() {
  const { tasks, userMode, addApproval, logActivity } = useAppStore();
  const [simulatingChange, setSimulatingChange] = useState(false);
  const [changeApplied, setChangeApplied] = useState(false);

  const today = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });

  function simulateSlackChange() {
    setSimulatingChange(true);
    setTimeout(() => {
      addApproval({
        type: 'reschedule',
        title: 'Reschedule due to earlier client meeting',
        description: 'Slack message detected: "The client meeting has moved to 12 PM. Please have the proposal ready before the meeting."',
        actions: [
          { tool: 'todoist',         action: 'update_due_time',    details: 'Update task due time → 11:45 AM' },
          { tool: 'outlookCalendar', action: 'move_focus_block',   details: 'Move preparation block → 9:00–10:30 AM' },
          { tool: 'outlookCalendar', action: 'move_review_block',  details: 'Move review block → 10:30–10:45 AM' },
          { tool: 'reminder',        action: 'set_reminder',       details: 'Set reminder at 11:30 AM' },
        ],
        slackMessage: '"The client meeting has moved to 12 PM. Please have the proposal ready before the meeting."',
      });
      logActivity({ icon: '💬', title: 'Change detected from Slack — approval requested' });
      setSimulatingChange(false);
      setChangeApplied(true);
    }, 1800);
  }

  const pendingTasks = tasks.filter((t) => t.status !== 'done');

  return (
    <div>
      <h1 className="page-title">Daily Plan</h1>
      <p className="page-sub">{today}</p>

      {/* Demo scenario banner */}
      <div className={styles.demoBanner}>
        <div className={styles.demoLabel}>Demo scenario</div>
        <p>This shows the MVP working demo: a working adult preparing a client proposal. Trigger a simulated Slack change to see adaptive replanning in action.</p>
        <button
          className={`btn btn-primary btn-sm ${styles.demoBtn}`}
          onClick={simulateSlackChange}
          disabled={simulatingChange || changeApplied}
        >
          {simulatingChange
            ? '⏳ Agent detecting change…'
            : changeApplied
            ? '✓ Change queued for approval'
            : '💬 Simulate: meeting moved to 12 PM'}
        </button>
        {changeApplied && (
          <p className={styles.demoHint}>
            → Go to <strong>Approvals</strong> to review and approve the proposed updates.
          </p>
        )}
      </div>

      {/* Timeline */}
      <h2 className={styles.sectionTitle}>Today's schedule</h2>
      <div className={styles.timeline}>
        {DEMO_BLOCKS.map((block) => {
          const t = TYPE_STYLES[block.type];
          return (
            <div
              key={block.id}
              className={styles.block}
              style={{ background: t.bg, borderLeft: `3px solid ${t.color}` }}
            >
              <div className={styles.blockTime}>{block.time}</div>
              <div className={styles.blockContent}>
                <span className={styles.blockIcon}>{t.icon}</span>
                <div>
                  <div className={styles.blockLabel} style={{ color: t.color }}>{block.label}</div>
                  {block.source && <div className={styles.blockSource}>{block.source}</div>}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Your tasks */}
      {pendingTasks.length > 0 && (
        <>
          <h2 className={styles.sectionTitle} style={{ marginTop: 36 }}>Unscheduled tasks</h2>
          <div className={styles.unscheduled}>
            {pendingTasks.map((t) => (
              <div key={t.id} className={`card ${styles.unschCard}`}>
                <div className={styles.unschTitle}>{t.title}</div>
                <div className={styles.unschMeta}>
                  {t.dueDate && <span>📅 {t.dueDate}</span>}
                  <span>⏱ {t.estimatedMinutes} min</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Legend */}
      <div className={styles.legend}>
        <span className={styles.legendItem}><span style={{ color: 'var(--blue-light)' }}>🔵</span> Agent-scheduled focus block</span>
        <span className={styles.legendItem}><span style={{ color: 'var(--amber-light)' }}>🟡</span> Fixed commitment</span>
        <span className={styles.legendItem}><span>⬜</span> Buffer</span>
      </div>
    </div>
  );
}
