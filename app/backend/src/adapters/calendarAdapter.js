/**
 * Calendar adapter — abstraction layer over Outlook Calendar and Google Calendar.
 *
 * Each method has a mock implementation that works locally without credentials.
 * Replace the mock bodies with real API calls when OAuth tokens are available.
 *
 * Real implementations:
 *   Outlook: Microsoft Graph API  https://learn.microsoft.com/en-us/graph/api/resources/event
 *   Google:  Google Calendar API  https://developers.google.com/calendar/api/v3/reference/events
 */

import { getDb } from '../db/init.js';
import { v4 as uuid } from 'uuid';

/**
 * Read calendar events for a user between two ISO timestamps.
 * Returns an array of { id, title, start, end, isAllDay } objects.
 */
export async function readEvents(userId, from, to, provider = 'mock') {
  if (provider !== 'mock') {
    // TODO: call real Microsoft Graph or Google Calendar API
    throw new Error(`Provider "${provider}" not yet implemented`);
  }

  const db = getDb();
  return db.prepare(`
    SELECT id, title, start_time AS start, end_time AS end, block_type
    FROM calendar_blocks
    WHERE user_id = ? AND start_time >= ? AND end_time <= ?
    ORDER BY start_time
  `).all(userId, from, to);
}

/**
 * Create a focus block in the user's calendar.
 * Returns the created block.
 */
export async function createFocusBlock(userId, { taskId, title, startTime, endTime, provider = 'mock' }) {
  if (provider !== 'mock') {
    // TODO: POST to Microsoft Graph /me/events or Google Calendar events.insert
    throw new Error(`Provider "${provider}" not yet implemented`);
  }

  const db = getDb();
  const id = uuid();
  db.prepare(`
    INSERT INTO calendar_blocks (id, user_id, task_id, title, start_time, end_time, block_type, tool)
    VALUES (?, ?, ?, ?, ?, ?, 'focus', ?)
  `).run(id, userId, taskId ?? null, title, startTime, endTime, provider);

  return db.prepare('SELECT * FROM calendar_blocks WHERE id = ?').get(id);
}

/**
 * Move an existing focus block to new times.
 * Checks for conflicts before moving.
 */
export async function moveFocusBlock(userId, blockId, { newStartTime, newEndTime, provider = 'mock' }) {
  if (provider !== 'mock') {
    // TODO: PATCH Microsoft Graph /me/events/{id} or Google Calendar events.patch
    throw new Error(`Provider "${provider}" not yet implemented`);
  }

  const db    = getDb();
  const block = db.prepare('SELECT * FROM calendar_blocks WHERE id = ? AND user_id = ?').get(blockId, userId);
  if (!block) throw Object.assign(new Error('Block not found'), { status: 404 });
  if (block.block_type === 'fixed') throw Object.assign(new Error('Cannot move a fixed block'), { status: 400 });

  // Check for conflicts
  const conflict = db.prepare(`
    SELECT id FROM calendar_blocks
    WHERE user_id = ? AND id != ? AND block_type = 'fixed'
      AND start_time < ? AND end_time > ?
  `).get(userId, blockId, newEndTime, newStartTime);

  if (conflict) throw Object.assign(new Error('Proposed time conflicts with a fixed commitment'), { status: 409 });

  db.prepare(`
    UPDATE calendar_blocks SET start_time = ?, end_time = ? WHERE id = ?
  `).run(newStartTime, newEndTime, blockId);

  return db.prepare('SELECT * FROM calendar_blocks WHERE id = ?').get(blockId);
}

/**
 * Delete an agent-managed block.
 */
export async function deleteFocusBlock(userId, blockId) {
  const db    = getDb();
  const block = db.prepare('SELECT * FROM calendar_blocks WHERE id = ? AND user_id = ?').get(blockId, userId);
  if (!block)                        throw Object.assign(new Error('Block not found'), { status: 404 });
  if (block.block_type === 'fixed')  throw Object.assign(new Error('Cannot delete a fixed commitment'), { status: 400 });

  db.prepare('DELETE FROM calendar_blocks WHERE id = ?').run(blockId);
}
