import { useState } from 'react';
import { BarChart3, Wrench, CheckCircle, AlertCircle, Clock, FileSpreadsheet } from 'lucide-react';
import { Card, CardHeader, CardBody, Button, Badge, Select } from '../../components/UI';
import store from '../../services/store';
import { exportToExcel } from '../../utils/exportExcel';

const talukaOptions = [
    { value: '', label: 'All Talukas' },
    { value: 'Mul', label: 'Mul' },
    { value: 'Chandrapur', label: 'Chandrapur' },
    { value: 'Bramhapuri', label: 'Bramhapuri' },
    { value: 'Warora', label: 'Warora' },
    { value: 'Bhadravati', label: 'Bhadravati' },
    { value: 'Chimur', label: 'Chimur' },
    { value: 'Nagbhid', label: 'Nagbhid' },
    { value: 'Sindewahi', label: 'Sindewahi' },
    { value: 'Rajura', label: 'Rajura' },
    { value: 'Gondpipri', label: 'Gondpipri' },
];

export default function ServiceReport() {
    const [talukaFilter, setTalukaFilter] = useState('');
    const allServices = store.getServices({ limit: 500 }).data;

    const today = new Date().toISOString().split('T')[0];

    const filteredServices = talukaFilter
        ? allServices.filter(s => s.taluka === talukaFilter)
        : allServices;

    const totalServices = filteredServices.length;
    const completedCount = filteredServices.filter(s => s.status === 'Completed').length;
    const overdueCount = filteredServices.filter(s => s.status === 'Pending' && s.service_date < today).length;
    const dueTodayCount = filteredServices.filter(s => s.service_date === today && s.status === 'Pending').length;

    // Group by service month
    const byMonth = {};
    filteredServices.forEach(s => {
        if (!byMonth[s.service_month]) byMonth[s.service_month] = { total: 0, completed: 0, pending: 0, overdue: 0 };
        byMonth[s.service_month].total++;
        if (s.status === 'Completed') byMonth[s.service_month].completed++;
        else if (s.service_date < today) byMonth[s.service_month].overdue++;
        else byMonth[s.service_month].pending++;
    });

    // Group by taluka
    const byTaluka = {};
    filteredServices.forEach(s => {
        const t = s.taluka || 'Unknown';
        if (!byTaluka[t]) byTaluka[t] = { total: 0, completed: 0, pending: 0 };
        byTaluka[t].total++;
        if (s.status === 'Completed') byTaluka[t].completed++; else byTaluka[t].pending++;
    });

    const handleExport = () => {
        const data = filteredServices.map(s => ({
            'Customer': s.customer_name, 'Mobile': s.customer_mobile, 'Vehicle': s.vehicle_model,
            'Taluka': s.taluka, 'Service Month': s.service_month, 'Service Date': s.service_date, 'Status': s.status,
        }));
        exportToExcel(data, 'Service_Report', 'Report');
    };

    return (
        <div>
            <div className="page-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                    <BarChart3 size={20} style={{ color: 'var(--color-primary)' }} />
                    <span style={{ fontWeight: 600, fontSize: 'var(--font-size-lg)' }}>Service Report</span>
                </div>
                <div style={{ display: 'flex', gap: 'var(--spacing-sm)', alignItems: 'center' }}>
                    <div style={{ minWidth: '160px' }}>
                        <Select
                            name="talukaFilter" value={talukaFilter}
                            onChange={(e) => setTalukaFilter(e.target.value)}
                            options={talukaOptions} placeholder="Filter by Taluka"
                        />
                    </div>
                    <Button variant="secondary" icon={FileSpreadsheet} onClick={handleExport}>Export</Button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="stats-grid">
                {[
                    { icon: Wrench, value: totalServices, label: 'Total Services', color: 'primary', bg: 'var(--color-primary-light)' },
                    { icon: CheckCircle, value: completedCount, label: 'Completed', color: 'success', bg: 'var(--color-success-light)' },
                    { icon: Clock, value: dueTodayCount, label: 'Due Today', color: 'warning', bg: 'var(--color-warning-light)' },
                    { icon: AlertCircle, value: overdueCount, label: 'Overdue', color: 'danger', bg: 'var(--color-danger-light)' },
                ].map(({ icon: Icon, value, label, color, bg }) => (
                    <Card key={label}>
                        <CardBody>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
                                <div style={{ width: '44px', height: '44px', borderRadius: 'var(--radius-lg)', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Icon size={22} style={{ color: `var(--color-${color})` }} />
                                </div>
                                <div>
                                    <div style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 700, color: `var(--color-${color})` }}>{value}</div>
                                    <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>{label}</div>
                                </div>
                            </div>
                        </CardBody>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-2" style={{ gap: 'var(--spacing-lg)', marginTop: 'var(--spacing-lg)' }}>
                {/* By Service Month */}
                <Card>
                    <CardHeader>By Service Month</CardHeader>
                    <CardBody>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                            {['1st Month', '4th Month', '7th Month', '12th Month'].map(month => {
                                const data = byMonth[month] || { total: 0, completed: 0, pending: 0, overdue: 0 };
                                const pct = data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0;
                                return (
                                    <div key={month}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                            <span style={{ fontWeight: 500, fontSize: 'var(--font-size-sm)' }}>{month}</span>
                                            <div style={{ display: 'flex', gap: 'var(--spacing-sm)', fontSize: 'var(--font-size-xs)' }}>
                                                <span style={{ color: 'var(--color-success)' }}>{data.completed} done</span>
                                                <span style={{ color: 'var(--color-text-muted)' }}>•</span>
                                                <span style={{ color: 'var(--color-warning)' }}>{data.pending} pending</span>
                                                {data.overdue > 0 && (<><span style={{ color: 'var(--color-text-muted)' }}>•</span><span style={{ color: 'var(--color-danger)' }}>{data.overdue} overdue</span></>)}
                                            </div>
                                        </div>
                                        <div style={{ height: '6px', borderRadius: '3px', background: 'var(--color-border)', overflow: 'hidden' }}>
                                            <div style={{ height: '100%', width: `${pct}%`, borderRadius: '3px', background: 'var(--color-success)', transition: 'width 0.5s ease' }} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </CardBody>
                </Card>

                {/* By Taluka */}
                <Card>
                    <CardHeader>By Taluka</CardHeader>
                    <CardBody>
                        {Object.keys(byTaluka).length === 0 ? (
                            <div className="text-muted" style={{ textAlign: 'center', padding: 'var(--spacing-lg)' }}>No data available</div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
                                {Object.entries(byTaluka).sort((a, b) => b[1].total - a[1].total).map(([taluka, data]) => (
                                    <div key={taluka} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--spacing-sm) var(--spacing-md)', borderRadius: 'var(--radius-md)', background: 'var(--color-background)' }}>
                                        <span style={{ fontWeight: 500, fontSize: 'var(--font-size-sm)' }}>{taluka}</span>
                                        <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
                                            <Badge variant="info">{data.total} total</Badge>
                                            <Badge variant="success">{data.completed} done</Badge>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardBody>
                </Card>
            </div>
        </div>
    );
}
