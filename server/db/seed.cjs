const db = require('./index.cjs');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

function seed() {
    console.log('🌱 Seeding database...');

    // Create sample users (salespersons)
    const users = [
        { id: uuidv4(), email: 'admin@crmpro.com', password: bcrypt.hashSync('admin123', 10), name: 'Admin User', role: 'admin' },
        { id: uuidv4(), email: 'rahul@crmpro.com', password: bcrypt.hashSync('password', 10), name: 'Rahul Sharma', role: 'salesperson' },
        { id: uuidv4(), email: 'priya@crmpro.com', password: bcrypt.hashSync('password', 10), name: 'Priya Patel', role: 'salesperson' },
        { id: uuidv4(), email: 'amit@crmpro.com', password: bcrypt.hashSync('password', 10), name: 'Amit Kumar', role: 'salesperson' },
        { id: uuidv4(), email: 'sneha@crmpro.com', password: bcrypt.hashSync('password', 10), name: 'Sneha Reddy', role: 'salesperson' },
    ];

    const insertUser = db.prepare(`
    INSERT OR IGNORE INTO users (id, email, password, name, role) VALUES (?, ?, ?, ?, ?)
  `);

    for (const user of users) {
        insertUser.run(user.id, user.email, user.password, user.name, user.role);
    }

    // Get user IDs for foreign keys
    const userIds = db.prepare('SELECT id, name FROM users').all();
    const getSalesperson = (name) => userIds.find(u => u.name === name)?.id;

    // Create sample prospects
    const prospects = [
        { firstName: 'John', lastName: 'Smith', mobile: '9876543210', email: 'john@email.com', source: 'Website', status: 'New', city: 'Mumbai', vehicleType: 'SUV', salesperson: 'Rahul Sharma' },
        { firstName: 'Sarah', lastName: 'Johnson', mobile: '9876543211', email: 'sarah@email.com', source: 'Referral', status: 'Contacted', city: 'Delhi', vehicleType: 'Sedan', salesperson: 'Priya Patel' },
        { firstName: 'Mike', lastName: 'Chen', mobile: '9876543212', email: 'mike@email.com', source: 'Walk-in', status: 'Follow Up', city: 'Bangalore', vehicleType: 'Hatchback', salesperson: 'Amit Kumar' },
        { firstName: 'Emily', lastName: 'Davis', mobile: '9876543213', email: 'emily@email.com', source: 'Phone', status: 'Qualified', city: 'Chennai', vehicleType: 'Luxury', salesperson: 'Sneha Reddy' },
        { firstName: 'Robert', lastName: 'Wilson', mobile: '9876543214', email: 'robert@email.com', source: 'Email', status: 'New', city: 'Pune', vehicleType: 'SUV', salesperson: 'Rahul Sharma' },
        { firstName: 'Lisa', lastName: 'Brown', mobile: '9876543215', email: 'lisa@email.com', source: 'Exhibition', status: 'Converted', city: 'Hyderabad', vehicleType: 'Sedan', salesperson: 'Priya Patel' },
        { firstName: 'James', lastName: 'Taylor', mobile: '9876543216', email: 'james@email.com', source: 'Social', status: 'Lost', city: 'Kolkata', vehicleType: 'Hatchback', salesperson: 'Amit Kumar' },
        { firstName: 'Maria', lastName: 'Garcia', mobile: '9876543217', email: 'maria@email.com', source: 'Website', status: 'New', city: 'Ahmedabad', vehicleType: 'SUV', salesperson: 'Sneha Reddy' },
    ];

    const insertProspect = db.prepare(`
    INSERT OR IGNORE INTO prospects (id, ref_no, first_name, last_name, mobile, email, source, status, city, vehicle_type, salesperson_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

    let refCounter = 1;
    const prospectIds = [];
    for (const p of prospects) {
        const id = uuidv4();
        const refNo = `PRO-${String(refCounter++).padStart(3, '0')}`;
        insertProspect.run(id, refNo, p.firstName, p.lastName, p.mobile, p.email, p.source, p.status, p.city, p.vehicleType, getSalesperson(p.salesperson));
        prospectIds.push(id);
    }

    // Create sample follow-ups
    const insertFollowUp = db.prepare(`
    INSERT INTO follow_ups (id, prospect_id, follow_up_type, follow_up_date, follow_up_time, status, outcome, remarks, created_by)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

    const followUps = [
        { prospectIdx: 0, type: 'Phone Call', date: '2026-02-02', time: '10:00', status: 'Completed', outcome: 'Interested', remarks: 'Discussed pricing', salesperson: 'Rahul Sharma' },
        { prospectIdx: 1, type: 'Meeting', date: '2026-02-02', time: '14:30', status: 'Pending', outcome: 'Callback', remarks: 'Scheduled demo', salesperson: 'Priya Patel' },
        { prospectIdx: 2, type: 'Email', date: '2026-02-01', time: '11:00', status: 'Completed', outcome: 'Interested', remarks: 'Sent brochure', salesperson: 'Amit Kumar' },
        { prospectIdx: 3, type: 'Phone Call', date: '2026-02-01', time: '16:00', status: 'Overdue', outcome: 'Not Interested', remarks: 'No response', salesperson: 'Sneha Reddy' },
        { prospectIdx: 4, type: 'WhatsApp', date: '2026-01-31', time: '09:30', status: 'Completed', outcome: 'Callback', remarks: 'Quote sent', salesperson: 'Rahul Sharma' },
    ];

    for (const f of followUps) {
        insertFollowUp.run(uuidv4(), prospectIds[f.prospectIdx], f.type, f.date, f.time, f.status, f.outcome, f.remarks, getSalesperson(f.salesperson));
    }

    console.log('✅ Database seeded successfully!');
}

seed();
