import React, { useState } from 'react';
import useAppStore from '../../store/appStore.js';
import styles from './SupportPage.module.css';

export default function SupportPage() {
  const { supportHandovers, resolveHandover, addHandover, merchantProfile } = useAppStore();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm]         = useState({ customerName: '', reason: '', context: '' });

  const open     = supportHandovers.filter(h => !h.resolved);
  const resolved = supportHandovers.filter(h =>  h.resolved);

  function submit(e) {
    e.preventDefault();
    if (!form.customerName.trim()) return;
    addHandover(form);
    setForm({ customerName: '', reason: '', context: '' });
    setShowForm(false);
  }

  return (
    <div>
      <h1 className="page-title">Support Handovers</h1>
      <p className="page-sub">
        Cases escalated from customer journeys. Review the context and resolve once addressed.
        Sales prompts are paused for customers with open cases.
      </p>

      <div className={styles.toolbar}>
        <div className={styles.counts}>
          <span className={`badge ${open.length > 0 ? 'badge-red' : 'badge-green'}`}>{open.length} open</span>
          <span className="badge badge-teal">{resolved.length} resolved</span>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={() => setShowForm(v => !v)}>
          {showForm ? '✕ Cancel' : '+ Manual handover'}
        </button>
      </div>

      {showForm && (
        <form className={`card ${styles.form}`} onSubmit={submit}>
          <h3 className={styles.formTitle}>Create manual handover</h3>
          <div className={styles.stack}>
            <label className={styles.label}>
              Customer name * <input className={styles.input} required value={form.customerName}
                onChange={e => setForm({ ...form, customerName: e.target.value })} />
            </label>
            <label className={styles.label}>
              Reason <input className={styles.input} value={form.reason}
                onChange={e => setForm({ ...form, reason: e.target.value })}
                placeholder="e.g. Unresolved complaint, refund request" />
            </label>
            <label className={styles.label}>
              Conversation context <textarea className={`${styles.input} ${styles.textarea}`} rows={3}
                value={form.context}
                onChange={e => setForm({ ...form, context: e.target.value })}
                placeholder="Paste relevant context here so the staff member has what they need" />
            </label>
          </div>
          <button type="submit" className="btn btn-primary">Create handover</button>
        </form>
      )}

      {open.length === 0 && (
        <div className={`card ${styles.allClear}`}>
          ✅ No open support cases. All customers are on active or completed journeys.
        </div>
      )}

      {open.length > 0 && (
        <>
          <h2 className="section-title" style={{ marginTop: 4 }}>Open cases</h2>
          <div className={styles.list}>
            {open.map(h => (
              <HandoverCard key={h.id} handover={h} onResolve={resolveHandover} supportEmail={merchantProfile?.supportEmail} />
            ))}
          </div>
        </>
      )}

      {resolved.length > 0 && (
        <>
          <h2 className="section-title" style={{ marginTop: 28 }}>Resolved</h2>
          <div className={styles.list}>
            {resolved.map(h => (
              <div key={h.id} className={`card ${styles.resolvedCard}`}>
                <span className={styles.resolvedIcon}>✓</span>
                <div>
                  <div className={styles.resolvedName}>{h.customerName}</div>
                  <div className={styles.resolvedMeta}>{h.reason || 'No reason specified'} · Resolved {fmtDate(h.resolvedAt)}</div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function HandoverCard({ handover: h, onResolve, supportEmail }) {
  return (
    <div className={`card ${styles.openCard}`}>
      <div className={styles.openHeader}>
        <span className={styles.openIcon}>🎧</span>
        <div className={styles.openInfo}>
          <div className={styles.openName}>{h.customerName}</div>
          <div className={styles.openMeta}>Escalated {fmtDate(h.createdAt)}</div>
        </div>
        <span className="badge badge-red">Open</span>
      </div>

      {h.reason && (
        <div className={styles.openReason}><strong>Reason:</strong> {h.reason}</div>
      )}

      {h.context && (
        <div className={styles.openContext}>
          <div className={styles.contextLabel}>Context for staff</div>
          <div className={styles.contextText}>{h.context}</div>
        </div>
      )}

      <div className={styles.openActions}>
        {supportEmail && (
          <a href={`mailto:${supportEmail}?subject=Support case: ${h.customerName}`}
            className="btn btn-ghost btn-sm">
            📧 Email support
          </a>
        )}
        <button className="btn btn-primary btn-sm" onClick={() => onResolve(h.id)}>
          ✓ Mark resolved
        </button>
      </div>

      <p className={styles.pauseNote}>
        ⏸ Sales prompts are paused for this customer until this case is resolved.
      </p>
    </div>
  );
}

function fmtDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}
