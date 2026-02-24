/**
 * Local Data Store
 * Pure-frontend mock store using localStorage for persistence.
 * Replace these methods with real API calls when the backend is ready.
 */

const KEYS = {
    PROSPECTS: 'crm_prospects',
    FOLLOWUPS: 'crm_followups',
    SERVICES: 'crm_services',
    STAFF: 'crm_staff',
    SEEDED: 'crm_seeded_v1',
};

// ── helpers ──────────────────────────────────────────────────────────────────
const d = (offsetDays = 0) => {
    const dt = new Date();
    dt.setDate(dt.getDate() + offsetDays);
    return dt.toISOString().split('T')[0];
};

const TODAY = d(0);
const YESTERDAY = d(-1);
const TOMORROW = d(1);
const IN3 = d(3);
const IN7 = d(7);
const IN30 = d(30);
const IN90 = d(90);
const IN180 = d(180);
const IN365 = d(365);
const PAST30 = d(-30);
const PAST60 = d(-60);
const PAST90 = d(-90);

// ── seed data ─────────────────────────────────────────────────────────────────
const SEED_PROSPECTS = [
    { id: 'p1', refNo: 'PRO-001', first_name: 'Rajesh', last_name: 'Kumar', mobile: '9876543210', email: 'rajesh@email.com', address: 'Near Market', city: 'Chandrapur', taluka: 'Chandrapur', source: 'Walk in', model: 'TAFE 45 DI', budget: '₹6L – ₹8L', salesperson_name: 'Rahul Sharma', status: 'New', remarks: '', created_at: `${d(-4)}T10:00:00Z` },
    { id: 'p2', refNo: 'PRO-002', first_name: 'Suresh', last_name: 'Patil', mobile: '9876543211', email: '', address: 'Village Mul', city: 'Mul', taluka: 'Mul', source: 'Phone', model: 'TAFE 55 DI', budget: '₹7L – ₹9L', salesperson_name: 'Priya Patel', status: 'Contacted', remarks: 'Need financing', created_at: `${d(-5)}T09:00:00Z` },
    { id: 'p3', refNo: 'PRO-003', first_name: 'Anil', last_name: 'Meshram', mobile: '9876543212', email: 'anil@email.com', address: 'Bramhapuri Road', city: 'Bramhapuri', taluka: 'Bramhapuri', source: 'Visited', model: 'TAFE 45 DI', budget: '₹5L – ₹7L', salesperson_name: 'Amit Kumar', status: 'Follow Up', remarks: 'Interested', created_at: `${d(-6)}T11:00:00Z` },
    { id: 'p4', refNo: 'PRO-004', first_name: 'Vijay', last_name: 'Dongre', mobile: '9876543213', email: '', address: 'Near Bus Stand', city: 'Warora', taluka: 'Warora', source: 'Walk in', model: 'TAFE 9000 DI', budget: '₹9L – ₹11L', salesperson_name: 'Sneha Reddy', status: 'Qualified', remarks: 'Requested test drive', created_at: `${d(-7)}T14:00:00Z` },
    { id: 'p5', refNo: 'PRO-005', first_name: 'Ramesh', last_name: 'Thakre', mobile: '9876543214', email: '', address: 'Bhadravati Colony', city: 'Bhadravati', taluka: 'Bhadravati', source: 'Phone', model: 'TAFE 55 DI', budget: '₹7L – ₹8L', salesperson_name: 'Rahul Sharma', status: 'New', remarks: '', created_at: `${d(-8)}T10:00:00Z` },
    { id: 'p6', refNo: 'PRO-006', first_name: 'Ganesh', last_name: 'Wankhede', mobile: '9876543215', email: 'ganesh@email.com', address: 'Chimur', city: 'Chimur', taluka: 'Chimur', source: 'Walk in', model: 'TAFE 45 DI', budget: '₹6L', salesperson_name: 'Priya Patel', status: 'Converted', remarks: 'Booking done', created_at: `${d(-9)}T09:00:00Z` },
    { id: 'p7', refNo: 'PRO-007', first_name: 'Mohan', last_name: 'Nagpure', mobile: '9876543216', email: '', address: 'Nagbhid Road', city: 'Nagbhid', taluka: 'Nagbhid', source: 'Visited', model: 'TAFE 55 DI', budget: '₹7L – ₹9L', salesperson_name: 'Amit Kumar', status: 'Lost', remarks: 'Went to competitor', created_at: `${d(-10)}T15:00:00Z` },
    { id: 'p8', refNo: 'PRO-008', first_name: 'Sanjay', last_name: 'Bonde', mobile: '9876543217', email: '', address: 'Rajura', city: 'Rajura', taluka: 'Rajura', source: 'Phone', model: 'TAFE 45 DI', budget: '₹5L – ₹6L', salesperson_name: 'Sneha Reddy', status: 'New', remarks: '', created_at: `${d(-2)}T08:00:00Z` },
    { id: 'p9', refNo: 'PRO-009', first_name: 'Prakash', last_name: 'Hedau', mobile: '9876543218', email: '', address: 'Gondpipri', city: 'Gondpipri', taluka: 'Gondpipri', source: 'Walk in', model: 'TAFE 9000 DI', budget: '₹10L', salesperson_name: 'Rahul Sharma', status: 'Follow Up', remarks: 'Second visit', created_at: `${d(-3)}T11:00:00Z` },
    { id: 'p10', refNo: 'PRO-010', first_name: 'Kiran', last_name: 'Shende', mobile: '9876543219', email: '', address: 'Ballarpur', city: 'Ballarpur', taluka: 'Ballarpur', source: 'Visited', model: 'TAFE 45 DI', budget: '₹6L', salesperson_name: 'Priya Patel', status: 'Contacted', remarks: '', created_at: `${d(-1)}T10:00:00Z` },
    { id: 'p11', refNo: 'PRO-011', first_name: 'Santosh', last_name: 'Korpe', mobile: '9765432101', email: '', address: 'Saoli Road', city: 'Saoli', taluka: 'Saoli', source: 'Phone', model: 'TAFE 55 DI', budget: '₹8L', salesperson_name: 'Amit Kumar', status: 'Delivered', remarks: 'Vehicle delivered', created_at: `${d(-30)}T09:00:00Z` },
    { id: 'p12', refNo: 'PRO-012', first_name: 'Nilesh', last_name: 'Fulzele', mobile: '9765432102', email: '', address: 'Korpana', city: 'Korpana', taluka: 'Korpana', source: 'Walk in', model: 'TAFE 45 DI', budget: '₹6L', salesperson_name: 'Sneha Reddy', status: 'Delivered', remarks: 'Vehicle delivered', created_at: `${d(-45)}T08:00:00Z` },
];

const SEED_FOLLOWUPS = [
    { id: 'f1', prospect_id: 'p1', first_name: 'Rajesh', last_name: 'Kumar', follow_up_date: TODAY, follow_up_time: '10:00', follow_up_type: 'Phone Call', status: 'Pending', remarks: 'Follow up on pricing' },
    { id: 'f2', prospect_id: 'p2', first_name: 'Suresh', last_name: 'Patil', follow_up_date: TODAY, follow_up_time: '14:00', follow_up_type: 'Meeting', status: 'Pending', remarks: 'Test drive scheduled' },
    { id: 'f3', prospect_id: 'p3', first_name: 'Anil', last_name: 'Meshram', follow_up_date: TOMORROW, follow_up_time: '11:00', follow_up_type: 'Phone Call', status: 'Pending', remarks: 'Check on financing' },
    { id: 'f4', prospect_id: 'p9', first_name: 'Prakash', last_name: 'Hedau', follow_up_date: YESTERDAY, follow_up_time: '09:00', follow_up_type: 'Email', status: 'Overdue', remarks: 'Send brochure' },
    { id: 'f5', prospect_id: 'p5', first_name: 'Ramesh', last_name: 'Thakre', follow_up_date: IN3, follow_up_time: '15:00', follow_up_type: 'Meeting', status: 'Pending', remarks: 'Initial visit' },
    { id: 'f6', prospect_id: 'p10', first_name: 'Kiran', last_name: 'Shende', follow_up_date: YESTERDAY, follow_up_time: '16:00', follow_up_type: 'Phone Call', status: 'Overdue', remarks: 'Awaiting callback' },
    { id: 'f7', prospect_id: 'p4', first_name: 'Vijay', last_name: 'Dongre', follow_up_date: IN7, follow_up_time: '12:00', follow_up_type: 'WhatsApp', status: 'Pending', remarks: 'Send updated quote' },
    { id: 'f8', prospect_id: 'p8', first_name: 'Sanjay', last_name: 'Bonde', follow_up_date: TODAY, follow_up_time: '11:30', follow_up_type: 'Phone Call', status: 'Pending', remarks: 'First contact' },
];

const SEED_SERVICES = [
    // Ganesh Wankhede – Chimur
    { id: 's1', prospect_id: 'p6', customer_name: 'Ganesh Wankhede', customer_mobile: '9876543215', vehicle_model: 'TAFE 45 DI', taluka: 'Chimur', delivery_date: PAST90, service_month: '1st Month', service_date: d(-60), status: 'Completed' },
    { id: 's2', prospect_id: 'p6', customer_name: 'Ganesh Wankhede', customer_mobile: '9876543215', vehicle_model: 'TAFE 45 DI', taluka: 'Chimur', delivery_date: PAST90, service_month: '4th Month', service_date: IN30, status: 'Pending' },
    { id: 's3', prospect_id: 'p6', customer_name: 'Ganesh Wankhede', customer_mobile: '9876543215', vehicle_model: 'TAFE 45 DI', taluka: 'Chimur', delivery_date: PAST90, service_month: '7th Month', service_date: IN90, status: 'Pending' },
    { id: 's4', prospect_id: 'p6', customer_name: 'Ganesh Wankhede', customer_mobile: '9876543215', vehicle_model: 'TAFE 45 DI', taluka: 'Chimur', delivery_date: PAST90, service_month: '12th Month', service_date: IN180, status: 'Pending' },
    // Dinesh Kamble – Chandrapur (4th month service due today)
    { id: 's5', prospect_id: 'px1', customer_name: 'Dinesh Kamble', customer_mobile: '9765432100', vehicle_model: 'TAFE 55 DI', taluka: 'Chandrapur', delivery_date: PAST90, service_month: '1st Month', service_date: d(-60), status: 'Completed' },
    { id: 's6', prospect_id: 'px1', customer_name: 'Dinesh Kamble', customer_mobile: '9765432100', vehicle_model: 'TAFE 55 DI', taluka: 'Chandrapur', delivery_date: PAST90, service_month: '4th Month', service_date: TODAY, status: 'Pending' },
    { id: 's7', prospect_id: 'px1', customer_name: 'Dinesh Kamble', customer_mobile: '9765432100', vehicle_model: 'TAFE 55 DI', taluka: 'Chandrapur', delivery_date: PAST90, service_month: '7th Month', service_date: IN90, status: 'Pending' },
    { id: 's8', prospect_id: 'px1', customer_name: 'Dinesh Kamble', customer_mobile: '9765432100', vehicle_model: 'TAFE 55 DI', taluka: 'Chandrapur', delivery_date: PAST90, service_month: '12th Month', service_date: IN180, status: 'Pending' },
    // Santosh Raut – Warora (7th month service due tomorrow)
    { id: 's9', prospect_id: 'px2', customer_name: 'Santosh Raut', customer_mobile: '9898989898', vehicle_model: 'TAFE 9000 DI', taluka: 'Warora', delivery_date: PAST90, service_month: '1st Month', service_date: d(-80), status: 'Completed' },
    { id: 's10', prospect_id: 'px2', customer_name: 'Santosh Raut', customer_mobile: '9898989898', vehicle_model: 'TAFE 9000 DI', taluka: 'Warora', delivery_date: PAST90, service_month: '4th Month', service_date: d(-10), status: 'Completed' },
    { id: 's11', prospect_id: 'px2', customer_name: 'Santosh Raut', customer_mobile: '9898989898', vehicle_model: 'TAFE 9000 DI', taluka: 'Warora', delivery_date: PAST90, service_month: '7th Month', service_date: TOMORROW, status: 'Pending' },
    { id: 's12', prospect_id: 'px2', customer_name: 'Santosh Raut', customer_mobile: '9898989898', vehicle_model: 'TAFE 9000 DI', taluka: 'Warora', delivery_date: PAST90, service_month: '12th Month', service_date: IN365, status: 'Pending' },
    // Manoj Bhajbhuje – Mul (4th month OVERDUE)
    { id: 's13', prospect_id: 'px3', customer_name: 'Manoj Bhajbhuje', customer_mobile: '9911223344', vehicle_model: 'TAFE 45 DI', taluka: 'Mul', delivery_date: PAST90, service_month: '1st Month', service_date: d(-70), status: 'Completed' },
    { id: 's14', prospect_id: 'px3', customer_name: 'Manoj Bhajbhuje', customer_mobile: '9911223344', vehicle_model: 'TAFE 45 DI', taluka: 'Mul', delivery_date: PAST90, service_month: '4th Month', service_date: YESTERDAY, status: 'Pending' },
    { id: 's15', prospect_id: 'px3', customer_name: 'Manoj Bhajbhuje', customer_mobile: '9911223344', vehicle_model: 'TAFE 45 DI', taluka: 'Mul', delivery_date: PAST90, service_month: '7th Month', service_date: IN90, status: 'Pending' },
    { id: 's16', prospect_id: 'px3', customer_name: 'Manoj Bhajbhuje', customer_mobile: '9911223344', vehicle_model: 'TAFE 45 DI', taluka: 'Mul', delivery_date: PAST90, service_month: '12th Month', service_date: IN180, status: 'Pending' },
    // Pradip Shrirame – Bramhapuri (new, 1st month coming up in 7 days)
    { id: 's17', prospect_id: 'px4', customer_name: 'Pradip Shrirame', customer_mobile: '9922334455', vehicle_model: 'TAFE 55 DI', taluka: 'Bramhapuri', delivery_date: d(-20), service_month: '1st Month', service_date: IN7, status: 'Pending' },
    { id: 's18', prospect_id: 'px4', customer_name: 'Pradip Shrirame', customer_mobile: '9922334455', vehicle_model: 'TAFE 55 DI', taluka: 'Bramhapuri', delivery_date: d(-20), service_month: '4th Month', service_date: IN90, status: 'Pending' },
    { id: 's19', prospect_id: 'px4', customer_name: 'Pradip Shrirame', customer_mobile: '9922334455', vehicle_model: 'TAFE 55 DI', taluka: 'Bramhapuri', delivery_date: d(-20), service_month: '7th Month', service_date: IN180, status: 'Pending' },
    { id: 's20', prospect_id: 'px4', customer_name: 'Pradip Shrirame', customer_mobile: '9922334455', vehicle_model: 'TAFE 55 DI', taluka: 'Bramhapuri', delivery_date: d(-20), service_month: '12th Month', service_date: IN365, status: 'Pending' },
    // Santosh Korpe – Saoli (today)
    { id: 's21', prospect_id: 'p11', customer_name: 'Santosh Korpe', customer_mobile: '9765432101', vehicle_model: 'TAFE 55 DI', taluka: 'Saoli', delivery_date: d(-30), service_month: '1st Month', service_date: TODAY, status: 'Pending' },
    { id: 's22', prospect_id: 'p11', customer_name: 'Santosh Korpe', customer_mobile: '9765432101', vehicle_model: 'TAFE 55 DI', taluka: 'Saoli', delivery_date: d(-30), service_month: '4th Month', service_date: IN90, status: 'Pending' },
    { id: 's23', prospect_id: 'p11', customer_name: 'Santosh Korpe', customer_mobile: '9765432101', vehicle_model: 'TAFE 55 DI', taluka: 'Saoli', delivery_date: d(-30), service_month: '7th Month', service_date: IN180, status: 'Pending' },
    { id: 's24', prospect_id: 'p11', customer_name: 'Santosh Korpe', customer_mobile: '9765432101', vehicle_model: 'TAFE 55 DI', taluka: 'Saoli', delivery_date: d(-30), service_month: '12th Month', service_date: IN365, status: 'Pending' },
    // Nilesh Fulzele – Korpana
    { id: 's25', prospect_id: 'p12', customer_name: 'Nilesh Fulzele', customer_mobile: '9765432102', vehicle_model: 'TAFE 45 DI', taluka: 'Korpana', delivery_date: d(-45), service_month: '1st Month', service_date: d(-15), status: 'Completed' },
    { id: 's26', prospect_id: 'p12', customer_name: 'Nilesh Fulzele', customer_mobile: '9765432102', vehicle_model: 'TAFE 45 DI', taluka: 'Korpana', delivery_date: d(-45), service_month: '4th Month', service_date: IN30, status: 'Pending' },
    { id: 's27', prospect_id: 'p12', customer_name: 'Nilesh Fulzele', customer_mobile: '9765432102', vehicle_model: 'TAFE 45 DI', taluka: 'Korpana', delivery_date: d(-45), service_month: '7th Month', service_date: IN90, status: 'Pending' },
    { id: 's28', prospect_id: 'p12', customer_name: 'Nilesh Fulzele', customer_mobile: '9765432102', vehicle_model: 'TAFE 45 DI', taluka: 'Korpana', delivery_date: d(-45), service_month: '12th Month', service_date: IN365, status: 'Pending' },
];

const SEED_STAFF = [
    { id: 1, name: 'ROHIT KANDULWAR', title: 'mr', designation: 'crm', department: 'sales', mobile: '9876543210' },
    { id: 2, name: 'CHANDRASHEKHAR MOREY', title: 'mr', designation: 'sales_exec', department: 'sales', mobile: '9876543211' },
    { id: 3, name: 'YOGESH DEURMALE', title: 'mr', designation: 'sales_mgr', department: 'sales', mobile: '9876543212' },
    { id: 4, name: 'VIJAY NARNAWARE', title: 'mr', designation: 'team_lead', department: 'account', mobile: '9876543213' },
    { id: 5, name: 'PRIYA SHARMA', title: 'ms', designation: 'accountant', department: 'account', mobile: '9876543214' },
];

// ── initialise localStorage ───────────────────────────────────────────────────
function seed() {
    if (localStorage.getItem(KEYS.SEEDED)) return;
    localStorage.setItem(KEYS.PROSPECTS, JSON.stringify(SEED_PROSPECTS));
    localStorage.setItem(KEYS.FOLLOWUPS, JSON.stringify(SEED_FOLLOWUPS));
    localStorage.setItem(KEYS.SERVICES, JSON.stringify(SEED_SERVICES));
    localStorage.setItem(KEYS.STAFF, JSON.stringify(SEED_STAFF));
    localStorage.setItem(KEYS.SEEDED, '1');
}

// ── low-level CRUD ────────────────────────────────────────────────────────────
const read = (key) => JSON.parse(localStorage.getItem(key) || '[]');
const write = (key, data) => localStorage.setItem(key, JSON.stringify(data));

// ── public store API ──────────────────────────────────────────────────────────
const store = {
    init() { seed(); },

    // ── Prospects ─────────────────────────────────────────────────────────
    getProspects(params = {}) {
        let list = read(KEYS.PROSPECTS);
        if (params.status) list = list.filter(p => p.status === params.status);
        if (params.taluka) list = list.filter(p => p.taluka === params.taluka);
        if (params.search) {
            const q = params.search.toLowerCase();
            list = list.filter(p =>
                `${p.first_name} ${p.last_name}`.toLowerCase().includes(q) ||
                p.mobile.includes(q)
            );
        }
        return { data: list, total: list.length };
    },

    getRecentProspects() {
        const list = read(KEYS.PROSPECTS);
        return list
            .slice()
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
            .slice(0, 10);
    },

    createProspect(data) {
        const list = read(KEYS.PROSPECTS);
        const newItem = {
            ...data,
            id: `p${Date.now()}`,
            refNo: `PRO-${String(list.length + 1).padStart(3, '0')}`,
            created_at: new Date().toISOString(),
        };
        list.unshift(newItem);
        write(KEYS.PROSPECTS, list);
        return newItem;
    },

    updateProspect(id, data) {
        const list = read(KEYS.PROSPECTS);
        const idx = list.findIndex(p => p.id === id);
        if (idx !== -1) { list[idx] = { ...list[idx], ...data }; write(KEYS.PROSPECTS, list); }
        return list[idx];
    },

    deleteProspect(id) {
        write(KEYS.PROSPECTS, read(KEYS.PROSPECTS).filter(p => p.id !== id));
    },

    // ── Follow-Ups ────────────────────────────────────────────────────────
    getFollowUps(params = {}) {
        let list = read(KEYS.FOLLOWUPS);
        if (params.date) list = list.filter(f => f.follow_up_date === params.date);
        if (params.status) list = list.filter(f => f.status === params.status);
        return list;
    },

    getTodayFollowUps() {
        return read(KEYS.FOLLOWUPS).filter(f => f.follow_up_date === TODAY);
    },

    createFollowUp(data) {
        const list = read(KEYS.FOLLOWUPS);
        const newItem = { ...data, id: `f${Date.now()}` };
        list.unshift(newItem);
        write(KEYS.FOLLOWUPS, list);
        return newItem;
    },

    // ── Services ──────────────────────────────────────────────────────────
    getServices(params = {}) {
        let list = read(KEYS.SERVICES);
        if (params.taluka) list = list.filter(s => s.taluka === params.taluka);
        if (params.status) list = list.filter(s => s.status === params.status);
        if (params.serviceMonth) list = list.filter(s => s.service_month === params.serviceMonth);
        if (params.fromDate) list = list.filter(s => s.service_date >= params.fromDate);
        if (params.toDate) list = list.filter(s => s.service_date <= params.toDate);
        if (params.search) {
            const q = params.search.toLowerCase();
            list = list.filter(s =>
                s.customer_name.toLowerCase().includes(q) ||
                s.customer_mobile.includes(q) ||
                (s.vehicle_model || '').toLowerCase().includes(q)
            );
        }
        const limit = params.limit || list.length;
        return { data: list.slice(0, limit), total: list.length };
    },

    getTodayServices() {
        return read(KEYS.SERVICES).filter(s => s.service_date === TODAY && s.status === 'Pending');
    },

    getUpcomingServices() {
        return read(KEYS.SERVICES)
            .filter(s => s.service_date >= TODAY && s.status === 'Pending')
            .sort((a, b) => a.service_date.localeCompare(b.service_date))
            .slice(0, 10);
    },

    getUpcomingServicesList() {
        return read(KEYS.SERVICES)
            .filter(s => s.service_date >= TODAY && s.status === 'Pending')
            .sort((a, b) => a.service_date.localeCompare(b.service_date));
    },

    updateService(id, data) {
        const list = read(KEYS.SERVICES);
        const idx = list.findIndex(s => s.id === id);
        if (idx !== -1) {
            if (data.serviceDate) data.service_date = data.serviceDate;
            list[idx] = { ...list[idx], ...data };
            write(KEYS.SERVICES, list);
        }
        return list[idx];
    },

    deleteService(id) {
        write(KEYS.SERVICES, read(KEYS.SERVICES).filter(s => s.id !== id));
    },

    // ── Staff / Users ─────────────────────────────────────────────────────
    getStaff() { return read(KEYS.STAFF); },

    getUsers() {
        return read(KEYS.STAFF).map(s => ({ id: s.id, name: s.name }));
    },

    // ── Dashboard stats ───────────────────────────────────────────────────
    getDashboardStats() {
        const prospects = read(KEYS.PROSPECTS);
        const followUps = read(KEYS.FOLLOWUPS);

        const totalProspects = prospects.length;
        const conversions = prospects.filter(p => p.status === 'Converted' || p.status === 'Delivered').length;
        const pendingFollowUps = followUps.filter(f => f.status === 'Pending').length;
        const todayFollowUps = followUps.filter(f => f.follow_up_date === TODAY).length;
        const overdueFollowUps = followUps.filter(f => f.follow_up_date < TODAY && f.status === 'Pending').length;

        return { totalProspects, conversions, pendingFollowUps, todayFollowUps, overdueFollowUps, percentChange: 12 };
    },
};

// auto-seed on module load
store.init();

export default store;
