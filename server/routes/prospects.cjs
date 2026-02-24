const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../db/index.cjs');

const router = express.Router();

// Get all prospects with filters
router.get('/', (req, res) => {
    try {
        const { status, source, salesperson, search, fromDate, toDate, page = 1, limit = 10 } = req.query;

        let query = `
      SELECT p.*, u.name as salesperson_name 
      FROM prospects p 
      LEFT JOIN users u ON p.salesperson_id = u.id 
      WHERE 1=1
    `;
        const params = [];

        if (status) {
            query += ' AND p.status = ?';
            params.push(status);
        }
        if (source) {
            query += ' AND p.source = ?';
            params.push(source);
        }
        if (salesperson) {
            query += ' AND p.salesperson_id = ?';
            params.push(salesperson);
        }
        if (search) {
            query += ' AND (p.first_name LIKE ? OR p.last_name LIKE ? OR p.mobile LIKE ? OR p.email LIKE ? OR p.ref_no LIKE ?)';
            const searchTerm = `%${search}%`;
            params.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
        }
        if (fromDate) {
            query += ' AND DATE(p.created_at) >= ?';
            params.push(fromDate);
        }
        if (toDate) {
            query += ' AND DATE(p.created_at) <= ?';
            params.push(toDate);
        }

        // Get total count
        const countQuery = query.replace('SELECT p.*, u.name as salesperson_name', 'SELECT COUNT(*) as total');
        const { total } = db.prepare(countQuery).get(...params);

        // Add pagination
        query += ' ORDER BY p.created_at DESC LIMIT ? OFFSET ?';
        params.push(parseInt(limit), (parseInt(page) - 1) * parseInt(limit));

        const prospects = db.prepare(query).all(...params);

        res.json({
            data: prospects,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get single prospect
router.get('/:id', (req, res) => {
    try {
        const prospect = db.prepare(`
      SELECT p.*, u.name as salesperson_name 
      FROM prospects p 
      LEFT JOIN users u ON p.salesperson_id = u.id 
      WHERE p.id = ? OR p.ref_no = ?
    `).get(req.params.id, req.params.id);

        if (!prospect) {
            return res.status(404).json({ error: 'Prospect not found' });
        }

        // Get follow-ups for this prospect
        const followUps = db.prepare(`
      SELECT f.*, u.name as created_by_name 
      FROM follow_ups f 
      LEFT JOIN users u ON f.created_by = u.id 
      WHERE f.prospect_id = ? 
      ORDER BY f.follow_up_date DESC
    `).all(prospect.id);

        res.json({ ...prospect, follow_ups: followUps });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create prospect
router.post('/', (req, res) => {
    try {
        const { firstName, lastName, mobile, email, address, city, source, vehicleType, model, budget, salespersonId, remarks } = req.body;

        if (!firstName || !mobile) {
            return res.status(400).json({ error: 'First name and mobile are required' });
        }

        const id = uuidv4();
        const count = db.prepare('SELECT COUNT(*) as count FROM prospects').get().count;
        const refNo = `PRO-${String(count + 1).padStart(3, '0')}`;

        db.prepare(`
      INSERT INTO prospects (id, ref_no, first_name, last_name, mobile, email, address, city, source, vehicle_type, model, budget, salesperson_id, remarks)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, refNo, firstName, lastName, mobile, email, address, city, source, vehicleType, model, budget, salespersonId, remarks);

        const prospect = db.prepare('SELECT * FROM prospects WHERE id = ?').get(id);
        res.status(201).json(prospect);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update prospect
router.put('/:id', (req, res) => {
    try {
        const { firstName, lastName, mobile, email, address, city, source, vehicleType, model, budget, salespersonId, status, remarks } = req.body;

        const existing = db.prepare('SELECT id FROM prospects WHERE id = ?').get(req.params.id);
        if (!existing) {
            return res.status(404).json({ error: 'Prospect not found' });
        }

        db.prepare(`
      UPDATE prospects SET 
        first_name = COALESCE(?, first_name),
        last_name = COALESCE(?, last_name),
        mobile = COALESCE(?, mobile),
        email = COALESCE(?, email),
        address = COALESCE(?, address),
        city = COALESCE(?, city),
        source = COALESCE(?, source),
        vehicle_type = COALESCE(?, vehicle_type),
        model = COALESCE(?, model),
        budget = COALESCE(?, budget),
        salesperson_id = COALESCE(?, salesperson_id),
        status = COALESCE(?, status),
        remarks = COALESCE(?, remarks),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(firstName, lastName, mobile, email, address, city, source, vehicleType, model, budget, salespersonId, status, remarks, req.params.id);

        const prospect = db.prepare('SELECT * FROM prospects WHERE id = ?').get(req.params.id);
        res.json(prospect);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete prospect
router.delete('/:id', (req, res) => {
    try {
        const result = db.prepare('DELETE FROM prospects WHERE id = ?').run(req.params.id);
        if (result.changes === 0) {
            return res.status(404).json({ error: 'Prospect not found' });
        }
        res.json({ message: 'Prospect deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
