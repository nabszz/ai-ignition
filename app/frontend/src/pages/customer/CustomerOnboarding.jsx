import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAppStore from '../../store/appStore.js';
import styles from './CustomerOnboarding.module.css';

const STUDENT_INTERESTS  = ['Fashion', 'Coffee', 'Beauty', 'Stationery & Study', 'Electronics', 'Food & Snacks', 'Sports', 'Books'];
const WORKING_INTERESTS  = ['Fashion', 'Coffee', 'Beauty', 'Workday Essentials', 'Electronics', 'Food & Snacks', 'Home & Living', 'Gadgets'];

const STEPS = ['type', 'interests', 'budget', 'notifications', 'review'];

export default function CustomerOnboarding() {
  const [step,       setStep]       = useState(0);
  const [userType,   setUserType]   = useState(''); // 'student' | 'working'
  const [name,       setName]       = useState('');
  const [interests,  setInterests]  = useState([]);
  const [budget,     setBudget]     = useState('');
  const [quietStart, setQuietStart] = useState('22:00');
  const [quietEnd,   setQuietEnd]   = useState('08:00');
  const [paydayDate, setPaydayDate] = useState('');
  const [notifFreq,  setNotifFreq]  = useState('occasional');

  const { setCustomerProfile } = useAppStore();
  const navigate = useNavigate();

  const INTERESTS = userType === 'working' ? WORKING_INTERESTS : STUDENT_INTERESTS;

  function toggleInterest(i) {
    setInterests(prev => prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i]);
  }

  function pickType(t) {
    setUserType(t);
    setInterests([]); // reset interests when type changes
    setStep(1);
  }

  function finish() {
    setCustomerProfile({
      name, userType, interests,
      budget: Number(budget) || null,
      quietStart, quietEnd, paydayDate, notifFreq,
    });
    navigate('/customer');
  }

  const canNext = [
    true,                                        // step 0 handled by pickType buttons
    name.trim().length > 0 && interests.length > 0,
    true,
    true,
    true,
  ];

  const titles = [
    'What best describes you?',
    'Tell us about yourself',
    'Set your budget',
    'Notification preferences',
    'Ready to go!',
  ];

  const isStudent = userType === 'student';

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.header}>
          <div className={styles.logo}>🛒 2am Shoppers</div>
          <div className={styles.progress}>
            {STEPS.map((_, i) => (
              <div key={i} className={`${styles.dot} ${i <= step ? styles.dotOn : ''}`} />
            ))}
          </div>
          <h1 className={styles.title}>{titles[step]}</h1>
          <p className={styles.stepLabel}>Step {step + 1} of {STEPS.length}</p>
        </div>

        <div className={styles.body}>

          {/* Step 0 — user type */}
          {step === 0 && (
            <div className={styles.typeGrid}>
              <button
                className={`${styles.typeCard} ${userType === 'student' ? styles.typeSelected : ''}`}
                onClick={() => pickType('student')}
              >
                <span className={styles.typeEmoji}>🎓</span>
                <div className={styles.typeLabel}>Student</div>
                <div className={styles.typeDesc}>Budgeting for school, stationery, snacks and style on a student budget.</div>
              </button>
              <button
                className={`${styles.typeCard} ${userType === 'working' ? styles.typeSelected : ''}`}
                onClick={() => pickType('working')}
              >
                <span className={styles.typeEmoji}>💼</span>
                <div className={styles.typeLabel}>Working Adult</div>
                <div className={styles.typeDesc}>Shopping around your work life — essentials, coffee, payday treats.</div>
              </button>
            </div>
          )}

          {/* Step 1 — name + interests */}
          {step === 1 && (
            <div className={styles.stack}>
              <div className={styles.userTypeBadge}>
                {isStudent ? '🎓 Student' : '💼 Working Adult'}
              </div>
              <label className={styles.label}>
                Your name
                <input className={styles.input} placeholder="e.g. Alicia" value={name}
                  onChange={e => setName(e.target.value)} />
              </label>
              <div className={styles.label}>
                What are you into? <span className={styles.hint}>(pick at least one)</span>
                <div className={styles.interestGrid}>
                  {INTERESTS.map(i => (
                    <button key={i} type="button"
                      className={`${styles.interestChip} ${interests.includes(i) ? styles.selected : ''}`}
                      onClick={() => toggleInterest(i)}>
                      {i}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 2 — budget */}
          {step === 2 && (
            <div className={styles.stack}>
              <p className={styles.bodyText}>
                {isStudent
                  ? 'Set a general shopping budget to filter recommendations around your student allowance. You can also set per-product budgets later.'
                  : 'Set a general shopping budget so we can filter recommendations for you. You can also set per-product budgets later.'}
              </p>
              <label className={styles.label}>
                General budget (SGD, optional)
                <div className={styles.inputPrefix}>
                  <span>$</span>
                  <input className={styles.input} type="number" min="1"
                    placeholder={isStudent ? 'e.g. 30' : 'e.g. 50'}
                    value={budget} onChange={e => setBudget(e.target.value)} />
                </div>
              </label>
              <p className={styles.subtle}>The app will not infer your income or payday from your age or shopping habits.</p>
            </div>
          )}

          {/* Step 3 — notifications */}
          {step === 3 && (
            <div className={styles.stack}>
              <label className={styles.label}>
                Notification frequency
                <select className={styles.input} value={notifFreq} onChange={e => setNotifFreq(e.target.value)}>
                  <option value="frequent">Frequent — keep me updated</option>
                  <option value="occasional">Occasional — only when relevant</option>
                  <option value="minimal">Minimal — important alerts only</option>
                </select>
              </label>
              <label className={styles.label}>
                Quiet hours start
                <input className={styles.input} type="time" value={quietStart} onChange={e => setQuietStart(e.target.value)} />
              </label>
              <label className={styles.label}>
                Quiet hours end
                <input className={styles.input} type="time" value={quietEnd} onChange={e => setQuietEnd(e.target.value)} />
              </label>
              <label className={styles.label}>
                {isStudent ? 'Allowance day reminder (optional)' : 'Payday reminder date (optional)'}
                <input className={styles.input} type="number" min="1" max="31"
                  placeholder="Day of month, e.g. 25"
                  value={paydayDate} onChange={e => setPaydayDate(e.target.value)} />
              </label>
            </div>
          )}

          {/* Step 4 — review */}
          {step === 4 && (
            <div className={styles.review}>
              <div className={styles.reviewRow}>
                <span>Account type</span>
                <strong>{isStudent ? '🎓 Student' : '💼 Working Adult'}</strong>
              </div>
              <div className={styles.reviewRow}><span>Name</span><strong>{name}</strong></div>
              <div className={styles.reviewRow}><span>Interests</span><strong>{interests.join(', ') || '—'}</strong></div>
              <div className={styles.reviewRow}><span>Budget</span><strong>{budget ? `$${budget}` : 'Not set'}</strong></div>
              <div className={styles.reviewRow}><span>Notifications</span><strong>{notifFreq}</strong></div>
              <div className={styles.reviewRow}><span>Quiet hours</span><strong>{quietStart} – {quietEnd}</strong></div>
              {paydayDate && (
                <div className={styles.reviewRow}>
                  <span>{isStudent ? 'Allowance day' : 'Payday reminder'}</span>
                  <strong>Day {paydayDate}</strong>
                </div>
              )}
              <p className={styles.subtle} style={{ marginTop: 14 }}>You can change any of these in Settings at any time.</p>
            </div>
          )}
        </div>

        <div className={styles.footer}>
          {step > 0
            ? <button className="btn btn-ghost" onClick={() => setStep(step - 1)}>← Back</button>
            : <div />}
          {step === 0
            ? <div /> /* step 0 uses type cards to advance */
            : step < STEPS.length - 1
              ? <button className="btn btn-primary" disabled={!canNext[step]} onClick={() => setStep(step + 1)}>Next →</button>
              : <button className="btn btn-primary" onClick={finish}>🛒 Start shopping</button>
          }
        </div>
      </div>
    </div>
  );
}
