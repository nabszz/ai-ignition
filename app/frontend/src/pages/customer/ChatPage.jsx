import React, { useState, useRef, useEffect } from 'react';
import useAppStore from '../../store/appStore.js';
import styles from './ChatPage.module.css';

// Response-based adaptation map
const RESPONSE_ADAPTATIONS = {
  'too expensive': 'Got it — I\'ll look for lower-cost alternatives or a group bundle. What\'s your budget for this?',
  'remind me later': 'No problem! When would you like me to remind you? (e.g. "the 25th" or "next Friday")',
  'wrong style': 'Thanks for telling me. Can you describe what style you\'re looking for? I\'ll update your preferences.',
  'not interested': 'Understood — I\'ve noted this. I won\'t suggest this type of product again.',
  'already bought': 'Great! I\'ll end this recommendation. Would you like me to check in on whether you\'re happy with it in a few days?',
  'still have enough': 'Got it — I\'ll pause the replenishment check. I\'ll ask again in a few weeks.',
  'interested': 'Here are some options based on your preferences and budget. Which one looks most suitable?',
  'stop notifications': 'Understood — I\'ve stopped notifications for this product. You can adjust this in Settings at any time.',
};

// AI response generator (mock — replace with real LLM call in full build)
function getAIReply(userMsg) {
  const lower = userMsg.toLowerCase();
  for (const [key, reply] of Object.entries(RESPONSE_ADAPTATIONS)) {
    if (lower.includes(key)) return reply;
  }
  if (lower.includes('payday') || lower.includes('25th') || lower.includes('remind')) {
    return 'I\'ve scheduled a reminder for you. I\'ll check that the product and offer are still available before sending it.';
  }
  if (lower.includes('cheap') || lower.includes('budget') || lower.includes('price')) {
    return 'Let me check what\'s available within your budget. Do you want me to also look for eligible group deals?';
  }
  if (lower.includes('coffee') || lower.includes('shoes') || lower.includes('bag')) {
    return 'I found a few options matching your interests. Want me to show them in your feed, or would you prefer details here?';
  }
  return 'Got it — I\'m adapting your recommendations based on that. Is there anything specific you\'d like me to find for you?';
}

const QUICK_REPLIES = [
  'Too expensive', 'Remind me later', 'Wrong style', 'Already bought',
  'Show alternatives', 'What\'s in my budget?', 'Stop notifications',
];

export default function ChatPage() {
  const { customerProfile, addConversation, addMessage, conversations } = useAppStore();
  const [input, setInput]   = useState('');
  const [convId, setConvId] = useState(null);
  const [typing, setTyping] = useState(false);
  const bottomRef           = useRef(null);

  // Get or create a conversation
  const conv = conversations.find(c => c.id === convId) ?? conversations.find(c => c.status === 'active');
  const messages = conv?.messages ?? [];

  useEffect(() => {
    if (!convId) {
      const existing = conversations.find(c => c.status === 'active');
      if (existing) { setConvId(existing.id); return; }
      addConversation({ title: 'Shopping assistant' });
    }
  }, []);

  useEffect(() => {
    if (!convId && conversations.length > 0) {
      setConvId(conversations[conversations.length - 1].id);
    }
  }, [conversations.length]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, typing]);

  function send(text) {
    const msg = (text ?? input).trim();
    if (!msg || !conv) return;
    setInput('');
    addMessage(conv.id, { role: 'user', text: msg });

    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      addMessage(conv.id, { role: 'ai', text: getAIReply(msg) });
    }, 900 + Math.random() * 600);
  }

  function handleKey(e) { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className="page-title" style={{ marginBottom: 0 }}>AI Shopping Companion</h1>
        <p style={{ fontSize: '.82rem', color: 'var(--text-muted)', marginTop: 2 }}>
          Tell it what you need in your own words. It adapts to your responses.
        </p>
      </div>

      <div className={styles.chatArea}>
        {messages.length === 0 && (
          <div className={styles.welcome}>
            <span className={styles.welcomeIcon}>🛒</span>
            <p>Hi {customerProfile?.name ?? 'there'}! I'm your 2am shopping companion.</p>
            <p style={{ fontSize: '.85rem', color: 'var(--text-dim)', marginTop: 6 }}>
              Ask me anything — about a saved product, your wishlist, or what to buy next.
            </p>
          </div>
        )}

        {messages.map(msg => (
          <div key={msg.id} className={`${styles.bubble} ${msg.role === 'user' ? styles.user : styles.ai}`}>
            {msg.role === 'ai' && <span className={styles.aiIcon}>🛒</span>}
            <div className={styles.bubbleText}>{msg.text}</div>
          </div>
        ))}

        {typing && (
          <div className={`${styles.bubble} ${styles.ai}`}>
            <span className={styles.aiIcon}>🛒</span>
            <div className={styles.typing}><span /><span /><span /></div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className={styles.quickReplies}>
        {QUICK_REPLIES.map(r => (
          <button key={r} className={styles.quickBtn} onClick={() => send(r)}>{r}</button>
        ))}
      </div>

      <div className={styles.inputRow}>
        <textarea
          className={styles.textarea}
          rows={1}
          placeholder="Type a message…"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKey}
        />
        <button className="btn btn-primary btn-sm" onClick={() => send()} disabled={!input.trim()}>Send</button>
      </div>

      <p className={styles.disclaimer}>
        This chat uses a simulated AI for the hackathon demo. In the full build, responses come from a real language model using verified merchant catalogue data.
      </p>
    </div>
  );
}
