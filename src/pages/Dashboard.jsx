import { useState, useEffect } from 'react';
import { Users, TrendingUp, Calendar, Target, Clock, Wrench, Truck, FileSpreadsheet } from 'lucide-react';
import { Card, CardHeader, CardBody, StatCard, DataTable, Badge, Button } from '../components/UI';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { exportToExcel } from '../utils/exportExcel';

const prospectColumns = [
    { key: 'name', label: 'Name', render: (_, row) => `${row.first_name} ${row.last_name || ''}` },
    {
        key: 'status', label: 'Status', render: (v) => {
            const variants = { 'New': 'info', 'Contacted': 'warning', 'Follow Up': 'warning', 'Qualified': 'success', 'Converted': 'success', 'Delivered': 'success', 'Lost': 'danger' };
            return <Badge variant={variants[v] || 'secondary'}>{v}</Badge>;
        }
    },
    { key: 'source', label: 'Source' },
    { key: 'salesperson_name', label: 'Salesperson' },
    { key: 'created_at', label: 'Date', render: (v) => v?.split('T')[0] }
];

export default function Dashboard() {
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [prospects, setProspects] = useState([]);
    const [todayFollowUps, setTodayFollowUps] = useState([]);
    const [upcomingServices, setUpcomingServices] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [statsData, prospectsData, followUpsData, servicesData] = await Promise.all([
                api.getDashboardStats(),
                api.getRecentProspects(),
                api.getTodayFollowUps(),
                api.getUpcomingServices(),
            ]);
            setStats(statsData);
            setProspects(prospectsData);
            setTodayFollowUps(followUpsData);
            setUpcomingServices(servicesData || []);
        } catch (error) {
            console.error('Failed to load dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="skeleton" style={{ height: '200px', marginBottom: '24px' }} />;
    }

    const handleExport = () => {
        const exportData = prospects.map(p => ({
            Name: `${p.first_name} ${p.last_name || ''}`,
            Status: p.status,
            Source: p.source,
            Salesperson: p.salesperson_name,
            Date: p.created_at?.split('T')[0]
        }));
        exportToExcel(exportData, 'Dashboard_Prospects', 'Prospects');
    };

    const getServiceStatusColor = (serviceDate) => {
        const today = new Date().toISOString().split('T')[0];
        if (serviceDate === today) return 'var(--color-warning)';
        if (serviceDate < today) return 'var(--color-danger)';
        return 'var(--color-info)';
    };

    const getServiceStatusLabel = (serviceDate) => {
        const today = new Date().toISOString().split('T')[0];
        if (serviceDate === today) return 'Due Today';
        if (serviceDate < today) return 'Overdue';

        const diff = Math.ceil((new Date(serviceDate) - new Date(today)) / (1000 * 60 * 60 * 24));
        if (diff === 1) return 'Tomorrow';
        if (diff <= 7) return `In ${diff} days`;
        return serviceDate;
    };

    return (
        <div>
            <div className="stats-grid">
                <StatCard icon={Users} value={stats?.totalProspects || 0} label="Total Prospects" change={stats?.percentChange ? `${stats.percentChange}% from last month` : ''} changeType={stats?.percentChange >= 0 ? 'positive' : 'negative'} iconColor="primary" />
                <StatCard icon={TrendingUp} value={stats?.conversions || 0} label="Conversions" iconColor="success" />
                <StatCard icon={Calendar} value={stats?.pendingFollowUps || 0} label="Pending Follow-ups" change={`${stats?.todayFollowUps || 0} due today`} changeType="negative" iconColor="warning" />
                <StatCard icon={Target} value={stats?.overdueFollowUps || 0} label="Overdue" iconColor="danger" />
            </div>

            <div className="grid grid-cols-3" style={{ gap: 'var(--spacing-lg)' }}>
                <div style={{ gridColumn: 'span 2' }}>
                    <Card>
                        <CardHeader actions={
                            <Button variant="secondary" icon={FileSpreadsheet} onClick={handleExport}>
                                Export to Excel
                            </Button>
                        }>Recent Prospects</CardHeader>
                        <CardBody style={{ padding: 0 }}>
                            <DataTable columns={prospectColumns} data={prospects} searchable={false} pagination={false} />
                        </CardBody>
                    </Card>
                </div>

                <div>
                    <Card>
                        <CardHeader>Today's Follow-ups</CardHeader>
                        <CardBody>
                            {todayFollowUps.length === 0 ? (
                                <div className="text-muted" style={{ textAlign: 'center', padding: 'var(--spacing-lg)' }}>No follow-ups scheduled for today</div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                                    {todayFollowUps.map(item => (
                                        <div key={item.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--spacing-sm)', padding: 'var(--spacing-sm)', borderRadius: 'var(--radius-md)', background: 'var(--color-background)' }}>
                                            <Clock size={16} style={{ color: 'var(--color-primary)', marginTop: '2px' }} />
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontWeight: 500, fontSize: 'var(--font-size-sm)' }}>{item.first_name} {item.last_name}</div>
                                                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>{item.follow_up_type} • {item.follow_up_time}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardBody>
                    </Card>

                    {/* Upcoming Services Section */}
                    <Card style={{ marginTop: 'var(--spacing-lg)' }}>
                        <CardHeader actions={
                            <button
                                onClick={() => navigate('/service/all')}
                                style={{
                                    background: 'none', border: 'none', cursor: 'pointer',
                                    color: 'var(--color-primary)', fontSize: 'var(--font-size-xs)',
                                    fontWeight: 500
                                }}
                            >
                                View All →
                            </button>
                        }>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Wrench size={16} style={{ color: 'var(--color-primary)' }} />
                                Upcoming Services
                            </div>
                        </CardHeader>
                        <CardBody>
                            {upcomingServices.length === 0 ? (
                                <div className="text-muted" style={{ textAlign: 'center', padding: 'var(--spacing-lg)' }}>
                                    <Truck size={32} style={{ color: 'var(--color-text-muted)', marginBottom: '8px' }} />
                                    <div>No upcoming services</div>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
                                    {upcomingServices.slice(0, 10).map(service => (
                                        <div key={service.id} style={{
                                            display: 'flex', alignItems: 'flex-start', gap: 'var(--spacing-sm)',
                                            padding: 'var(--spacing-sm) var(--spacing-md)',
                                            borderRadius: 'var(--radius-md)',
                                            background: 'var(--color-background)',
                                            borderLeft: `3px solid ${getServiceStatusColor(service.service_date)}`
                                        }}>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontWeight: 500, fontSize: 'var(--font-size-sm)' }}>
                                                    {service.customer_name}
                                                </div>
                                                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                                                    {service.vehicle_model && `${service.vehicle_model} • `}
                                                    {service.customer_mobile}
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                                                    <span style={{
                                                        fontSize: '10px',
                                                        padding: '1px 6px',
                                                        borderRadius: '4px',
                                                        background: 'var(--color-primary-light)',
                                                        color: 'var(--color-primary)',
                                                        fontWeight: 600
                                                    }}>
                                                        {service.service_month}
                                                    </span>
                                                    <span style={{
                                                        fontSize: '10px',
                                                        color: getServiceStatusColor(service.service_date),
                                                        fontWeight: 500
                                                    }}>
                                                        {getServiceStatusLabel(service.service_date)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardBody>
                    </Card>
                </div>
            </div>
        </div>
    );
}
