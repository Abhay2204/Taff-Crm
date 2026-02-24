const express = require('express');
const Prospect = require('../models/Prospect.cjs');
const FollowUp = require('../models/FollowUp.cjs');
const Service = require('../models/Service.cjs');
const User = require('../models/User.cjs');

const router = express.Router();

// Get dashboard stats
router.get('/stats', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    const [
      totalProspects,
      byStatus,
      conversions,
      delivered,
      pendingFollowUps,
      todayFollowUps,
      overdueFollowUps,
      todayServicesCount,
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

    // This month vs last month
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

    // Format byStatus to match old format
    const formattedByStatus = byStatus.map(s => ({ status: s._id, count: s.count }));

    res.json({
      totalProspects,
      conversions,
      delivered,
      pendingFollowUps,
      todayFollowUps,
      overdueFollowUps,
      todayServicesCount,
      byStatus: formattedByStatus,
      thisMonthProspects,
      percentChange
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Recent prospects
router.get('/recent-prospects', async (req, res) => {
  try {
    const prospects = await Prospect.find()
      .select('ref_no first_name last_name status source salesperson_id created_at')
      .sort({ created_at: -1 })
      .limit(10);

    // Populate salesperson names
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

// Today's scheduled follow-ups
router.get('/today-followups', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    const followUps = await FollowUp.find({ follow_up_date: today })
      .select('follow_up_type follow_up_time status prospect_id')
      .sort({ follow_up_time: 1 })
      .limit(10);

    // Populate prospect info
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

// Upcoming services (for dashboard section)
router.get('/upcoming-services', async (req, res) => {
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

module.exports = router;
