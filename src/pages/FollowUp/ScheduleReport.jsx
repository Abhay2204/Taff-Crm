import { useState } from 'react';
import { FileText, Download, Filter, FileSpreadsheet } from 'lucide-react';
import { Card, CardHeader, CardBody, Button, Input, Select, DataTable, Badge } from '../../components/UI';
import { exportToExcel } from '../../utils/exportExcel';

const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'pending', label: 'Pending' },
    { value: 'completed', label: 'Completed' },
    { value: 'overdue', label: 'Overdue' },
];

const salesPersonOptions = [
    { value: '', label: 'All Salespersons' },
    { value: 'sp1', label: 'Rahul Sharma' },
    { value: 'sp2', label: 'Priya Patel' },
    { value: 'sp3', label: 'Amit Kumar' },
    { value: 'sp4', label: 'Sneha Reddy' },
];

// Sample data
const reportData = [
    { id: 1, date: '2026-02-02', prospect: 'John Smith', type: 'Phone Call', salesperson: 'Rahul Sharma', status: 'Completed', remarks: 'Discussed pricing options' },
    { id: 2, date: '2026-02-02', prospect: 'Sarah Johnson', type: 'Meeting', salesperson: 'Priya Patel', status: 'Pending', remarks: 'Scheduled for 2:30 PM' },
    { id: 3, date: '2026-02-01', prospect: 'Mike Chen', type: 'Email', salesperson: 'Amit Kumar', status: 'Completed', remarks: 'Sent brochure' },
    { id: 4, date: '2026-02-01', prospect: 'Emily Davis', type: 'Phone Call', salesperson: 'Sneha Reddy', status: 'Overdue', remarks: 'No response' },
    { id: 5, date: '2026-01-31', prospect: 'Robert Wilson', type: 'WhatsApp', salesperson: 'Rahul Sharma', status: 'Completed', remarks: 'Quote sent' },
    { id: 6, date: '2026-01-31', prospect: 'Lisa Brown', type: 'Meeting', salesperson: 'Priya Patel', status: 'Completed', remarks: 'Test drive completed' },
    { id: 7, date: '2026-01-30', prospect: 'James Taylor', type: 'Phone Call', salesperson: 'Amit Kumar', status: 'Pending', remarks: 'Awaiting callback' },
    { id: 8, date: '2026-01-30', prospect: 'Maria Garcia', type: 'Email', salesperson: 'Sneha Reddy', status: 'Completed', remarks: 'Documents requested' },
];

const columns = [
    { key: 'date', label: 'Date', width: '100px' },
    { key: 'prospect', label: 'Prospect' },
    { key: 'type', label: 'Type' },
    { key: 'salesperson', label: 'Salesperson' },
    {
        key: 'status',
        label: 'Status',
        render: (value) => {
            const variants = {
                'Completed': 'success',
                'Pending': 'warning',
                'Overdue': 'danger'
            };
            return <Badge variant={variants[value]}>{value}</Badge>;
        }
    },
    { key: 'remarks', label: 'Remarks' }
];

export default function ScheduleReport() {
    const [filters, setFilters] = useState({
        fromDate: '',
        toDate: '',
        status: '',
        salesperson: ''
    });

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const handleExport = () => {
        const exportData = reportData.map(r => ({
            'Date': r.date,
            'Prospect': r.prospect,
            'Type': r.type,
            'Salesperson': r.salesperson,
            'Status': r.status,
            'Remarks': r.remarks
        }));
        exportToExcel(exportData, 'Schedule_Report', 'Report');
    };

    return (
        <div>
            {/* Filters */}
            <Card style={{ marginBottom: 'var(--spacing-lg)' }}>
                <CardHeader actions={
                    <Button variant="primary" icon={Download} onClick={handleExport}>
                        Export
                    </Button>
                }>
                    <Filter size={18} style={{ marginRight: 'var(--spacing-sm)' }} />
                    Report Filters
                </CardHeader>
                <CardBody>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: 'var(--spacing-md)'
                    }}>
                        <Input
                            label="From Date"
                            name="fromDate"
                            type="date"
                            value={filters.fromDate}
                            onChange={handleFilterChange}
                        />
                        <Input
                            label="To Date"
                            name="toDate"
                            type="date"
                            value={filters.toDate}
                            onChange={handleFilterChange}
                        />
                        <Select
                            label="Status"
                            name="status"
                            value={filters.status}
                            onChange={handleFilterChange}
                            options={statusOptions}
                        />
                        <Select
                            label="Salesperson"
                            name="salesperson"
                            value={filters.salesperson}
                            onChange={handleFilterChange}
                            options={salesPersonOptions}
                            searchable
                        />
                    </div>
                </CardBody>
            </Card>

            {/* Report Table */}
            <Card>
                <CardHeader>
                    <FileText size={18} style={{ marginRight: 'var(--spacing-sm)' }} />
                    Schedule Report
                </CardHeader>
                <CardBody style={{ padding: 0 }}>
                    <DataTable
                        columns={columns}
                        data={reportData}
                        searchable={true}
                        searchPlaceholder="Search prospects..."
                        pagination={true}
                        pageSize={10}
                    />
                </CardBody>
            </Card>
        </div>
    );
}
