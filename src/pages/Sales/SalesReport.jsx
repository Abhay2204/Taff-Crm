import { useState } from 'react';
import { BarChart3, TrendingUp, IndianRupee, Truck, FileSpreadsheet, Users } from 'lucide-react';
import { Card, CardHeader, CardBody, Button, Select, Badge, DataTable } from '../../components/UI';
import { exportToExcel } from '../../utils/exportExcel';

// Sample sales data for the report
const SAMPLE_SALES = [
    { id: 's1', date: '2026-02-20', customerName: 'Ganesh Wankhede', mobile: '9876543215', vehicle: 'TAFE 45 DI', taluka: 'Chimur', salesPerson: 'Priya Patel', amount: 480000, status: 'Delivered' },
    { id: 's2', date: '2026-02-18', customerName: 'Santosh Korpe', mobile: '9765432101', vehicle: 'TAFE 55 DI', taluka: 'Saoli', salesPerson: 'Amit Kumar', amount: 560000, status: 'Delivered' },
    { id: 's3', date: '2026-02-15', customerName: 'Nilesh Fulzele', mobile: '9765432102', vehicle: 'TAFE 45 DI', taluka: 'Korpana', salesPerson: 'Sneha Reddy', amount: 475000, status: 'Delivered' },
    { id: 's4', date: '2026-01-30', customerName: 'Dinesh Kamble', mobile: '9765432100', vehicle: 'TAFE 55 DI', taluka: 'Chandrapur', salesPerson: 'Rahul Sharma', amount: 555000, status: 'Delivered' },
    { id: 's5', date: '2026-01-20', customerName: 'Santosh Raut', mobile: '9898989898', vehicle: 'TAFE 9000 DI', taluka: 'Warora', salesPerson: 'Rahul Sharma', amount: 850000, status: 'Delivered' },
    { id: 's6', date: '2026-01-10', customerName: 'Manoj Bhajbhuje', mobile: '9911223344', vehicle: 'TAFE 45 DI', taluka: 'Mul', salesPerson: 'Priya Patel', amount: 472000, status: 'Delivered' },
    { id: 's7', date: '2026-02-22', customerName: 'Vijay Dongre', mobile: '9876543213', vehicle: 'TAFE 9000 DI', taluka: 'Warora', salesPerson: 'Sneha Reddy', amount: 860000, status: 'Booked' },
    { id: 's8', date: '2026-02-21', customerName: 'Pradip Shrirame', mobile: '9922334455', vehicle: 'TAFE 55 DI', taluka: 'Bramhapuri', salesPerson: 'Amit Kumar', amount: 545000, status: 'Delivered' },
];

const salespersonOptions = [
    { value: '', label: 'All Salespersons' },
    { value: 'Rahul Sharma', label: 'Rahul Sharma' },
    { value: 'Priya Patel', label: 'Priya Patel' },
    { value: 'Amit Kumar', label: 'Amit Kumar' },
    { value: 'Sneha Reddy', label: 'Sneha Reddy' },
];

const vehicleModelOptions = [
    { value: '', label: 'All Models' },
    { value: 'TAFE 45 DI', label: 'TAFE 45 DI' },
    { value: 'TAFE 55 DI', label: 'TAFE 55 DI' },
    { value: 'TAFE 9000 DI', label: 'TAFE 9000 DI' },
    { value: 'TAFE 7502', label: 'TAFE 7502' },
];

export default function SalesReport() {
    const [spFilter, setSpFilter] = useState('');
    const [modelFilter, setModelFilter] = useState('');

    const filtered = SAMPLE_SALES.filter(s =>
        (!spFilter || s.salesPerson === spFilter) &&
        (!modelFilter || s.vehicle === modelFilter)
    );

    const totalRevenue = filtered.reduce((sum, s) => sum + s.amount, 0);
    const deliveredCount = filtered.filter(s => s.status === 'Delivered').length;
    const bookedCount = filtered.filter(s => s.status === 'Booked').length;

    // Group by salesperson
    const bySP = {};
    filtered.forEach(s => {
        if (!bySP[s.salesPerson]) bySP[s.salesPerson] = { count: 0, revenue: 0 };
        bySP[s.salesPerson].count++;
        bySP[s.salesPerson].revenue += s.amount;
    });

    // Group by vehicle model
    const byModel = {};
    filtered.forEach(s => {
        if (!byModel[s.vehicle]) byModel[s.vehicle] = { count: 0, revenue: 0 };
        byModel[s.vehicle].count++;
        byModel[s.vehicle].revenue += s.amount;
    });

    const columns = [
        { key: 'date', label: 'Date' },
        { key: 'customerName', label: 'Customer', render: (v, row) => (<div><div style={{ fontWeight: 600 }}>{v}</div><div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>{row.mobile}</div></div>) },
        { key: 'vehicle', label: 'Vehicle', render: v => <Badge variant="info">{v}</Badge> },
        { key: 'taluka', label: 'Taluka' },
        { key: 'salesPerson', label: 'Salesperson' },
        { key: 'amount', label: 'Amount', render: v => <span style={{ fontWeight: 700, color: 'var(--color-success)' }}>₹{v.toLocaleString('en-IN')}</span> },
        { key: 'status', label: 'Status', render: v => <Badge variant={v === 'Delivered' ? 'success' : 'warning'}>{v}</Badge> },
    ];

    return (
        <div>
            <div className="page-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                    <BarChart3 size={20} style={{ color: 'var(--color-primary)' }} />
                    <span style={{ fontWeight: 600, fontSize: 'var(--font-size-lg)' }}>Sales Report</span>
                </div>
                <div style={{ display: 'flex', gap: 'var(--spacing-sm)', alignItems: 'center' }}>
                    <div style={{ minWidth: '160px' }}><Select name="sp" value={spFilter} onChange={e => setSpFilter(e.target.value)} options={salespersonOptions} /></div>
                    <div style={{ minWidth: '160px' }}><Select name="model" value={modelFilter} onChange={e => setModelFilter(e.target.value)} options={vehicleModelOptions} /></div>
                    <Button variant="secondary" icon={FileSpreadsheet} onClick={() => exportToExcel(filtered.map(s => ({ Date: s.date, Customer: s.customerName, Mobile: s.mobile, Vehicle: s.vehicle, Taluka: s.taluka, Salesperson: s.salesPerson, Amount: s.amount, Status: s.status })), 'Sales_Report', 'Sales')}>Export</Button>
                </div>
            </div>

            {/* Summary */}
            <div className="stats-grid">
                {[
                    { icon: Truck, label: 'Vehicles Delivered', value: deliveredCount, color: 'success' },
                    { icon: Users, label: 'Bookings', value: bookedCount, color: 'warning' },
                    { icon: IndianRupee, label: 'Total Revenue', value: `₹${(totalRevenue / 100000).toFixed(1)}L`, color: 'primary' },
                    { icon: TrendingUp, label: 'Avg. Deal Size', value: filtered.length > 0 ? `₹${Math.round(totalRevenue / filtered.length / 1000)}K` : '₹0', color: 'info' },
                ].map(({ icon: Icon, label, value, color }) => (
                    <Card key={label}>
                        <CardBody>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
                                <div style={{ width: '44px', height: '44px', borderRadius: 'var(--radius-lg)', background: `var(--color-${color}-light)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Icon size={22} style={{ color: `var(--color-${color})` }} />
                                </div>
                                <div>
                                    <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, color: `var(--color-${color})` }}>{value}</div>
                                    <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>{label}</div>
                                </div>
                            </div>
                        </CardBody>
                    </Card>
                ))}
            </div>

            {/* Breakdowns */}
            <div className="grid grid-cols-2" style={{ gap: 'var(--spacing-lg)', marginTop: 'var(--spacing-lg)' }}>
                <Card>
                    <CardHeader>By Salesperson</CardHeader>
                    <CardBody>
                        {Object.entries(bySP).sort((a, b) => b[1].revenue - a[1].revenue).map(([sp, d]) => (
                            <div key={sp} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--spacing-sm) 0', borderBottom: '1px solid var(--color-border)' }}>
                                <div>
                                    <div style={{ fontWeight: 600 }}>{sp}</div>
                                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>{d.count} vehicle{d.count !== 1 ? 's' : ''}</div>
                                </div>
                                <div style={{ fontWeight: 700, color: 'var(--color-success)' }}>₹{d.revenue.toLocaleString('en-IN')}</div>
                            </div>
                        ))}
                    </CardBody>
                </Card>
                <Card>
                    <CardHeader>By Vehicle Model</CardHeader>
                    <CardBody>
                        {Object.entries(byModel).sort((a, b) => b[1].count - a[1].count).map(([model, d]) => (
                            <div key={model} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--spacing-sm) 0', borderBottom: '1px solid var(--color-border)' }}>
                                <div>
                                    <Badge variant="info">{model}</Badge>
                                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginTop: '2px' }}>{d.count} sold</div>
                                </div>
                                <div style={{ fontWeight: 700, color: 'var(--color-success)' }}>₹{d.revenue.toLocaleString('en-IN')}</div>
                            </div>
                        ))}
                    </CardBody>
                </Card>
            </div>

            {/* All Transactions */}
            <Card style={{ marginTop: 'var(--spacing-lg)' }}>
                <CardHeader>All Transactions</CardHeader>
                <CardBody style={{ padding: 0 }}>
                    <DataTable columns={columns} data={filtered} searchable searchPlaceholder="Search..." pagination pageSize={10} />
                </CardBody>
            </Card>
        </div>
    );
}
