import React, { useState } from 'react';
import useAppStore from '../store/appStore.js';
import styles from './TasksPage.module.css';

const PRIORITY_LABELS = { high: '🔴 High', medium: '🟡 Medium', low: '🟢 Low' };

const EMPTY_FORM = {
  title: '', description: '', dueDate: '', dueTime: '',
  estimatedMinutes: 60, priority: 'medium', weight: '',
};

export default function TasksPage() {
  const { tasks, addTask, updateTask, removeTask, addApproval, logActivity, userMode } = useAppStore();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [filter, setFilter] = useState('all');

  const filtered = tasks.filter((t) => {
    if (filter === 'pending') return t.status === 'pending';
    if (filter === 'done')    return t.status === 'done';
    return true;
  });

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.title.trim()) return;

    addTask({ ...form });
    logActivity({ icon: '✚', title: `Task added: "${form.title}"` });

    // Queue an approval to schedule a focus block
    addApproval({
      type: 'schedule_task',
      title: `Schedule focus block for "${form.title}"`,
      description: `Create a ${form.estimatedMinutes}-minute focus block before the deadline.`,
      actions: [
        { tool: 'calendar', action: 'create_focus_block', details: `${form.estimatedMinutes} min before ${form.dueDate} ${form.dueTime}` },
        { tool: 'todoist',  action: 'create_task',        details: `Due ${form.dueDate} ${form.dueTime}` },
      ],
    });

    setForm(EMPTY_FORM);
    setShowForm(false);
  }

  function markDone(id) {
    updateTask(id, { status: 'done' });
    const t = tasks.find((t) => t.id === id);
    logActivity({ icon: '✅', title: `Task completed: "${t?.title}"` });
  }

  function handleRemove(id) {
    const t = tasks.find((t) => t.id === id);
    removeTask(id);
    logActivity({ icon: '🗑️', title: `Task removed: "${t?.title}"` });
  }

  return (
    <div>
      <h1 className="page-title">Tasks</h1>
      <p className="page-sub">
        {userMode === 'student'
          ? 'Your assignments, tests and projects.'
          : 'Your reports, deliverables and follow-ups.'}
      </p>

      {/* Toolbar */}
      <div className={styles.toolbar}>
        <div className={styles.filters}>
          {['all', 'pending', 'done'].map((f) => (
            <button
              key={f}
              className={`${styles.filterBtn} ${filter === f ? styles.active : ''}`}
              onClick={() => setFilter(f)}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => setShowForm((v) => !v)}>
          {showForm ? '✕ Cancel' : '✚ Add task'}
        </button>
      </div>

      {/* Add task form */}
      {showForm && (
        <form className={`card ${styles.form}`} onSubmit={handleSubmit}>
          <h3 className={styles.formTitle}>New task</h3>
          <div className={styles.formGrid}>
            <label className={styles.label}>
              Title *
              <input
                className={styles.input}
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder={userMode === 'student' ? 'e.g. Literature essay' : 'e.g. Client proposal'}
              />
            </label>
            <label className={styles.label}>
              {userMode === 'student' ? 'Assessment weight (%)' : 'Importance'}
              <input
                className={styles.input}
                value={form.weight}
                onChange={(e) => setForm({ ...form, weight: e.target.value })}
                placeholder={userMode === 'student' ? '20' : 'High / Medium / Low'}
              />
            </label>
            <label className={styles.label}>
              Due date
              <input
                className={styles.input}
                type="date"
                value={form.dueDate}
                onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
              />
            </label>
            <label className={styles.label}>
              Due time
              <input
                className={styles.input}
                type="time"
                value={form.dueTime}
                onChange={(e) => setForm({ ...form, dueTime: e.target.value })}
              />
            </label>
            <label className={styles.label}>
              Estimated time (minutes)
              <input
                className={styles.input}
                type="number"
                min="5"
                value={form.estimatedMinutes}
                onChange={(e) => setForm({ ...form, estimatedMinutes: +e.target.value })}
              />
            </label>
            <label className={styles.label}>
              Priority
              <select
                className={styles.input}
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value })}
              >
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </label>
            <label className={`${styles.label} ${styles.fullWidth}`}>
              Description (optional)
              <textarea
                className={styles.input}
                rows={2}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </label>
          </div>
          <div className={styles.formActions}>
            <button type="submit" className="btn btn-primary">Add task → agent will schedule</button>
          </div>
        </form>
      )}

      {/* Task list */}
      {filtered.length === 0 ? (
        <div className={`card ${styles.empty}`}>No tasks yet. Add your first one above.</div>
      ) : (
        <div className={styles.taskList}>
          {filtered.map((task) => (
            <div key={task.id} className={`card ${styles.taskCard} ${task.status === 'done' ? styles.done : ''}`}>
              <div className={styles.taskLeft}>
                <button
                  className={styles.checkBtn}
                  onClick={() => task.status !== 'done' && markDone(task.id)}
                  title="Mark done"
                  aria-label="Mark task done"
                >
                  {task.status === 'done' ? '✓' : '○'}
                </button>
                <div>
                  <div className={styles.taskTitle}>{task.title}</div>
                  {task.description && <div className={styles.taskDesc}>{task.description}</div>}
                  <div className={styles.taskMeta}>
                    {task.dueDate && <span>📅 {task.dueDate}{task.dueTime ? ` at ${task.dueTime}` : ''}</span>}
                    {task.estimatedMinutes && <span>⏱ {task.estimatedMinutes} min</span>}
                    {task.weight && <span>⭐ {task.weight}{userMode === 'student' ? '%' : ''}</span>}
                    <span className={`badge ${task.priority === 'high' ? 'badge-red' : task.priority === 'medium' ? 'badge-amber' : 'badge-green'}`}>
                      {PRIORITY_LABELS[task.priority]}
                    </span>
                  </div>
                </div>
              </div>
              <button className={`btn btn-danger btn-sm ${styles.removeBtn}`} onClick={() => handleRemove(task.id)}>
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
