const express = require('express');
const db = require('../db/index.cjs');

const router = express.Router();

// Get dashboard stats
router.get('/stats', (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    // Total prospects
    const totalProspects = db.prepare('SELECT COUNT(*) as count FROM prospects').get().count;

    // Prospects by status
    const byStatus = db.prepare(`
      SELECT status, COUNT(*) as count FROM prospects GROUP BY status
    `).all();

    // Conversions (Converted status)
    const conversions = db.prepare(`SELECT COUNT(*) as count FROM prospects WHERE status = 'Converted'`).get().count;

    // Pending follow-ups
    const pendingFollowUps = db.prepare(`
      SELECT COUNT(*) as count FROM follow_ups WHERE status = 'Pending' OR status = 'Overdue'
    `).get().count;

    // Today's follow-ups
    const todayFollowUps = db.prepare(`
      SELECT COUNT(*) as count FROM follow_ups WHERE follow_up_date = ?
    `).get(today).count;

    // Overdue follow-ups
    const overdueFollowUps = db.prepare(`
      SELECT COUNT(*) as count FROM follow_ups WHERE follow_up_date < ? AND status = 'Pending'
    `).get(today).count;

    // This month stats
    const thisMonth = new Date().toISOString().slice(0, 7);
    const lastMonth = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 7);

    const thisMonthProspects = db.prepare(`
      SELECT COUNT(*) as count FROM prospects WHERE strftime('%Y-%m', created_at) = ?
    `).get(thisMonth).count;

    const lastMonthProspects = db.prepare(`
      SELECT COUNT(*) as count FROM prospects WHERE strftime('%Y-%m', created_at) = ?
    `).get(lastMonth).count;

    const percentChange = lastMonthProspects > 0
      ? Math.round(((thisMonthProspects - lastMonthProspects) / lastMonthProspects) * 100)
      : 100;

    res.json({
      totalProspects,
      conversions,
      pendingFollowUps,
      todayFollowUps,
      overdueFollowUps,
      byStatus,
      thisMonthProspects,
      percentChange
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Recent prospects
router.get('/recent-prospects', (req, res) => {
  try {
    const prospects = db.prepare(`
      SELECT p.id, p.ref_no, p.first_name, p.last_name, p.status, p.source, p.created_at,
             u.name as salesperson_name
      FROM prospects p
      LEFT JOIN users u ON p.salesperson_id = u.id
      ORDER BY p.created_at DESC
      LIMIT 10
    `).all();
    res.json(prospects);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Today's scheduled follow-ups
router.get('/today-followups', (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const followUps = db.prepare(`
      SELECT f.id, f.follow_up_type, f.follow_up_time, f.status,
             p.first_name, p.last_name, p.mobile
      FROM follow_ups f
      JOIN prospects p ON f.prospect_id = p.id
      WHERE f.follow_up_date = ?
      ORDER BY f.follow_up_time ASC
      LIMIT 10
    `).all(today);
    res.json(followUps);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
