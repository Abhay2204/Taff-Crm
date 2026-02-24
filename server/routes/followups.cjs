const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../db/index.cjs');

const router = express.Router();

// Get all follow-ups with filters
router.get('/', (req, res) => {
    try {
        const { status, type, salesperson, fromDate, toDate, page = 1, limit = 10 } = req.query;

        let query = `
      SELECT f.*, p.ref_no, p.first_name, p.last_name, p.mobile,
             u.name as created_by_name
      FROM follow_ups f
      JOIN prospects p ON f.prospect_id = p.id
      LEFT JOIN users u ON f.created_by = u.id
      WHERE 1=1
    `;
        const params = [];

        if (status) {
            query += ' AND f.status = ?';
            params.push(status);
        }
        if (type) {
            query += ' AND f.follow_up_type = ?';
            params.push(type);
        }
        if (salesperson) {
            query += ' AND f.created_by = ?';
            params.push(salesperson);
        }
        if (fromDate) {
            query += ' AND f.follow_up_date >= ?';
            params.push(fromDate);
        }
        if (toDate) {
            query += ' AND f.follow_up_date <= ?';
            params.push(toDate);
        }

        const countQuery = query.replace(/SELECT f\.\*, p\.ref_no.*created_by_name/, 'SELECT COUNT(*) as total');
        const { total } = db.prepare(countQuery).get(...params);

        query += ' ORDER BY f.follow_up_date DESC, f.follow_up_time DESC LIMIT ? OFFSET ?';
        params.push(parseInt(limit), (parseInt(page) - 1) * parseInt(limit));

        const followUps = db.prepare(query).all(...params);

        res.json({
            data: followUps,
            pagination: { page: parseInt(page), limit: parseInt(limit), total, totalPages: Math.ceil(total / parseInt(limit)) }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get today's follow-ups
router.get('/today', (req, res) => {
    try {
        const today = new Date().toISOString().split('T')[0];
        const followUps = db.prepare(`
      SELECT f.*, p.ref_no, p.first_name, p.last_name, p.mobile
      FROM follow_ups f
      JOIN prospects p ON f.prospect_id = p.id
      WHERE f.follow_up_date = ? AND f.status != 'Completed'
      ORDER BY f.follow_up_time ASC
    `).all(today);
        res.json(followUps);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get single follow-up
router.get('/:id', (req, res) => {
    try {
        const followUp = db.prepare(`
      SELECT f.*, p.ref_no, p.first_name, p.last_name, p.mobile, p.email
      FROM follow_ups f
      JOIN prospects p ON f.prospect_id = p.id
      WHERE f.id = ?
    `).get(req.params.id);

        if (!followUp) {
            return res.status(404).json({ error: 'Follow-up not found' });
        }
        res.json(followUp);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create follow-up
router.post('/', (req, res) => {
    try {
        const { prospectId, followUpType, followUpDate, followUpTime, status = 'Pending', outcome, nextFollowUpDate, remarks, createdBy } = req.body;

        if (!prospectId || !followUpType || !followUpDate) {
            return res.status(400).json({ error: 'Prospect ID, follow-up type, and date are required' });
        }

        const id = uuidv4();
        db.prepare(`
      INSERT INTO follow_ups (id, prospect_id, follow_up_type, follow_up_date, follow_up_time, status, outcome, next_follow_up_date, remarks, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, prospectId, followUpType, followUpDate, followUpTime, status, outcome, nextFollowUpDate, remarks, createdBy);

        // Update prospect status if needed
        if (outcome === 'Converted') {
            db.prepare('UPDATE prospects SET status = ? WHERE id = ?').run('Converted', prospectId);
        } else if (outcome === 'Not Interested') {
            db.prepare('UPDATE prospects SET status = ? WHERE id = ?').run('Lost', prospectId);
        }

        const followUp = db.prepare('SELECT * FROM follow_ups WHERE id = ?').get(id);
        res.status(201).json(followUp);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update follow-up
router.put('/:id', (req, res) => {
    try {
        const { followUpType, followUpDate, followUpTime, status, outcome, nextFollowUpDate, remarks } = req.body;

        db.prepare(`
      UPDATE follow_ups SET
        follow_up_type = COALESCE(?, follow_up_type),
        follow_up_date = COALESCE(?, follow_up_date),
        follow_up_time = COALESCE(?, follow_up_time),
        status = COALESCE(?, status),
        outcome = COALESCE(?, outcome),
        next_follow_up_date = COALESCE(?, next_follow_up_date),
        remarks = COALESCE(?, remarks)
      WHERE id = ?
    `).run(followUpType, followUpDate, followUpTime, status, outcome, nextFollowUpDate, remarks, req.params.id);

        const followUp = db.prepare('SELECT * FROM follow_ups WHERE id = ?').get(req.params.id);
        res.json(followUp);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete follow-up
router.delete('/:id', (req, res) => {
    try {
        const result = db.prepare('DELETE FROM follow_ups WHERE id = ?').run(req.params.id);
        if (result.changes === 0) {
            return res.status(404).json({ error: 'Follow-up not found' });
        }
        res.json({ message: 'Follow-up deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
