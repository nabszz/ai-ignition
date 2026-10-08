/**
 * Agent service — the core "Observe → Understand → Plan → Review →
 * Execute → Verify → Monitor" loop.
 *
 * For the MVP this runs on-demand (triggered via POST /api/agent/trigger).
 * In production it would run on a schedule or in response to webhook events.
 *
 * Each phase is a stub with the expected interface so the team can plug in
 * real LLM calls, adapter reads and adapter writes incrementally.
 */
import { getDb }        from '../db/init.js';
import { buildDailyPlan } from './scheduler.js';
import { v4 as uuid }  from 'uuid';

/**
 * Run one full agent cycle for a user.
 *
 * @param {string} userId
 * @param {object} event  - Optional triggering event, e.g. { type: 'slack_message', content: '...' }
 */
export async function runAgentCycle(userId, event = null) {
  const db = getDb();

  // ── 1. Observe ───────────────────────────────────────────
  const observations = await observe(userId, event, db);

  // ── 2. Understand ────────────────────────────────────────
  const extracted = await understand(observations);

  // ── 3. Plan ──────────────────────────────────────────────
  const proposal = await plan(userId, extracted, db);

  // ── 4. Review (raise approval if needed) ─────────────────
  if (proposal.requiresApproval) {
    const approvalId = await raiseApproval(userId, proposal, db);
    log(userId, '🔐', `Approval requested: "${proposal.title}"`, db);
    return { status: 'awaiting_approval', approvalId, proposal };
  }

  // ── 5. Execute ───────────────────────────────────────────
  const results = await execute(userId, proposal, db);

  // ── 6. Verify ────────────────────────────────────────────
  const verified = await verify(results);

  // ── 7. Log ───────────────────────────────────────────────
  verified.forEach((r) => log(userId, r.success ? '✅' : '⚠️', r.message, db));

  return { status: 'completed', results: verified };
}

// ── Phase implementations (stubs for MVP) ────────────────────

async function observe(userId, event, db) {
  const observations = [];

  // Read pending tasks
  const tasks = db.prepare('SELECT * FROM tasks WHERE user_id = ? AND status = "pending"').all(userId);
  observations.push({ type: 'tasks', data: tasks });

  // Include the triggering event if present
  if (event) observations.push({ type: 'event', data: event });

  return observations;
}

async function understand(observations) {
  /**
   * In the full build: send observations to an LLM (e.g. OpenAI or Bedrock)
   * to extract structured task details, identify changes and infer intent.
   *
   * For the MVP: pass observations through unchanged.
   */
  return observations;
}

async function plan(userId, extracted, db) {
  /**
   * Check priorities, dependencies and available time.
   * If a change is detected, determine what needs to move.
   *
   * Returns a proposal object describing what actions are needed
   * and whether human approval is required.
   */

  const eventObs = extracted.find((o) => o.type === 'event');
  if (eventObs?.data?.type === 'slack_message') {
    // A message was received — propose a reschedule
    return {
      requiresApproval: true,
      type:  'reschedule',
      title: 'Reschedule based on incoming message',
      description: `Message content: "${eventObs.data.content}"`,
      sourceRef: `slack:${eventObs.data.messageId ?? 'unknown'}`,
      actions: [
        { tool: 'todoist',         action: 'update_due_time', details: 'Update task deadline' },
        { tool: 'outlookCalendar', action: 'move_focus_block', details: 'Move focus blocks to fit new constraint' },
        { tool: 'reminder',        action: 'set_reminder',    details: 'Set reminder before new deadline' },
      ],
    };
  }

  // Default: rebuild the daily plan (no approval needed for auto-scheduling)
  await buildDailyPlan(userId);
  return { requiresApproval: false, title: 'Daily plan refreshed', actions: [] };
}

async function raiseApproval(userId, proposal, db) {
  const id = uuid();
  db.prepare(`
    INSERT INTO approvals (id, user_id, type, title, description, actions, source_ref)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    id, userId, proposal.type ?? 'general',
    proposal.title, proposal.description ?? null,
    JSON.stringify(proposal.actions), proposal.sourceRef ?? null
  );
  return id;
}

async function execute(userId, proposal, db) {
  /**
   * Apply each approved action through the relevant tool adapter.
   * Each adapter should:
   *   1. Recheck current state before writing (avoid stale plan)
   *   2. Return { success, tool, action, message }
   *   3. Be idempotent where possible
   *
   * Tool adapters live in src/adapters/ — stub implementations are
   * provided. Replace with real API calls when credentials are available.
   */
  const results = [];
  for (const action of proposal.actions ?? []) {
    try {
      // TODO: route to the correct adapter module
      results.push({ success: true, tool: action.tool, action: action.action, message: `[mock] ${action.tool}:${action.action} completed` });
    } catch (err) {
      results.push({ success: false, tool: action.tool, action: action.action, message: err.message });
    }
  }
  return results;
}

async function verify(results) {
  /**
   * Confirm the actual state of each tool matches the expected outcome.
   * For the MVP, pass through the execution results.
   * In production, re-read each tool and compare.
   */
  return results;
}

function log(userId, icon, title, db) {
  db.prepare('INSERT INTO activity_log (id, user_id, icon, title) VALUES (?, ?, ?, ?)')
    .run(uuid(), userId, icon, title);
}
