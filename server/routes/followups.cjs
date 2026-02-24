const express = require('express');
const FollowUp = require('../models/FollowUp.cjs');
const Prospect = require('../models/Prospect.cjs');
const User = require('../models/User.cjs');

const router = express.Router();

// Get all follow-ups with filters
router.get('/', async (req, res) => {
    try {
        const { status, type, salesperson, fromDate, toDate, page = 1, limit = 10 } = req.query;

        const filter = {};
        if (status) filter.status = status;
        if (type) filter.follow_up_type = type;
        if (salesperson) filter.created_by = salesperson;
        if (fromDate && toDate) {
            filter.follow_up_date = { $gte: fromDate, $lte: toDate };
        } else if (fromDate) {
            filter.follow_up_date = { $gte: fromDate };
        } else if (toDate) {
            filter.follow_up_date = { $lte: toDate };
        }

        const total = await FollowUp.countDocuments(filter);
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const followUps = await FollowUp.find(filter)
            .sort({ follow_up_date: -1, follow_up_time: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        // Populate prospect and user info
        const prospectIds = [...new Set(followUps.map(f => f.prospect_id).filter(Boolean))];
        const userIds = [...new Set(followUps.map(f => f.created_by).filter(Boolean))];

        const [prospects, users] = await Promise.all([
            prospectIds.length > 0 ? Prospect.find({ _id: { $in: prospectIds } }).select('ref_no first_name last_name mobile') : [],
            userIds.length > 0 ? User.find({ _id: { $in: userIds } }).select('name') : []
        ]);

        const prospectMap = {};
        prospects.forEach(p => { prospectMap[p._id] = p; });
        const userMap = {};
        users.forEach(u => { userMap[u._id] = u.name; });

        const data = followUps.map(f => {
            const obj = f.toJSON();
            const prospect = prospectMap[obj.prospect_id] || {};
            obj.ref_no = prospect.ref_no || '';
            obj.first_name = prospect.first_name || '';
            obj.last_name = prospect.last_name || '';
            obj.mobile = prospect.mobile || '';
            obj.created_by_name = userMap[obj.created_by] || '';
            return obj;
        });

        res.json({
            data,
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

// Get today's follow-ups
router.get('/today', async (req, res) => {
    try {
        const today = new Date().toISOString().split('T')[0];

        const followUps = await FollowUp.find({
            follow_up_date: today,
            status: { $ne: 'Completed' }
        }).sort({ follow_up_time: 1 });

        // Populate prospect info
        const prospectIds = followUps.map(f => f.prospect_id).filter(Boolean);
        const prospects = prospectIds.length > 0
            ? await Prospect.find({ _id: { $in: prospectIds } }).select('ref_no first_name last_name mobile')
            : [];
        const prospectMap = {};
        prospects.forEach(p => { prospectMap[p._id] = p; });

        const data = followUps.map(f => {
            const obj = f.toJSON();
            const prospect = prospectMap[obj.prospect_id] || {};
            obj.ref_no = prospect.ref_no || '';
            obj.first_name = prospect.first_name || '';
            obj.last_name = prospect.last_name || '';
            obj.mobile = prospect.mobile || '';
            return obj;
        });

        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get single follow-up
router.get('/:id', async (req, res) => {
    try {
        const followUp = await FollowUp.findById(req.params.id);
        if (!followUp) {
            return res.status(404).json({ error: 'Follow-up not found' });
        }

        const obj = followUp.toJSON();
        const prospect = await Prospect.findById(obj.prospect_id).select('ref_no first_name last_name mobile email');
        if (prospect) {
            obj.ref_no = prospect.ref_no;
            obj.first_name = prospect.first_name;
            obj.last_name = prospect.last_name;
            obj.mobile = prospect.mobile;
            obj.email = prospect.email;
        }

        res.json(obj);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create follow-up
router.post('/', async (req, res) => {
    try {
        const { prospectId, followUpType, followUpDate, followUpTime, status = 'Pending', outcome, nextFollowUpDate, remarks, createdBy } = req.body;

        if (!prospectId || !followUpType || !followUpDate) {
            return res.status(400).json({ error: 'Prospect ID, follow-up type, and date are required' });
        }

        const followUp = await FollowUp.create({
            prospect_id: prospectId,
            follow_up_type: followUpType,
            follow_up_date: followUpDate,
            follow_up_time: followUpTime || '',
            status,
            outcome: outcome || '',
            next_follow_up_date: nextFollowUpDate || '',
            remarks: remarks || '',
            created_by: createdBy || '',
        });

        // Update prospect status if needed
        if (outcome === 'Converted') {
            await Prospect.findByIdAndUpdate(prospectId, { status: 'Converted' });
        } else if (outcome === 'Not Interested') {
            await Prospect.findByIdAndUpdate(prospectId, { status: 'Lost' });
        }

        res.status(201).json(followUp);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update follow-up
router.put('/:id', async (req, res) => {
    try {
        const { followUpType, followUpDate, followUpTime, status, outcome, nextFollowUpDate, remarks } = req.body;

        const updateData = {};
        if (followUpType !== undefined) updateData.follow_up_type = followUpType;
        if (followUpDate !== undefined) updateData.follow_up_date = followUpDate;
        if (followUpTime !== undefined) updateData.follow_up_time = followUpTime;
        if (status !== undefined) updateData.status = status;
        if (outcome !== undefined) updateData.outcome = outcome;
        if (nextFollowUpDate !== undefined) updateData.next_follow_up_date = nextFollowUpDate;
        if (remarks !== undefined) updateData.remarks = remarks;

        const followUp = await FollowUp.findByIdAndUpdate(req.params.id, updateData, { new: true });
        if (!followUp) {
            return res.status(404).json({ error: 'Follow-up not found' });
        }

        res.json(followUp);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete follow-up
router.delete('/:id', async (req, res) => {
    try {
        const result = await FollowUp.findByIdAndDelete(req.params.id);
        if (!result) {
            return res.status(404).json({ error: 'Follow-up not found' });
        }
        res.json({ message: 'Follow-up deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
