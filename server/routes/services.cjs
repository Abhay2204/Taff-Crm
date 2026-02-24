const express = require('express');
const Service = require('../models/Service.cjs');
const Prospect = require('../models/Prospect.cjs');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// Helper: Generate 4 service milestones from delivery date
function generateServiceMilestones(deliveryDate) {
    const milestones = [
        { month: '1st Month', offset: 1 },
        { month: '4th Month', offset: 4 },
        { month: '7th Month', offset: 7 },
        { month: '12th Month', offset: 12 },
    ];

    return milestones.map(m => {
        const date = new Date(deliveryDate);
        date.setMonth(date.getMonth() + m.offset);
        return {
            service_month: m.month,
            service_date: date.toISOString().split('T')[0],
        };
    });
}

// Auto-create service records when a vehicle is delivered
router.post('/auto-generate', async (req, res) => {
    try {
        const { prospectId } = req.body;
        if (!prospectId) {
            return res.status(400).json({ error: 'Prospect ID is required' });
        }

        const prospect = await Prospect.findById(prospectId);
        if (!prospect) {
            return res.status(404).json({ error: 'Prospect not found' });
        }

        if (prospect.status !== 'Delivered') {
            return res.status(400).json({ error: 'Prospect must have Delivered status' });
        }

        const deliveryDate = prospect.delivery_date || new Date().toISOString().split('T')[0];
        const customerName = `${prospect.first_name} ${prospect.last_name || ''}`.trim();

        // Check if services already exist
        const existingCount = await Service.countDocuments({ prospect_id: prospectId });
        if (existingCount > 0) {
            return res.status(400).json({ error: 'Service records already exist for this vehicle' });
        }

        const milestones = generateServiceMilestones(deliveryDate);
        const services = milestones.map(m => ({
            prospect_id: prospectId,
            vehicle_model: prospect.model || '',
            customer_name: customerName,
            customer_mobile: prospect.mobile,
            taluka: prospect.taluka || prospect.city || '',
            delivery_date: deliveryDate,
            service_month: m.service_month,
            service_date: m.service_date,
            status: 'Pending',
        }));

        const createdServices = await Service.insertMany(services);
        res.status(201).json({ message: 'Service records created', services: createdServices });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get all services with filters
router.get('/', async (req, res) => {
    try {
        const { status, taluka, serviceMonth, fromDate, toDate, search, page = 1, limit = 20 } = req.query;

        const filter = {};
        if (status) filter.status = status;
        if (taluka) filter.taluka = taluka;
        if (serviceMonth) filter.service_month = serviceMonth;
        if (fromDate && toDate) {
            filter.service_date = { $gte: fromDate, $lte: toDate };
        } else if (fromDate) {
            filter.service_date = { $gte: fromDate };
        } else if (toDate) {
            filter.service_date = { $lte: toDate };
        }
        if (search) {
            filter.$or = [
                { customer_name: { $regex: search, $options: 'i' } },
                { customer_mobile: { $regex: search, $options: 'i' } },
                { vehicle_model: { $regex: search, $options: 'i' } },
            ];
        }

        const total = await Service.countDocuments(filter);
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const services = await Service.find(filter)
            .sort({ service_date: 1 })
            .skip(skip)
            .limit(parseInt(limit));

        res.json({
            data: services,
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

// Get today's services (for notification badge)
router.get('/today', async (req, res) => {
    try {
        const today = new Date().toISOString().split('T')[0];
        const services = await Service.find({ service_date: today, status: 'Pending' })
            .sort({ service_month: 1 });
        res.json(services);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get today's services count (for badge)
router.get('/today-count', async (req, res) => {
    try {
        const today = new Date().toISOString().split('T')[0];
        const count = await Service.countDocuments({ service_date: today, status: 'Pending' });
        res.json({ count });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get upcoming services (next 10)
router.get('/upcoming', async (req, res) => {
    try {
        const today = new Date().toISOString().split('T')[0];
        const services = await Service.find({
            service_date: { $gte: today },
            status: 'Pending'
        })
            .sort({ service_date: 1 })
            .limit(10);
        res.json(services);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get single service
router.get('/:id', async (req, res) => {
    try {
        const service = await Service.findById(req.params.id);
        if (!service) {
            return res.status(404).json({ error: 'Service not found' });
        }
        res.json(service);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update service (editable dates, status, remarks)
router.put('/:id', async (req, res) => {
    try {
        const { serviceDate, status, remarks } = req.body;

        const updateData = {};
        if (serviceDate !== undefined) updateData.service_date = serviceDate;
        if (status !== undefined) updateData.status = status;
        if (remarks !== undefined) updateData.remarks = remarks;

        const service = await Service.findByIdAndUpdate(req.params.id, updateData, { new: true });
        if (!service) {
            return res.status(404).json({ error: 'Service not found' });
        }

        res.json(service);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete service
router.delete('/:id', async (req, res) => {
    try {
        const result = await Service.findByIdAndDelete(req.params.id);
        if (!result) {
            return res.status(404).json({ error: 'Service not found' });
        }
        res.json({ message: 'Service deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
