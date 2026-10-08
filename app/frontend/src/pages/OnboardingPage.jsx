import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAppStore from '../store/appStore.js';
import styles from './OnboardingPage.module.css';

const STEPS = ['mode', 'profile', 'integrations', 'preferences'];

const INTEGRATIONS = [
  { key: 'outlookCalendar', label: 'Outlook Calendar', icon: '📅', modes: ['working_adult'] },
  { key: 'googleCalendar',  label: 'Google Calendar',  icon: '📅', modes: ['student'] },
  { key: 'todoist',         label: 'Todoist',           icon: '✓',  modes: ['student', 'working_adult'] },
  { key: 'slack',           label: 'Slack',             icon: '💬', modes: ['working_adult'] },
  { key: 'gmail',           label: 'Gmail',             icon: '📧', modes: ['student', 'working_adult'] },
];

export default function OnboardingPage() {
  const [step, setStep] = useState(0);
  const [mode, setMode] = useState(null);
  const [profile, setProfile] = useState({ name: '', email: '', timezone: Intl.DateTimeFormat().resolvedOptions().timeZone });
  const [selectedIntegrations, setSelectedIntegrations] = useState([]);
  const [prefs, setPrefs] = useState({ focusLength: 90, bufferTime: 15, startHour: 9, endHour: 18 });

  const { setOnboarded, setIntegration } = useAppStore();
  const navigate = useNavigate();

  const availableIntegrations = INTEGRATIONS.filter(
    (i) => !mode || i.modes.includes(mode)
  );

  function toggleIntegration(key) {
    setSelectedIntegrations((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  }

  function handleFinish() {
    selectedIntegrations.forEach((key) => setIntegration(key, true));
    setOnboarded({ ...profile, mode, preferences: prefs });
    navigate('/');
  }

  const stepTitles = ['Who are you?', 'Your profile', 'Connect tools', 'Planning preferences'];
  const canNext = [
    mode !== null,
    profile.name.trim().length > 0,
    true, // integrations optional
    true,
  ];

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.logo}>⚡ 2am Deployers</div>
          <div className={styles.stepIndicator}>
            {STEPS.map((_, i) => (
              <div
                key={i}
                className={`${styles.dot} ${i <= step ? styles.dotActive : ''}`}
              />
            ))}
          </div>
          <h1 className={styles.title}>{stepTitles[step]}</h1>
          <p className={styles.stepLabel}>Step {step + 1} of {STEPS.length}</p>
        </div>

        {/* Step content */}
        <div className={styles.body}>

          {/* Step 0 — Mode */}
          {step === 0 && (
            <div className={styles.modeGrid}>
              <button
                className={`${styles.modeCard} ${mode === 'student' ? styles.selected : ''}`}
                onClick={() => setMode('student')}
              >
                <span className={styles.modeEmoji}>🎓</span>
                <h3>Student</h3>
                <p>Assignments, timetables, assessment deadlines and study sessions.</p>
              </button>
              <button
                className={`${styles.modeCard} ${mode === 'working_adult' ? styles.selected : ''}`}
                onClick={() => setMode('working_adult')}
              >
                <span className={styles.modeEmoji}>💼</span>
                <h3>Working Adult</h3>
                <p>Reports, deliverables, meetings and workplace follow-ups.</p>
              </button>
            </div>
          )}

          {/* Step 1 — Profile */}
          {step === 1 && (
            <div className={styles.form}>
              <label className={styles.label}>
                Your name
                <input
                  className={styles.input}
                  type="text"
                  placeholder="e.g. Alex"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                />
              </label>
              <label className={styles.label}>
                Email (optional)
                <input
                  className={styles.input}
                  type="email"
                  placeholder="you@example.com"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                />
              </label>
              <label className={styles.label}>
                Timezone
                <input
                  className={styles.input}
                  type="text"
                  value={profile.timezone}
                  onChange={(e) => setProfile({ ...profile, timezone: e.target.value })}
                />
              </label>
            </div>
          )}

          {/* Step 2 — Integrations */}
          {step === 2 && (
            <div className={styles.integrations}>
              <p className={styles.hint}>
                Select the tools you want to connect. You can add more later. All connections require explicit consent.
              </p>
              <div className={styles.integrationGrid}>
                {availableIntegrations.map(({ key, label, icon }) => (
                  <button
                    key={key}
                    className={`${styles.integrationCard} ${selectedIntegrations.includes(key) ? styles.selected : ''}`}
                    onClick={() => toggleIntegration(key)}
                  >
                    <span className={styles.intIcon}>{icon}</span>
                    <span className={styles.intLabel}>{label}</span>
                    {selectedIntegrations.includes(key) && (
                      <span className={styles.intCheck}>✓</span>
                    )}
                  </button>
                ))}
              </div>
              <p className={styles.mockNote}>
                ℹ️ For the MVP demo, integrations are simulated. Real OAuth connections will be added in a later build.
              </p>
            </div>
          )}

          {/* Step 3 — Preferences */}
          {step === 3 && (
            <div className={styles.form}>
              <label className={styles.label}>
                Focus session length (minutes)
                <input
                  className={styles.input}
                  type="number"
                  min="30" max="240"
                  value={prefs.focusLength}
                  onChange={(e) => setPrefs({ ...prefs, focusLength: +e.target.value })}
                />
              </label>
              <label className={styles.label}>
                Buffer time between tasks (minutes)
                <input
                  className={styles.input}
                  type="number"
                  min="0" max="60"
                  value={prefs.bufferTime}
                  onChange={(e) => setPrefs({ ...prefs, bufferTime: +e.target.value })}
                />
              </label>
              <label className={styles.label}>
                Work/study start hour (24h)
                <input
                  className={styles.input}
                  type="number"
                  min="0" max="23"
                  value={prefs.startHour}
                  onChange={(e) => setPrefs({ ...prefs, startHour: +e.target.value })}
                />
              </label>
              <label className={styles.label}>
                Work/study end hour (24h)
                <input
                  className={styles.input}
                  type="number"
                  min="1" max="24"
                  value={prefs.endHour}
                  onChange={(e) => setPrefs({ ...prefs, endHour: +e.target.value })}
                />
              </label>
            </div>
          )}
        </div>

        {/* Footer nav */}
        <div className={styles.footer}>
          {step > 0 ? (
            <button className="btn btn-ghost" onClick={() => setStep(step - 1)}>← Back</button>
          ) : <div />}

          {step < STEPS.length - 1 ? (
            <button
              className="btn btn-primary"
              disabled={!canNext[step]}
              onClick={() => setStep(step + 1)}
            >
              Next →
            </button>
          ) : (
            <button className="btn btn-primary" onClick={handleFinish}>
              ⚡ Let's go
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
