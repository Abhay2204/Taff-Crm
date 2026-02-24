const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

// ─── Environment Setup ──────────────────────────────────────────────────────
// In local dev, load .env from project root
if (process.env.NODE_ENV !== 'production') {
    try {
        const path = require('path');
        require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
    } catch (e) {
        // dotenv not available, skip
    }
}

// ─── MongoDB Connection ─────────────────────────────────────────────────────
let isConnected = false;

async function connectDB() {
    if (isConnected && mongoose.connection.readyState === 1) {
        return;
    }

    const uri = process.env.MONGODB_URI;
    if (!uri) {
        throw new Error('MONGODB_URI environment variable is required. Set it in Vercel Project Settings > Environment Variables.');
    }

    try {
        await mongoose.connect(uri, {
            dbName: 'taff-crm',
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        });
        isConnected = true;
        console.log('✅ Connected to MongoDB Atlas');
    } catch (error) {
        console.error('❌ MongoDB connection error:', error.message);
        isConnected = false;
        throw error;
    }
}

// ─── Mongoose Models ────────────────────────────────────────────────────────

// User Model
const UserSchema = new mongoose.Schema({
    _id: { type: String, default: () => uuidv4() },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    role: { type: String, default: 'salesperson', enum: ['admin', 'salesperson', 'manager'] },
}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    toJSON: {
        virtuals: true,
        transform: (doc, ret) => {
            ret.id = ret._id;
            delete ret.__v;
            delete ret.password;
            return ret;
        }
    },
    toObject: { virtuals: true }
});
const User = mongoose.models.User || mongoose.model('User', UserSchema);

// Prospect Model
const ProspectSchema = new mongoose.Schema({
    _id: { type: String, default: () => uuidv4() },
    ref_no: { type: String, unique: true },
    first_name: { type: String, required: true, trim: true },
    last_name: { type: String, default: '', trim: true },
    mobile: { type: String, required: true, trim: true },
    email: { type: String, default: '', trim: true },
    address: { type: String, default: '' },
    city: { type: String, default: '', trim: true },
    taluka: { type: String, default: '', trim: true },
    source: { type: String, default: '' },
    model: { type: String, default: '' },
    vehicle_type: { type: String, default: '' },
    budget: { type: String, default: '' },
    status: {
        type: String,
        default: 'New',
        enum: ['New', 'Contacted', 'Follow Up', 'Qualified', 'Converted', 'Delivered', 'Lost']
    },
    salesperson_id: { type: String, default: '', ref: 'User' },
    delivery_date: { type: String, default: '' },
    remarks: { type: String, default: '' },
}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    toJSON: {
        virtuals: true,
        transform: (doc, ret) => {
            ret.id = ret._id;
            delete ret.__v;
            return ret;
        }
    },
    toObject: { virtuals: true }
});
ProspectSchema.pre('save', async function () {
    if (!this.ref_no) {
        const count = await mongoose.model('Prospect').countDocuments();
        this.ref_no = `PRO-${String(count + 1).padStart(4, '0')}`;
    }
});
ProspectSchema.index({ status: 1 });
ProspectSchema.index({ taluka: 1 });
ProspectSchema.index({ salesperson_id: 1 });
ProspectSchema.index({ created_at: -1 });
const Prospect = mongoose.models.Prospect || mongoose.model('Prospect', ProspectSchema);

// FollowUp Model
const FollowUpSchema = new mongoose.Schema({
    _id: { type: String, default: () => uuidv4() },
    prospect_id: { type: String, required: true, ref: 'Prospect' },
    follow_up_type: { type: String, required: true },
    follow_up_date: { type: String, required: true },
    follow_up_time: { type: String, default: '' },
    status: { type: String, default: 'Pending', enum: ['Pending', 'Completed', 'Overdue', 'Cancelled'] },
    outcome: { type: String, default: '' },
    next_follow_up_date: { type: String, default: '' },
    remarks: { type: String, default: '' },
    created_by: { type: String, default: '', ref: 'User' },
}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    toJSON: {
        virtuals: true,
        transform: (doc, ret) => {
            ret.id = ret._id;
            delete ret.__v;
            return ret;
        }
    },
    toObject: { virtuals: true }
});
FollowUpSchema.index({ prospect_id: 1 });
FollowUpSchema.index({ follow_up_date: 1, status: 1 });
const FollowUp = mongoose.models.FollowUp || mongoose.model('FollowUp', FollowUpSchema);

// Service Model
const ServiceSchema = new mongoose.Schema({
    _id: { type: String, default: () => uuidv4() },
    prospect_id: { type: String, required: true, ref: 'Prospect' },
    vehicle_model: { type: String, default: '' },
    customer_name: { type: String, required: true },
    customer_mobile: { type: String, default: '' },
    taluka: { type: String, default: '' },
    delivery_date: { type: String, required: true },
    service_month: { type: String, required: true, enum: ['1st Month', '4th Month', '7th Month', '12th Month'] },
    service_date: { type: String, required: true },
    status: { type: String, default: 'Pending', enum: ['Pending', 'Completed', 'Cancelled'] },
    remarks: { type: String, default: '' },
}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    toJSON: {
        virtuals: true,
        transform: (doc, ret) => {
            ret.id = ret._id;
            delete ret.__v;
            return ret;
        }
    },
    toObject: { virtuals: true }
});
ServiceSchema.index({ service_date: 1, status: 1 });
ServiceSchema.index({ prospect_id: 1 });
ServiceSchema.index({ taluka: 1 });
const Service = mongoose.models.Service || mongoose.model('Service', ServiceSchema);

// ─── Middleware: Auth ────────────────────────────────────────────────────────
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid or expired token' });
        }
        req.user = user;
        next();
    });
}

// ─── Helper Functions ────────────────────────────────────────────────────────
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

// ─── Express App ─────────────────────────────────────────────────────────────
const app = express();

// Middleware
app.use(cors({
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        callback(null, true); // Allow all origins
    },
    credentials: true
}));
app.use(express.json());

// Connect to MongoDB before handling any request
app.use(async (req, res, next) => {
    try {
        await connectDB();
        next();
    } catch (error) {
        console.error('DB connection failed:', error.message);
        res.status(500).json({ error: 'Database connection failed', message: error.message });
    }
});

// ─── Auth Routes ─────────────────────────────────────────────────────────────
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        const user = await User.findOne({ email }).select('+password');
        if (!user || !bcrypt.compareSync(password, user.password)) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const token = jwt.sign(
            { id: user._id, email: user.email, name: user.name, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            token,
            user: { id: user._id, email: user.email, name: user.name, role: user.role }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/auth/register', async (req, res) => {
    try {
        const { email, password, name, role = 'salesperson' } = req.body;
        if (!email || !password || !name) {
            return res.status(400).json({ error: 'Email, password, and name are required' });
        }

        const existing = await User.findOne({ email });
        if (existing) {
            return res.status(400).json({ error: 'Email already registered' });
        }

        const hashedPassword = bcrypt.hashSync(password, 10);
        const user = await User.create({ email, password: hashedPassword, name, role });

        const token = jwt.sign(
            { id: user._id, email: user.email, name: user.name, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(201).json({
            token,
            user: { id: user._id, email: user.email, name: user.name, role: user.role }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/auth/me', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/auth/users', async (req, res) => {
    try {
        const users = await User.find().select('name email role').sort({ name: 1 });
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ─── Prospect Routes ─────────────────────────────────────────────────────────
app.get('/api/prospects', async (req, res) => {
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

app.get('/api/prospects/:id', async (req, res) => {
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

app.post('/api/prospects', async (req, res) => {
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

        if (prospect.status === 'Delivered') {
            await autoCreateServices(prospect);
        }

        res.status(201).json(prospect);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/api/prospects/:id', async (req, res) => {
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

        if (status === 'Delivered' && previousStatus !== 'Delivered') {
            await autoCreateServices(prospect);
        }

        res.json(prospect);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/prospects/:id', async (req, res) => {
    try {
        const prospect = await Prospect.findById(req.params.id);
        if (!prospect) {
            return res.status(404).json({ error: 'Prospect not found' });
        }

        await FollowUp.deleteMany({ prospect_id: req.params.id });
        await Service.deleteMany({ prospect_id: req.params.id });
        await Prospect.findByIdAndDelete(req.params.id);

        res.json({ message: 'Prospect deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ─── FollowUp Routes ─────────────────────────────────────────────────────────
app.get('/api/followups', async (req, res) => {
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

app.get('/api/followups/today', async (req, res) => {
    try {
        const today = new Date().toISOString().split('T')[0];
        const followUps = await FollowUp.find({
            follow_up_date: today,
            status: { $ne: 'Completed' }
        }).sort({ follow_up_time: 1 });

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

app.get('/api/followups/:id', async (req, res) => {
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

app.post('/api/followups', async (req, res) => {
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

app.put('/api/followups/:id', async (req, res) => {
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

app.delete('/api/followups/:id', async (req, res) => {
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

// ─── Dashboard Routes ────────────────────────────────────────────────────────
app.get('/api/dashboard/stats', async (req, res) => {
    try {
        const today = new Date().toISOString().split('T')[0];

        const [
            totalProspects, byStatus, conversions, delivered,
            pendingFollowUps, todayFollowUps, overdueFollowUps, todayServicesCount,
        ] = await Promise.all([
            Prospect.countDocuments(),
            Prospect.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
            Prospect.countDocuments({ status: 'Converted' }),
            Prospect.countDocuments({ status: 'Delivered' }),
            FollowUp.countDocuments({ status: { $in: ['Pending', 'Overdue'] } }),
            FollowUp.countDocuments({ follow_up_date: today }),
            FollowUp.countDocuments({ follow_up_date: { $lt: today }, status: 'Pending' }),
            Service.countDocuments({ service_date: today, status: 'Pending' }),
        ]);

        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
        const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();
        const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59).toISOString();

        const [thisMonthProspects, lastMonthProspects] = await Promise.all([
            Prospect.countDocuments({ created_at: { $gte: startOfMonth } }),
            Prospect.countDocuments({ created_at: { $gte: startOfLastMonth, $lte: endOfLastMonth } }),
        ]);

        const percentChange = lastMonthProspects > 0
            ? Math.round(((thisMonthProspects - lastMonthProspects) / lastMonthProspects) * 100)
            : 100;

        const formattedByStatus = byStatus.map(s => ({ status: s._id, count: s.count }));

        res.json({
            totalProspects, conversions, delivered,
            pendingFollowUps, todayFollowUps, overdueFollowUps, todayServicesCount,
            byStatus: formattedByStatus, thisMonthProspects, percentChange
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/dashboard/recent-prospects', async (req, res) => {
    try {
        const prospects = await Prospect.find()
            .select('ref_no first_name last_name status source salesperson_id created_at')
            .sort({ created_at: -1 })
            .limit(10);

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

        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/dashboard/today-followups', async (req, res) => {
    try {
        const today = new Date().toISOString().split('T')[0];
        const followUps = await FollowUp.find({ follow_up_date: today })
            .select('follow_up_type follow_up_time status prospect_id')
            .sort({ follow_up_time: 1 })
            .limit(10);

        const prospectIds = followUps.map(f => f.prospect_id).filter(Boolean);
        const prospects = prospectIds.length > 0
            ? await Prospect.find({ _id: { $in: prospectIds } }).select('first_name last_name mobile')
            : [];
        const prospectMap = {};
        prospects.forEach(p => { prospectMap[p._id] = p; });

        const data = followUps.map(f => {
            const obj = f.toJSON();
            const prospect = prospectMap[obj.prospect_id] || {};
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

app.get('/api/dashboard/upcoming-services', async (req, res) => {
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

// ─── Service Routes ──────────────────────────────────────────────────────────
app.post('/api/services/auto-generate', async (req, res) => {
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

app.get('/api/services', async (req, res) => {
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

app.get('/api/services/today', async (req, res) => {
    try {
        const today = new Date().toISOString().split('T')[0];
        const services = await Service.find({ service_date: today, status: 'Pending' })
            .sort({ service_month: 1 });
        res.json(services);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/services/today-count', async (req, res) => {
    try {
        const today = new Date().toISOString().split('T')[0];
        const count = await Service.countDocuments({ service_date: today, status: 'Pending' });
        res.json({ count });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/services/upcoming', async (req, res) => {
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

app.get('/api/services/:id', async (req, res) => {
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

app.put('/api/services/:id', async (req, res) => {
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

app.delete('/api/services/:id', async (req, res) => {
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

// ─── Health Check ────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString(), db: 'mongodb' });
});

// ─── Error Handling ──────────────────────────────────────────────────────────
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// ─── Local Dev Server ────────────────────────────────────────────────────────
// When running locally with: node api/index.js
if (require.main === module) {
    const PORT = process.env.PORT || 3001;
    app.listen(PORT, () => {
        console.log(`🚀 CRM API Server running on http://localhost:${PORT}`);
        console.log(`📊 API endpoints available at http://localhost:${PORT}/api`);
        console.log(`🗄️  Database: MongoDB Atlas`);
    });
}

// Export for Vercel serverless
module.exports = app;
