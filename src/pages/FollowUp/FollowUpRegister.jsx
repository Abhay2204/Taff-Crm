import { useState } from 'react';
import { ClipboardList, Download, Filter, FileSpreadsheet } from 'lucide-react';
import { Card, CardHeader, CardBody, Button, Input, Select, DataTable, Badge } from '../../components/UI';
import { exportToExcel } from '../../utils/exportExcel';

const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'Completed', label: 'Completed' },
    { value: 'Pending', label: 'Pending' },
    { value: 'Overdue', label: 'Overdue' },
];

const registerData = [
    { id: 1, date: '2026-02-02', time: '10:00', refNo: 'PRO-001', prospect: 'John Smith', type: 'Phone Call', salesperson: 'Rahul Sharma', outcome: 'Interested', status: 'Completed', nextFollowUp: '2026-02-05' },
    { id: 2, date: '2026-02-02', time: '14:30', refNo: 'PRO-002', prospect: 'Sarah Johnson', type: 'Meeting', salesperson: 'Priya Patel', outcome: 'Callback', status: 'Pending', nextFollowUp: '2026-02-04' },
    { id: 3, date: '2026-02-01', time: '11:00', refNo: 'PRO-003', prospect: 'Mike Chen', type: 'Email', salesperson: 'Amit Kumar', outcome: 'Interested', status: 'Completed', nextFollowUp: '2026-02-03' },
    { id: 4, date: '2026-02-01', time: '16:00', refNo: 'PRO-004', prospect: 'Emily Davis', type: 'Phone Call', salesperson: 'Sneha Reddy', outcome: 'Not Interested', status: 'Overdue', nextFollowUp: '-' },
    { id: 5, date: '2026-01-31', time: '09:30', refNo: 'PRO-005', prospect: 'Robert Wilson', type: 'WhatsApp', salesperson: 'Rahul Sharma', outcome: 'Callback', status: 'Completed', nextFollowUp: '2026-02-02' },
];

const columns = [
    { key: 'date', label: 'Date', width: '90px' },
    { key: 'time', label: 'Time', width: '70px' },
    { key: 'refNo', label: 'Ref No.' },
    { key: 'prospect', label: 'Prospect' },
    { key: 'type', label: 'Type' },
    { key: 'salesperson', label: 'Salesperson' },
    { key: 'outcome', label: 'Outcome', render: (v) => <Badge variant={v === 'Interested' ? 'success' : v === 'Callback' ? 'warning' : 'danger'}>{v}</Badge> },
    { key: 'status', label: 'Status', render: (v) => <Badge variant={v === 'Completed' ? 'success' : v === 'Pending' ? 'warning' : 'danger'}>{v}</Badge> },
    { key: 'nextFollowUp', label: 'Next F/U' }
];

export default function FollowUpRegister() {
    const [filters, setFilters] = useState({ fromDate: '', toDate: '', status: '' });
    const handleFilterChange = (e) => setFilters(p => ({ ...p, [e.target.name]: e.target.value }));

    const handleExport = () => {
        const exportData = registerData.map(r => ({
            'Date': r.date, 'Time': r.time, 'Ref No': r.refNo, 'Prospect': r.prospect,
            'Type': r.type, 'Salesperson': r.salesperson, 'Outcome': r.outcome, 'Status': r.status, 'Next Follow-Up': r.nextFollowUp
        }));
        exportToExcel(exportData, 'FollowUp_Register', 'Register');
    };

    return (
        <div>
            <Card style={{ marginBottom: 'var(--spacing-lg)' }}>
                <CardHeader actions={<Button variant="secondary" icon={FileSpreadsheet} onClick={handleExport}>Export to Excel</Button>}>
                    <Filter size={18} /> Filters
                </CardHeader>
                <CardBody>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--spacing-md)' }}>
                        <Input label="From Date" name="fromDate" type="date" value={filters.fromDate} onChange={handleFilterChange} />
                        <Input label="To Date" name="toDate" type="date" value={filters.toDate} onChange={handleFilterChange} />
                        <Select label="Status" name="status" value={filters.status} onChange={handleFilterChange} options={statusOptions} />
                    </div>
                </CardBody>
            </Card>
            <Card>
                <CardHeader><ClipboardList size={18} /> Follow-up Register</CardHeader>
                <CardBody style={{ padding: 0 }}>
                    <DataTable columns={columns} data={registerData} searchable pagination pageSize={10} />
                </CardBody>
            </Card>
        </div>
    );
}
