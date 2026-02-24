const express = require('express');
const Prospect = require('../models/Prospect.cjs');
const Service = require('../models/Service.cjs');
const User = require('../models/User.cjs');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// Helper: Auto-create service records when vehicle is delivered
async function autoCreateServices(prospect) {
    const existingCount = await Service.countDocuments({ prospect_id: prospect._id });
    if (existingCount > 0) return;

    const deliveryDate = prospect.delivery_date || new Date().toISOString().split('T')[0];
    const customerName = `${prospect.first_name} ${prospect.last_name || ''}`.trim();

    const milestones = [
        { month: '1st Month', offset: 1 },
        { month: '4th Month', offset: 4 },
        { month: '7th Month', offset: 7 },
        { month: '12th Month', offset: 12 },
    ];

    const services = milestones.map(m => {
        const date = new Date(deliveryDate);
        date.setMonth(date.getMonth() + m.offset);
        return {
            prospect_id: prospect._id,
            vehicle_model: prospect.model || '',
            customer_name: customerName,
            customer_mobile: prospect.mobile,
            taluka: prospect.taluka || prospect.city || '',
            delivery_date: deliveryDate,
            service_month: m.month,
            service_date: date.toISOString().split('T')[0],
            status: 'Pending',
        };
    });

    await Service.insertMany(services);
}

// Get all prospects with filters & pagination
router.get('/', async (req, res) => {
    try {
        const { status, source, salesperson, taluka, search, page = 1, limit = 20 } = req.query;

        const filter = {};
        if (status) filter.status = status;
        if (source) filter.source = source;
        if (salesperson) filter.salesperson_id = salesperson;
        if (taluka) filter.taluka = taluka;
        if (search) {
            filter.$or = [
                { first_name: { $regex: search, $options: 'i' } },
                { last_name: { $regex: search, $options: 'i' } },
                { mobile: { $regex: search, $options: 'i' } },
                { ref_no: { $regex: search, $options: 'i' } },
            ];
        }

        const total = await Prospect.countDocuments(filter);
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const prospects = await Prospect.find(filter)
            .sort({ created_at: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        // Populate salesperson name
        const userIds = [...new Set(prospects.map(p => p.salesperson_id).filter(Boolean))];
        const users = userIds.length > 0
            ? await User.find({ _id: { $in: userIds } }).select('name')
            : [];
        const userMap = {};
        users.forEach(u => { userMap[u._id] = u.name; });

        const data = prospects.map(p => {
            const obj = p.toJSON();
            obj.salesperson_name = userMap[obj.salesperson_id] || '';
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

// Get single prospect
router.get('/:id', async (req, res) => {
    try {
        const prospect = await Prospect.findById(req.params.id);
        if (!prospect) {
            return res.status(404).json({ error: 'Prospect not found' });
        }

        const obj = prospect.toJSON();
        if (obj.salesperson_id) {
            const user = await User.findById(obj.salesperson_id).select('name');
            obj.salesperson_name = user ? user.name : '';
        }

        res.json(obj);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create prospect
router.post('/', async (req, res) => {
    try {
        const {
            firstName, lastName, mobile, email, address, city, taluka,
            source, model, vehicleType, budget, status, salespersonId,
            deliveryDate, remarks
        } = req.body;

        if (!firstName || !mobile) {
            return res.status(400).json({ error: 'First name and mobile are required' });
        }

        const prospect = await Prospect.create({
            first_name: firstName,
            last_name: lastName || '',
            mobile,
            email: email || '',
            address: address || '',
            city: city || '',
            taluka: taluka || '',
            source: source || '',
            model: model || '',
            vehicle_type: vehicleType || '',
            budget: budget || '',
            status: status || 'New',
            salesperson_id: salespersonId || '',
            delivery_date: deliveryDate || '',
            remarks: remarks || '',
        });

        // If status is Delivered, auto-create services
        if (prospect.status === 'Delivered') {
            await autoCreateServices(prospect);
        }

        res.status(201).json(prospect);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update prospect
router.put('/:id', async (req, res) => {
    try {
        const {
            firstName, lastName, mobile, email, address, city, taluka,
            source, model, vehicleType, budget, status, salespersonId,
            deliveryDate, remarks
        } = req.body;

        const existing = await Prospect.findById(req.params.id);
        if (!existing) {
            return res.status(404).json({ error: 'Prospect not found' });
        }

        const previousStatus = existing.status;

        // Build update object (only include provided fields)
        const updateData = {};
        if (firstName !== undefined) updateData.first_name = firstName;
        if (lastName !== undefined) updateData.last_name = lastName;
        if (mobile !== undefined) updateData.mobile = mobile;
        if (email !== undefined) updateData.email = email;
        if (address !== undefined) updateData.address = address;
        if (city !== undefined) updateData.city = city;
        if (taluka !== undefined) updateData.taluka = taluka;
        if (source !== undefined) updateData.source = source;
        if (model !== undefined) updateData.model = model;
        if (vehicleType !== undefined) updateData.vehicle_type = vehicleType;
        if (budget !== undefined) updateData.budget = budget;
        if (status !== undefined) updateData.status = status;
        if (salespersonId !== undefined) updateData.salesperson_id = salespersonId;
        if (deliveryDate !== undefined) updateData.delivery_date = deliveryDate;
        if (remarks !== undefined) updateData.remarks = remarks;

        const prospect = await Prospect.findByIdAndUpdate(req.params.id, updateData, { new: true });

        // If status changed to Delivered, auto-create service records
        if (status === 'Delivered' && previousStatus !== 'Delivered') {
            await autoCreateServices(prospect);
        }

        res.json(prospect);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete prospect (cascade delete follow-ups and services)
router.delete('/:id', async (req, res) => {
    try {
        const prospect = await Prospect.findById(req.params.id);
        if (!prospect) {
            return res.status(404).json({ error: 'Prospect not found' });
        }

        // Cascade delete
        const FollowUp = require('../models/FollowUp.cjs');
        await FollowUp.deleteMany({ prospect_id: req.params.id });
        await Service.deleteMany({ prospect_id: req.params.id });
        await Prospect.findByIdAndDelete(req.params.id);

        res.json({ message: 'Prospect deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
