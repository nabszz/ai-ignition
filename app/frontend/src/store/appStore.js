import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Global store for The 2am Shoppers.
 * Persisted to localStorage so state survives refresh.
 *
 * Two views share this store:
 *   - Customer view: preferences, wishlist, conversations, reminders
 *   - Business view: merchant profile, segments, journeys, dashboard
 */
const useAppStore = create(
  persist(
    (set, get) => ({

      // ── App mode ─────────────────────────────────────────────
      // 'student' | 'working' | null (not yet chosen)
      appMode: null,
      setAppMode: (mode) => set({ appMode: mode }),

      // ── Customer / Student ───────────────────────────────────
      customerProfile: null,   // { name, userType:'student'|'working', interests[], budget, quietStart, quietEnd, paydayDate }
      setCustomerProfile: (p) => set({ customerProfile: p }),

      wishlist: [],            // [{ id, title, url, price, budget, savedAt, reminderDate }]
      addToWishlist: (item) =>
        set((s) => ({ wishlist: [...s.wishlist, { id: crypto.randomUUID(), savedAt: new Date().toISOString(), ...item }] })),
      updateWishlistItem: (id, updates) =>
        set((s) => ({ wishlist: s.wishlist.map((i) => i.id === id ? { ...i, ...updates } : i) })),
      removeFromWishlist: (id) =>
        set((s) => ({ wishlist: s.wishlist.filter((i) => i.id !== id) })),

      // AI conversation thread per product/journey
      conversations: [],       // [{ id, productId, messages[], status, createdAt }]
      addConversation: (conv) =>
        set((s) => ({ conversations: [...s.conversations, { id: crypto.randomUUID(), createdAt: new Date().toISOString(), status: 'active', messages: [], ...conv }] })),
      addMessage: (convId, message) =>
        set((s) => ({
          conversations: s.conversations.map((c) =>
            c.id === convId
              ? { ...c, messages: [...c.messages, { id: crypto.randomUUID(), ts: new Date().toISOString(), ...message }] }
              : c
          ),
        })),
      closeConversation: (convId, reason) =>
        set((s) => ({
          conversations: s.conversations.map((c) =>
            c.id === convId ? { ...c, status: 'closed', closedReason: reason } : c
          ),
        })),

      // Reminders set by the customer
      reminders: [],
      addReminder: (r) =>
        set((s) => ({ reminders: [...s.reminders, { id: crypto.randomUUID(), createdAt: new Date().toISOString(), fired: false, ...r }] })),
      dismissReminder: (id) =>
        set((s) => ({ reminders: s.reminders.map((r) => r.id === id ? { ...r, fired: true } : r) })),

      // Purchase history (confirmed orders recorded in-app)
      purchaseHistory: [],
      recordPurchase: (p) =>
        set((s) => ({ purchaseHistory: [...s.purchaseHistory, { id: crypto.randomUUID(), confirmedAt: new Date().toISOString(), ...p }] })),

      // ── Business / Working Adult ──────────────────────────────
      merchantProfile: null,   // { name, goal, contactLimitPerDay, supportEmail }
      setMerchantProfile: (p) => set({ merchantProfile: p }),

      // Product catalogue
      catalogue: [],
      addProduct: (p) =>
        set((s) => ({ catalogue: [...s.catalogue, { id: crypto.randomUUID(), createdAt: new Date().toISOString(), inStock: true, ...p }] })),
      updateProduct: (id, u) =>
        set((s) => ({ catalogue: s.catalogue.map((p) => p.id === id ? { ...p, ...u } : p) })),

      // Simulated customers (for demo)
      customers: [],
      addCustomer: (c) =>
        set((s) => ({ customers: [...s.customers, { id: crypto.randomUUID(), createdAt: new Date().toISOString(), segment: 'first_time', ...c }] })),
      updateCustomer: (id, u) =>
        set((s) => ({ customers: s.customers.map((c) => c.id === id ? { ...c, ...u } : c) })),

      // Customer journeys
      journeys: [],
      addJourney: (j) =>
        set((s) => ({ journeys: [...s.journeys, { id: crypto.randomUUID(), createdAt: new Date().toISOString(), status: 'active', events: [], ...j }] })),
      addJourneyEvent: (journeyId, event) =>
        set((s) => ({
          journeys: s.journeys.map((j) =>
            j.id === journeyId
              ? { ...j, events: [...j.events, { id: crypto.randomUUID(), ts: new Date().toISOString(), ...event }] }
              : j
          ),
        })),
      closeJourney: (journeyId, outcome) =>
        set((s) => ({
          journeys: s.journeys.map((j) =>
            j.id === journeyId ? { ...j, status: 'closed', outcome, closedAt: new Date().toISOString() } : j
          ),
        })),

      // Support handovers
      supportHandovers: [],
      addHandover: (h) =>
        set((s) => ({ supportHandovers: [...s.supportHandovers, { id: crypto.randomUUID(), createdAt: new Date().toISOString(), resolved: false, ...h }] })),
      resolveHandover: (id) =>
        set((s) => ({ supportHandovers: s.supportHandovers.map((h) => h.id === id ? { ...h, resolved: true, resolvedAt: new Date().toISOString() } : h) })),

      // ── Reset ────────────────────────────────────────────────
      reset: () => set({
        appMode: null,
        customerProfile: null, wishlist: [], conversations: [], reminders: [], purchaseHistory: [],
        merchantProfile: null, catalogue: [], customers: [], journeys: [], supportHandovers: [],
      }),
    }),
    { name: '2am-shoppers-store' }
  )
);

export default useAppStore;
