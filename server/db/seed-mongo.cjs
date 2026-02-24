require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const { connectDB } = require('./mongodb.cjs');
const User = require('../models/User.cjs');
const Prospect = require('../models/Prospect.cjs');
const FollowUp = require('../models/FollowUp.cjs');
const Service = require('../models/Service.cjs');

async function seed() {
    try {
        await connectDB();
        console.log('🌱 Starting MongoDB seed...');

        // Check if data already exists
        const userCount = await User.countDocuments();
        if (userCount > 0) {
            console.log('⚠️  Database already has data. Skipping seed.');
            console.log(`   Users: ${userCount}`);
            console.log(`   Prospects: ${await Prospect.countDocuments()}`);
            console.log(`   Follow-ups: ${await FollowUp.countDocuments()}`);
            console.log(`   Services: ${await Service.countDocuments()}`);
            process.exit(0);
        }

        // Create admin user
        const adminId = uuidv4();
        const salespersonId = uuidv4();

        await User.create([
            {
                _id: adminId,
                email: 'admin@taff.com',
                password: bcrypt.hashSync('admin@123', 10),
                name: 'Admin Sales',
                role: 'admin',
            },
            {
                _id: salespersonId,
                email: 'sales@taff.com',
                password: bcrypt.hashSync('sales@123', 10),
                name: 'Rahul Sharma',
                role: 'salesperson',
            }
        ]);
        console.log('✅ Users created');

        // Create sample prospects
        const prospects = [
            {
                first_name: 'Rajesh', last_name: 'Patil', mobile: '9876543210',
                email: 'rajesh@example.com', city: 'Chandrapur', taluka: 'Chandrapur',
                source: 'Walk in', model: 'Thar', status: 'New',
                salesperson_id: salespersonId, remarks: 'Interested in test drive'
            },
            {
                first_name: 'Suresh', last_name: 'Deshmukh', mobile: '9876543211',
                city: 'Warora', taluka: 'Warora',
                source: 'Phone', model: 'Scorpio N', status: 'Follow Up',
                salesperson_id: salespersonId, remarks: 'Budget discussion pending'
            },
            {
                first_name: 'Amit', last_name: 'Wankhede', mobile: '9876543212',
                city: 'Mul', taluka: 'Mul',
                source: 'Visited', model: 'XUV700', status: 'Contacted',
                salesperson_id: adminId
            },
            {
                first_name: 'Priya', last_name: 'Meshram', mobile: '9876543213',
                city: 'Bramhapuri', taluka: 'Bramhapuri',
                source: 'Walk in', model: 'Bolero Neo', status: 'Converted',
                salesperson_id: salespersonId
            },
            {
                first_name: 'Vikas', last_name: 'Gadge', mobile: '9876543214',
                city: 'Chimur', taluka: 'Chimur',
                source: 'Phone', model: 'XUV 3XO', status: 'Delivered',
                salesperson_id: adminId,
                delivery_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
            },
            {
                first_name: 'Manoj', last_name: 'Bawane', mobile: '9876543215',
                city: 'Nagbhid', taluka: 'Nagbhid',
                source: 'Visited', model: 'Thar ROXX', status: 'New',
                salesperson_id: salespersonId
            },
            {
                first_name: 'Sunita', last_name: 'Kale', mobile: '9876543216',
                city: 'Rajura', taluka: 'Rajura',
                source: 'Walk in', model: 'Scorpio Classic', status: 'Lost',
                salesperson_id: adminId
            },
            {
                first_name: 'Deepak', last_name: 'Thakre', mobile: '9876543217',
                city: 'Gondpipri', taluka: 'Gondpipri',
                source: 'Phone', model: 'Bolero', status: 'Qualified',
                salesperson_id: salespersonId
            },
        ];
        // Assign explicit ref_nos to avoid pre-save hook conflicts
        prospects.forEach((p, i) => {
            p.ref_no = `PRO-${String(i + 1).padStart(4, '0')}`;
        });

        const createdProspects = [];
        for (const p of prospects) {
            const created = await Prospect.create(p);
            createdProspects.push(created);
        }
        console.log(`✅ ${createdProspects.length} prospects created`);

        // Create sample follow-ups
        const today = new Date().toISOString().split('T')[0];
        const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];

        const followUps = [
            {
                prospect_id: createdProspects[0]._id,
                follow_up_type: 'Call',
                follow_up_date: today,
                follow_up_time: '10:00',
                status: 'Pending',
                remarks: 'Discuss test drive schedule',
                created_by: salespersonId,
            },
            {
                prospect_id: createdProspects[1]._id,
                follow_up_type: 'Visit',
                follow_up_date: tomorrow,
                follow_up_time: '14:00',
                status: 'Pending',
                remarks: 'Show new variant',
                created_by: salespersonId,
            },
            {
                prospect_id: createdProspects[2]._id,
                follow_up_type: 'Call',
                follow_up_date: yesterday,
                follow_up_time: '11:00',
                status: 'Pending',
                remarks: 'Follow up on pricing enquiry',
                created_by: adminId,
            },
        ];

        await FollowUp.create(followUps);
        console.log(`✅ ${followUps.length} follow-ups created`);

        // Auto-generate services for the delivered prospect
        const deliveredProspect = createdProspects.find(p => p.status === 'Delivered');
        if (deliveredProspect) {
            const deliveryDate = deliveredProspect.delivery_date || today;
            const customerName = `${deliveredProspect.first_name} ${deliveredProspect.last_name}`.trim();

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
                    prospect_id: deliveredProspect._id,
                    vehicle_model: deliveredProspect.model,
                    customer_name: customerName,
                    customer_mobile: deliveredProspect.mobile,
                    taluka: deliveredProspect.taluka,
                    delivery_date: deliveryDate,
                    service_month: m.month,
                    service_date: date.toISOString().split('T')[0],
                    status: 'Pending',
                };
            });

            await Service.create(services);
            console.log('✅ Service records created for delivered vehicle');
        }

        console.log('\n🎉 Seed complete!');
        console.log('   Login: admin@taff.com / admin@123');
        process.exit(0);
    } catch (error) {
        console.error('❌ Seed error:', error.message);
        process.exit(1);
    }
}

seed();
