import { useState } from 'react';
import { Clock, FileSpreadsheet } from 'lucide-react';
import { Card, CardBody, Button, Badge, DataTable } from '../../components/UI';
import store from '../../services/store';
import { exportToExcel } from '../../utils/exportExcel';

export default function UpcomingServices() {
    const [services] = useState(() => store.getUpcomingServicesList());

    const getDaysUntil = (dateStr) => {
        const today = new Date(); today.setHours(0, 0, 0, 0);
        const target = new Date(dateStr); target.setHours(0, 0, 0, 0);
        const diff = Math.ceil((target - today) / (1000 * 60 * 60 * 24));
        if (diff === 0) return 'Today';
        if (diff === 1) return 'Tomorrow';
        return `In ${diff} days`;
    };

    const columns = [
        {
            key: 'customer_name', label: 'Customer', render: (v, row) => (
                <div>
                    <div style={{ fontWeight: 600 }}>{v}</div>
                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>{row.customer_mobile}</div>
                </div>
            )
        },
        { key: 'vehicle_model', label: 'Vehicle', render: (v) => v || '—' },
        { key: 'taluka', label: 'Taluka', render: (v) => v || '—' },
        { key: 'service_month', label: 'Service', render: (v) => <Badge variant="info">{v}</Badge> },
        { key: 'service_date', label: 'Service Date' },
        {
            key: 'due_in', label: 'Due In', sortable: false, render: (_, row) => (
                <span style={{
                    fontWeight: 500,
                    color: row.service_date === new Date().toISOString().split('T')[0]
                        ? 'var(--color-warning)' : 'var(--color-info)'
                }}>
                    {getDaysUntil(row.service_date)}
                </span>
            )
        },
    ];

    const handleExport = () => {
        const data = services.map(s => ({
            'Customer': s.customer_name, 'Mobile': s.customer_mobile,
            'Vehicle': s.vehicle_model, 'Taluka': s.taluka,
            'Service Month': s.service_month, 'Service Date': s.service_date,
            'Due In': getDaysUntil(s.service_date),
        }));
        exportToExcel(data, 'Upcoming_Services', 'Upcoming');
    };

    return (
        <div>
            <div className="page-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                    <Clock size={20} style={{ color: 'var(--color-info)' }} />
                    <span style={{ fontWeight: 600, fontSize: 'var(--font-size-lg)' }}>
                        {services.length} Upcoming Service{services.length !== 1 ? 's' : ''}
                    </span>
                </div>
                <Button variant="secondary" icon={FileSpreadsheet} onClick={handleExport}>Export</Button>
            </div>
            <Card>
                <CardBody style={{ padding: 0 }}>
                    <DataTable
                        columns={columns} data={services}
                        searchable searchPlaceholder="Search by customer, vehicle..."
                        pagination pageSize={10}
                    />
                </CardBody>
            </Card>
        </div>
    );
}
