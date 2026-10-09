import React from 'react';
import { Link } from 'react-router-dom';
import useAppStore from '../../store/appStore.js';
import styles from './CustomerHome.module.css';

// Demo notifications — student and working adult variants
const STUDENT_NOTIFS = [
  { id: 'n1', emoji: '👟', text: "Still thinking about those sneakers? They're now within your $30 budget.", type: 'price_drop' },
  { id: 'n2', emoji: '☕', text: 'Coffee check — running low, or still stocked from last week?', type: 'replenishment' },
  { id: 'n3', emoji: '📅', text: "You asked for an allowance day reminder — want to revisit your wishlist?", type: 'reminder' },
];

const WORKING_NOTIFS = [
  { id: 'n1', emoji: '👀', text: "Still thinking about those office shoes? They're now within your $40 budget.", type: 'price_drop' },
  { id: 'n2', emoji: '☕', text: 'Coffee check — running low, or still stocked?', type: 'replenishment' },
  { id: 'n3', emoji: '📅', text: "You asked for a payday reminder — want to revisit your wishlist?", type: 'reminder' },
];

export default function CustomerHome() {
  const { customerProfile, wishlist, conversations, reminders, purchaseHistory } = useAppStore();

  const name        = customerProfile?.name ?? 'there';
  const isStudent   = customerProfile?.userType === 'student';
  const hour        = new Date().getHours();
  const greeting    = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const dueItems    = wishlist.filter(i => i.reminderDate).length;
  const activeConvs = conversations.filter(c => c.status === 'active').length;
  const purchases   = purchaseHistory.length;

  return (
    <div>
      <h1 className="page-title">{greeting}, {name} 👋</h1>
      <p className="page-sub">
        {isStudent
          ? "Here's what's relevant for you today — student picks and reminders."
          : "Here's what's relevant for you today — work-life shopping made easier."}
      </p>

      {/* Stats row */}
      <div className={styles.statsRow}>
        <div className="card">
          <div className={styles.statNum}>{wishlist.length}</div>
          <div className={styles.statLabel}>Saved items</div>
          <Link to="/customer/wishlist" className={styles.statLink}>View →</Link>
        </div>
        <div className="card">
          <div className={styles.statNum}>{activeConvs}</div>
          <div className={styles.statLabel}>Active chats</div>
          <Link to="/customer/chat" className={styles.statLink}>Open →</Link>
        </div>
        <div className="card">
          <div className={styles.statNum}>{purchases}</div>
          <div className={styles.statLabel}>Purchases recorded</div>
        </div>
        <div className={`card ${dueItems > 0 ? styles.statUrgent : ''}`}>
          <div className={styles.statNum}>{dueItems}</div>
          <div className={styles.statLabel}>Reminders set</div>
          <Link to="/customer/wishlist" className={styles.statLink}>Review →</Link>
        </div>
      </div>

      {/* Notifications */}
      <h2 className="section-title" style={{ marginTop: 28 }}>From your AI companion</h2>
      <div className={styles.notifList}>
        {(isStudent ? STUDENT_NOTIFS : WORKING_NOTIFS).map(n => (
          <NotifCard key={n.id} notif={n} />
        ))}
      </div>

      {/* Quick actions */}
      <h2 className="section-title" style={{ marginTop: 28 }}>Quick actions</h2>
      <div className={styles.quickGrid}>
        <Link to="/customer/wishlist" className={styles.quickCard}>
          <span className={styles.quickIcon}>❤️</span>
          <div>
            <div className={styles.quickTitle}>Save a product</div>
            <div className={styles.quickSub}>Add a link, set a budget, get a reminder</div>
          </div>
        </Link>
        <Link to="/customer/feed" className={styles.quickCard}>
          <span className={styles.quickIcon}>🎥</span>
          <div>
            <div className={styles.quickTitle}>Browse the feed</div>
            <div className={styles.quickSub}>Personalized picks based on your interests</div>
          </div>
        </Link>
        <Link to="/customer/chat" className={styles.quickCard}>
          <span className={styles.quickIcon}>💬</span>
          <div>
            <div className={styles.quickTitle}>Ask your AI companion</div>
            <div className={styles.quickSub}>Tell it what you need in your own words</div>
          </div>
        </Link>
      </div>

      <p className={styles.brandNote}><strong>"2am"</strong> is the brand personality, not a default notification time. All notifications respect your quiet hours.</p>
    </div>
  );
}

function NotifCard({ notif }) {
  const [dismissed, setDismissed] = React.useState(false);
  const [response, setResponse]   = React.useState(null);

  if (dismissed) return null;

  const RESPONSES = {
    price_drop:    ['Interested!', 'Too expensive', 'Remind me later', 'Not interested'],
    replenishment: ['Running low!', 'Still stocked', 'Stop reminders'],
    reminder:      ['Show wishlist', 'Not now', 'Change date'],
  };

  const options = RESPONSES[notif.type] || ['Yes', 'No'];

  return (
    <div className={styles.notifCard}>
      <div className={styles.notifTop}>
        <span className={styles.notifEmoji}>{notif.emoji}</span>
        <p className={styles.notifText}>{notif.text}</p>
        <button className={styles.notifDismiss} onClick={() => setDismissed(true)}>✕</button>
      </div>
      {!response ? (
        <div className={styles.notifActions}>
          {options.map(opt => (
            <button key={opt} className={styles.notifBtn} onClick={() => setResponse(opt)}>{opt}</button>
          ))}
        </div>
      ) : (
        <div className={styles.notifReply}>
          <span className={styles.notifReplyIcon}>✓</span> Response recorded: <strong>{response}</strong> — AI is adapting your journey.
        </div>
      )}
    </div>
  );
}
