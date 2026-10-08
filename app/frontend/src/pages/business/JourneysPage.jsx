import React, { useState } from 'react';
import useAppStore from '../../store/appStore.js';
import styles from './JourneysPage.module.css';

const TRIGGERS = [
  { id: 'first_order',   label: 'First order delivered',     desc: 'Start after the customer\'s first purchase is confirmed.' },
  { id: 'reminder_date', label: 'Customer-requested reminder', desc: 'Send when the customer\'s chosen date arrives.' },
  { id: 'replenishment', label: 'Estimated replenishment point', desc: 'Based on observed purchase intervals for repeat-use products.' },
  { id: 'inactivity',    label: 'Inactivity beyond interval', desc: 'No new order beyond a merchant-defined number of days.' },
];

const OUTCOMES = ['purchased', 'reminded_later', 'opted_out', 'support_needed', 'no_response'];

export default function JourneysPage() {
  const { customers, catalogue, journeys, addJourney, addJourneyEvent, closeJourney, addHandover } = useAppStore();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm]         = useState({ customerId: '', productId: '', triggerId: '' });
  const [filter, setFilter]     = useState('all');

  const filtered = filter === 'all' ? journeys : journeys.filter(j => j.status === filter);

  function startJourney(e) {
    e.preventDefault();
    const customer = customers.find(c => c.id === form.customerId);
    const product  = catalogue.find(p => p.id === form.productId);
    if (!customer || !product) return;
    addJourney({
      customerId:   customer.id,
      customerName: customer.name,
      productId:    product.id,
      productName:  product.name,
      trigger:      form.triggerId,
      reason:       `Trigger: ${TRIGGERS.find(t => t.id === form.triggerId)?.label ?? form.triggerId}. Segment: ${customer.segment.replace(/_/g, ' ')}.`,
    });
    setForm({ customerId: '', productId: '', triggerId: '' });
    setShowForm(false);
  }

  function recordEvent(journeyId, type, note) {
    addJourneyEvent(journeyId, { type, note });
    if (type === 'support_needed') {
      const j = journeys.find(j => j.id === journeyId);
      addHandover({ journeyId, customerName: j?.customerName, reason: note || 'Escalated from journey' });
      closeJourney(journeyId, 'support_needed');
    } else if (['purchased', 'opted_out'].includes(type)) {
      closeJourney(journeyId, type);
    }
  }

  return (
    <div>
      <h1 className="page-title">Customer Journeys</h1>
      <p className="page-sub">Each journey tracks one customer's path from trigger to outcome. Adapt when the customer responds.</p>

      <div className={styles.toolbar}>
        <div className={styles.filters}>
          {['all', 'active', 'closed'].map(f => (
            <button key={f} className={`${styles.filterBtn} ${filter === f ? styles.active : ''}`}
              onClick={() => setFilter(f)}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => setShowForm(v => !v)}>
          {showForm ? '✕ Cancel' : '+ Start journey'}
        </button>
      </div>

      {showForm && (
        <form className={`card ${styles.form}`} onSubmit={startJourney}>
          <h3 className={styles.formTitle}>Start a new journey</h3>
          <div className={styles.formGrid}>
            <label className={styles.label}>
              Customer
              <select className={styles.input} required value={form.customerId}
                onChange={e => setForm({ ...form, customerId: e.target.value })}>
                <option value="">— select —</option>
                {customers.map(c => <option key={c.id} value={c.id}>{c.name} ({c.segment.replace(/_/g, ' ')})</option>)}
              </select>
            </label>
            <label className={styles.label}>
              Product
              <select className={styles.input} required value={form.productId}
                onChange={e => setForm({ ...form, productId: e.target.value })}>
                <option value="">— select —</option>
                {catalogue.map(p => <option key={p.id} value={p.id}>{p.name} (${p.price})</option>)}
              </select>
            </label>
            <label className={`${styles.label} ${styles.full}`}>
              Trigger
              <select className={styles.input} required value={form.triggerId}
                onChange={e => setForm({ ...form, triggerId: e.target.value })}>
                <option value="">— select —</option>
                {TRIGGERS.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
              </select>
            </label>
            {form.triggerId && (
              <p className={`${styles.triggerDesc} ${styles.full}`}>
                {TRIGGERS.find(t => t.id === form.triggerId)?.desc}
              </p>
            )}
          </div>
          <button type="submit" className="btn btn-primary" disabled={!form.customerId || !form.productId || !form.triggerId}>
            Start journey
          </button>
        </form>
      )}

      {filtered.length === 0 ? (
        <div className={`card ${styles.empty}`}>No journeys {filter !== 'all' ? `with status "${filter}"` : 'yet'}.</div>
      ) : (
        <div className={styles.journeyList}>
          {filtered.map(j => (
            <JourneyCard key={j.id} journey={j} onEvent={recordEvent} />
          ))}
        </div>
      )}
    </div>
  );
}

function JourneyCard({ journey: j, onEvent }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={`card ${styles.jCard}`}>
      <div className={styles.jHeader} onClick={() => setExpanded(v => !v)}>
        <div>
          <div className={styles.jTitle}>{j.customerName} — {j.productName}</div>
          <div className={styles.jMeta}>{j.trigger?.replace(/_/g, ' ')} · {j.events?.length ?? 0} events · {fmtDate(j.createdAt)}</div>
          {j.reason && <div className={styles.jReason}>Reason: {j.reason}</div>}
        </div>
        <div className={styles.jRight}>
          <span className={`badge ${j.status === 'active' ? 'badge-green' : j.outcome === 'purchased' ? 'badge-teal' : 'badge-amber'}`}>
            {j.status === 'closed' ? (j.outcome?.replace(/_/g, ' ') ?? 'closed') : j.status}
          </span>
          <span className={styles.jToggle}>{expanded ? '▲' : '▼'}</span>
        </div>
      </div>

      {expanded && (
        <div className={styles.jBody}>
          {j.events?.length > 0 && (
            <div className={styles.eventLog}>
              {j.events.map(ev => (
                <div key={ev.id} className={styles.eventRow}>
                  <span className={styles.eventTime}>{fmtTime(ev.ts)}</span>
                  <span className={styles.eventType}>{ev.type.replace(/_/g, ' ')}</span>
                  {ev.note && <span className={styles.eventNote}>{ev.note}</span>}
                </div>
              ))}
            </div>
          )}

          {j.status === 'active' && (
            <div className={styles.jActions}>
              <p className={styles.jActLabel}>Record customer response:</p>
              <div className={styles.jBtns}>
                <button className="btn btn-primary btn-sm"  onClick={() => onEvent(j.id, 'purchased',       'Customer confirmed purchase')}>✓ Purchased</button>
                <button className="btn btn-ghost btn-sm"    onClick={() => onEvent(j.id, 'reminded_later',  'Customer asked to be reminded later')}>📅 Remind later</button>
                <button className="btn btn-ghost btn-sm"    onClick={() => onEvent(j.id, 'no_response',     'No response recorded')}>— No response</button>
                <button className="btn btn-danger btn-sm"   onClick={() => onEvent(j.id, 'support_needed',  'Escalated to support')}>🎧 Escalate</button>
                <button className="btn btn-ghost btn-sm"    onClick={() => onEvent(j.id, 'opted_out',       'Customer opted out')}>✕ Opted out</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function fmtDate(iso) { return iso ? new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : ''; }
function fmtTime(iso) { return iso ? new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : ''; }
