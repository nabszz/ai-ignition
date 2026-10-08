import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAppStore from '../../store/appStore.js';
import styles from './CustomerSettings.module.css';

const INTERESTS = ['Fashion', 'Coffee', 'Beauty', 'Workday Essentials', 'Electronics', 'Food & Snacks', 'Sports', 'Home & Living'];

export default function CustomerSettings() {
  const { customerProfile, setCustomerProfile, reset } = useAppStore();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name:        customerProfile?.name        ?? '',
    interests:   customerProfile?.interests   ?? [],
    budget:      customerProfile?.budget      ?? '',
    quietStart:  customerProfile?.quietStart  ?? '22:00',
    quietEnd:    customerProfile?.quietEnd    ?? '08:00',
    paydayDate:  customerProfile?.paydayDate  ?? '',
    notifFreq:   customerProfile?.notifFreq   ?? 'occasional',
  });
  const [saved, setSaved] = useState(false);

  function toggleInterest(i) {
    setForm(f => ({
      ...f,
      interests: f.interests.includes(i) ? f.interests.filter(x => x !== i) : [...f.interests, i],
    }));
  }

  function save(e) {
    e.preventDefault();
    setCustomerProfile({ ...form, budget: Number(form.budget) || null });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  function handleReset() {
    if (window.confirm('This will clear all your data and return you to the start. Continue?')) {
      reset();
      navigate('/');
    }
  }

  return (
    <div>
      <h1 className="page-title">Settings</h1>
      <p className="page-sub">Update your preferences at any time.</p>

      <form className={styles.form} onSubmit={save}>
        <section className={styles.section}>
          <h2 className={styles.sectionHead}>Profile</h2>
          <label className={styles.label}>
            Name
            <input className={styles.input} value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })} />
          </label>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionHead}>Interests</h2>
          <div className={styles.interestGrid}>
            {INTERESTS.map(i => (
              <button key={i} type="button"
                className={`${styles.chip} ${form.interests.includes(i) ? styles.chipOn : ''}`}
                onClick={() => toggleInterest(i)}>
                {i}
              </button>
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionHead}>Budget</h2>
          <label className={styles.label}>
            General budget (SGD)
            <input className={styles.input} type="number" min="0"
              placeholder="Leave blank to not set"
              value={form.budget}
              onChange={e => setForm({ ...form, budget: e.target.value })} />
          </label>
          <p className={styles.subtle}>The app will not infer your salary from your age or habits.</p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionHead}>Notifications</h2>
          <label className={styles.label}>
            Frequency
            <select className={styles.input} value={form.notifFreq}
              onChange={e => setForm({ ...form, notifFreq: e.target.value })}>
              <option value="frequent">Frequent</option>
              <option value="occasional">Occasional</option>
              <option value="minimal">Minimal</option>
            </select>
          </label>
          <div className={styles.row}>
            <label className={styles.label}>
              Quiet hours start
              <input className={styles.input} type="time" value={form.quietStart}
                onChange={e => setForm({ ...form, quietStart: e.target.value })} />
            </label>
            <label className={styles.label}>
              Quiet hours end
              <input className={styles.input} type="time" value={form.quietEnd}
                onChange={e => setForm({ ...form, quietEnd: e.target.value })} />
            </label>
          </div>
          <label className={styles.label}>
            Payday reminder (day of month)
            <input className={styles.input} type="number" min="1" max="31"
              placeholder="e.g. 25"
              value={form.paydayDate}
              onChange={e => setForm({ ...form, paydayDate: e.target.value })} />
          </label>
        </section>

        <div className={styles.actions}>
          <button type="submit" className="btn btn-primary">
            {saved ? '✓ Saved' : 'Save changes'}
          </button>
          <button type="button" className="btn btn-danger btn-sm" onClick={handleReset}>
            Reset all data
          </button>
        </div>
      </form>
    </div>
  );
}
