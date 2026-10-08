/**
 * Scheduling service — builds a daily plan for a user.
 *
 * Given a user's tasks and calendar blocks, it fits focus sessions
 * into available time slots while respecting fixed commitments,
 * buffer time and working hours from the user's preferences.
 *
 * This is the core planning engine. In the full build, this
 * integrates with real calendar adapters. For the MVP it works
 * entirely from the local database.
 */
import { getDb } from '../db/init.js';
import { v4 as uuid } from 'uuid';

/**
 * Build (or rebuild) today's plan for a user.
 * Returns the list of proposed calendar blocks.
 */
export async function buildDailyPlan(userId) {
  const db   = getDb();
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
  if (!user) throw Object.assign(new Error('User not found'), { status: 404 });

  const prefs = user.preferences ? JSON.parse(user.preferences) : {};
  const today = new Date().toISOString().slice(0, 10);

  const startHour  = prefs.startHour  ?? 9;
  const endHour    = prefs.endHour    ?? 18;
  const bufferMins = prefs.bufferTime ?? 15;

  // ── 1. Load today's fixed events ──────────────────────────
  const fixedBlocks = db.prepare(`
    SELECT * FROM calendar_blocks
    WHERE user_id = ? AND date(start_time) = ? AND block_type = 'fixed'
    ORDER BY start_time
  `).all(userId, today);

  // ── 2. Load pending tasks sorted by priority ──────────────
  const tasks = db.prepare(`
    SELECT * FROM tasks
    WHERE user_id = ? AND status = 'pending'
    ORDER BY
      CASE priority WHEN 'high' THEN 1 WHEN 'medium' THEN 2 ELSE 3 END,
      due_date NULLS LAST
  `).all(userId);

  // ── 3. Remove existing agent-managed blocks for today ─────
  db.prepare(`
    DELETE FROM calendar_blocks
    WHERE user_id = ? AND date(start_time) = ? AND block_type IN ('focus','buffer')
  `).run(userId, today);

  // ── 4. Compute free slots ─────────────────────────────────
  const dayStartMs = dateTimeMs(today, startHour, 0);
  const dayEndMs   = dateTimeMs(today, endHour,   0);

  const occupied = fixedBlocks.map((b) => ({
    start: new Date(b.start_time).getTime(),
    end:   new Date(b.end_time).getTime(),
  })).sort((a, b) => a.start - b.start);

  const freeSlots = computeFreeSlots(dayStartMs, dayEndMs, occupied);

  // ── 5. Fit tasks into free slots ──────────────────────────
  const newBlocks = [];
  let slotIdx = 0;
  let slotOffset = 0;

  for (const task of tasks) {
    const needed = (task.estimated_minutes ?? 60) * 60_000;
    let remaining = needed;

    while (remaining > 0 && slotIdx < freeSlots.length) {
      const slot      = freeSlots[slotIdx];
      const available = (slot.end - slot.start) - slotOffset;

      if (available <= 0) { slotIdx++; slotOffset = 0; continue; }

      const blockDuration = Math.min(remaining, available);
      const blockStart    = slot.start + slotOffset;
      const blockEnd      = blockStart + blockDuration;

      newBlocks.push({
        id:         uuid(),
        user_id:    userId,
        task_id:    task.id,
        title:      task.title,
        start_time: new Date(blockStart).toISOString(),
        end_time:   new Date(blockEnd).toISOString(),
        block_type: 'focus',
        tool:       'manual',
      });

      remaining  -= blockDuration;
      slotOffset += blockDuration + bufferMins * 60_000;

      if (slotOffset >= (slot.end - slot.start)) {
        slotIdx++;
        slotOffset = 0;
      }
    }
  }

  // ── 6. Persist new blocks ─────────────────────────────────
  const insert = db.prepare(`
    INSERT INTO calendar_blocks (id, user_id, task_id, title, start_time, end_time, block_type, tool)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  db.transaction(() => {
    for (const b of newBlocks) {
      insert.run(b.id, b.user_id, b.task_id, b.title, b.start_time, b.end_time, b.block_type, b.tool);
    }
  })();

  return newBlocks;
}

// ── Helpers ───────────────────────────────────────────────────

function dateTimeMs(dateStr, hour, minute) {
  const d = new Date(`${dateStr}T00:00:00`);
  d.setHours(hour, minute, 0, 0);
  return d.getTime();
}

/**
 * Given a day range and sorted occupied intervals, return the free slots.
 */
function computeFreeSlots(dayStart, dayEnd, occupied) {
  const slots = [];
  let cursor  = dayStart;

  for (const { start, end } of occupied) {
    if (start > cursor) slots.push({ start: cursor, end: start });
    cursor = Math.max(cursor, end);
  }

  if (cursor < dayEnd) slots.push({ start: cursor, end: dayEnd });

  return slots.filter((s) => s.end - s.start > 5 * 60_000); // ignore <5 min gaps
}
