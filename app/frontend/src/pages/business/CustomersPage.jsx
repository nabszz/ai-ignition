import React, { useState } from 'react';
import useAppStore from '../../store/appStore.js';
import styles from './CustomersPage.module.css';

const SEGMENTS = ['first_time', 'returning_customer', 'replenishment', 'inactive', 'unresolved_issue', 'opted_out'];
const SEG_BADGE = {
  first_time:          'badge-teal',
  returning_customer:  'badge-green',
  replenishment:       'badge-coral',
  inactive:            'badge-amber',
  unresolved_issue:    'badge-red',
  opted_out:           'badge-violet',
};

const EMPTY_FORM = { name: '', email: '', orders: 0, lastOrder: '', segment: 'first_time', notes: '' };

export default function CustomersPage() {
  const { customers, addCustomer, updateCustomer } = useAppStore();
  const [filter, setFilter]     = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm]         = useState(EMPTY_FORM);

  const filtered = filter === 'all' ? customers : customers.filter(c => c.segment === filter);

  function submit(e) {
    e.preventDefault();
    if (!form.name.trim()) return;
    addCustomer({ ...form, orders: Number(form.orders) || 0 });
    setForm(EMPTY_FORM);
    setShowForm(false);
  }

  return (
    <div>
      <h1 className="page-title">Customers</h1>
      <p className="page-sub">Existing customer records imported from your business data.</p>

      <div className={styles.toolbar}>
        <div className={styles.filters}>
          <button className={`${styles.filterBtn} ${filter === 'all' ? styles.active : ''}`}
            onClick={() => setFilter('all')}>All ({customers.length})</button>
          {SEGMENTS.map(s => {
            const count = customers.filter(c => c.segment === s).length;
            if (count === 0) return null;
            return (
              <button key={s} className={`${styles.filterBtn} ${filter === s ? styles.active : ''}`}
                onClick={() => setFilter(s)}>
                {s.replace(/_/g, ' ')} ({count})
              </button>
            );
          })}
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => setShowForm(v => !v)}>
          {showForm ? '✕ Cancel' : '+ Add customer'}
        </button>
      </div>

      {showForm && (
        <form className={`card ${styles.form}`} onSubmit={submit}>
          <h3 className={styles.formTitle}>Add customer record</h3>
          <div className={styles.formGrid}>
            <label className={styles.label}>
              Name * <input className={styles.input} required value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Customer name" />
            </label>
            <label className={styles.label}>
              Email <input className={styles.input} type="email" value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })} />
            </label>
            <label className={styles.label}>
              Number of orders <input className={styles.input} type="number" min="0" value={form.orders}
                onChange={e => setForm({ ...form, orders: e.target.value })} />
            </label>
            <label className={styles.label}>
              Last order date <input className={styles.input} type="date" value={form.lastOrder}
                onChange={e => setForm({ ...form, lastOrder: e.target.value })} />
            </label>
            <label className={styles.label}>
              Segment
              <select className={styles.input} value={form.segment}
                onChange={e => setForm({ ...form, segment: e.target.value })}>
                {SEGMENTS.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
              </select>
            </label>
            <label className={styles.label}>
              Notes <input className={styles.input} value={form.notes}
                onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Optional" />
            </label>
          </div>
          <button type="submit" className="btn btn-primary">Add record</button>
          <p className={styles.subtle}>Match records only using authorised identifiers. Do not assume accounts on different marketplaces belong to the same person.</p>
        </form>
      )}

      {filtered.length === 0 ? (
        <div className={`card ${styles.empty}`}>No customers in this segment yet.</div>
      ) : (
        <div className={styles.table}>
          <div className={styles.tableHead}>
            <span>Customer</span>
            <span>Segment</span>
            <span>Orders</span>
            <span>Last order</span>
            <span>Actions</span>
          </div>
          {filtered.map(c => (
            <CustomerRow key={c.id} customer={c} onUpdate={updateCustomer} />
          ))}
        </div>
      )}
    </div>
  );
}

function CustomerRow({ customer: c, onUpdate }) {
  const [editing, setEditing] = useState(false);
  const [seg, setSeg]         = useState(c.segment);

  function saveSegment() {
    onUpdate(c.id, { segment: seg });
    setEditing(false);
  }

  return (
    <div className={styles.tableRow}>
      <div>
        <div className={styles.custName}>{c.name}</div>
        {c.notes && <div className={styles.custNotes}>{c.notes}</div>}
      </div>
      <div>
        {editing ? (
          <select className={styles.segSelect} value={seg} onChange={e => setSeg(e.target.value)}>
            {SEGMENTS.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
          </select>
        ) : (
          <span className={`badge ${SEG_BADGE[c.segment] ?? 'badge-coral'}`}>{c.segment.replace(/_/g, ' ')}</span>
        )}
      </div>
      <span className={styles.custOrders}>{c.orders ?? 0}</span>
      <span className={styles.custDate}>{c.lastOrder || '—'}</span>
      <div className={styles.rowActions}>
        {editing
          ? <><button className="btn btn-primary btn-sm" onClick={saveSegment}>Save</button>
              <button className="btn btn-ghost btn-sm" onClick={() => setEditing(false)}>Cancel</button></>
          : <button className="btn btn-ghost btn-sm" onClick={() => setEditing(true)}>Edit</button>
        }
      </div>
    </div>
  );
}
