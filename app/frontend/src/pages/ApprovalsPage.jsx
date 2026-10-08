import React from 'react';
import useAppStore from '../store/appStore.js';
import styles from './ApprovalsPage.module.css';

export default function ApprovalsPage() {
  const { pendingApprovals, resolveApproval, logActivity } = useAppStore();

  const pending  = pendingApprovals.filter((a) => a.status === 'pending');
  const resolved = pendingApprovals.filter((a) => a.status !== 'pending');

  function approve(approval) {
    resolveApproval(approval.id, 'approved');
    approval.actions?.forEach((action) => {
      logActivity({
        icon: '✅',
        title: `[${action.tool}] ${action.action}: ${action.details}`,
      });
    });
    logActivity({ icon: '🔐', title: `Approval granted: "${approval.title}"` });
  }

  function reject(approval) {
    resolveApproval(approval.id, 'rejected');
    logActivity({ icon: '✕', title: `Approval rejected: "${approval.title}"` });
  }

  return (
    <div>
      <h1 className="page-title">Approvals</h1>
      <p className="page-sub">Review proposed agent actions before they are executed on your tools.</p>

      {pending.length === 0 && (
        <div className={`card ${styles.empty}`}>
          ✅ No pending approvals. You're all caught up.
        </div>
      )}

      {pending.map((approval) => (
        <ApprovalCard key={approval.id} approval={approval} onApprove={approve} onReject={reject} />
      ))}

      {resolved.length > 0 && (
        <>
          <h2 className={styles.sectionTitle} style={{ marginTop: 36 }}>Resolved</h2>
          <div className={styles.resolvedList}>
            {resolved.map((approval) => (
              <div key={approval.id} className={`card ${styles.resolvedCard}`}>
                <span className={styles.resolvedIcon}>
                  {approval.status === 'approved' ? '✅' : '✕'}
                </span>
                <div>
                  <div className={styles.resolvedTitle}>{approval.title}</div>
                  <div className={styles.resolvedMeta}>
                    {approval.status.toUpperCase()} · {formatTime(approval.resolvedAt)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function ApprovalCard({ approval, onApprove, onReject }) {
  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <span className={styles.cardIcon}>🔐</span>
        <div>
          <div className={styles.cardTitle}>{approval.title}</div>
          <div className={styles.cardTime}>Requested {formatTime(approval.createdAt)}</div>
        </div>
      </div>

      {approval.description && (
        <p className={styles.cardDesc}>{approval.description}</p>
      )}

      {approval.slackMessage && (
        <div className={styles.slackMsg}>
          <span className={styles.slackLabel}>💬 Source — Slack message</span>
          <blockquote>{approval.slackMessage}</blockquote>
        </div>
      )}

      <div className={styles.actions}>
        <h4 className={styles.actionsLabel}>Proposed actions</h4>
        <ul className={styles.actionList}>
          {approval.actions?.map((action, i) => (
            <li key={i} className={styles.actionItem}>
              <span className={styles.actionTool}>{action.tool}</span>
              <span className={styles.actionDetails}>{action.action}: {action.details}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className={styles.btnRow}>
        <button className={`btn btn-primary`} onClick={() => onApprove(approval)}>
          ✓ Approve
        </button>
        <button className={`btn btn-ghost`} onClick={() => onReject(approval)}>
          ✕ Reject
        </button>
      </div>

      <p className={styles.notice}>
        Approval applies only to the displayed actions. If circumstances change, the agent will request fresh approval.
      </p>
    </div>
  );
}

function formatTime(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}
