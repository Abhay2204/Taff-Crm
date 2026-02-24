import { useState, useMemo } from 'react';
import { CheckCircle, Calendar, Phone, Wrench, FileSpreadsheet, ChevronDown, ChevronRight } from 'lucide-react';
import { Card, CardBody, Button, Badge } from '../../components/UI';
import { useToast } from '../../context/ToastContext';
import store from '../../services/store';
import { exportToExcel } from '../../utils/exportExcel';

const TODAY = new Date().toISOString().split('T')[0];

export default function TodayServices() {
    const toast = useToast();
    const [services, setServices] = useState(() => store.getTodayServices());
    const [expandedGroups, setExpandedGroups] = useState({});

    const reload = () => setServices(store.getTodayServices());

    const handleMarkCompleted = (id) => {
        store.updateService(id, { status: 'Completed' });
        toast.success('Service marked as completed');
        reload();
    };

    // Group by prospect_id / mobile
    const groups = useMemo(() => {
        const map = {};
        services.forEach(s => {
            const key = s.prospect_id || s.customer_mobile;
            if (!map[key]) {
                map[key] = {
                    key,
                    customer_name: s.customer_name,
                    customer_mobile: s.customer_mobile,
                    vehicle_model: s.vehicle_model,
                    taluka: s.taluka,
                    delivery_date: s.delivery_date,
                    rows: [],
                };
            }
            map[key].rows.push(s);
        });
        return Object.values(map);
    }, [services]);

    const toggleGroup = (key) =>
        setExpandedGroups(prev => ({ ...prev, [key]: !prev[key] }));

    const handleExport = () => {
        const exportData = services.map(s => ({
            'Customer': s.customer_name,
            'Mobile': s.customer_mobile,
            'Vehicle': s.vehicle_model,
            'Taluka': s.taluka,
            'Service Month': s.service_month,
            'Status': s.status,
        }));
        exportToExcel(exportData, 'Today_Services', 'Today');
    };

    return (
        <div>
            <div className="page-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                    <Calendar size={20} style={{ color: 'var(--color-warning)' }} />
                    <span style={{ fontWeight: 600, fontSize: 'var(--font-size-lg)' }}>
                        {groups.length} Customer{groups.length !== 1 ? 's' : ''} Due Today
                        <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 400, color: 'var(--color-text-muted)', marginLeft: 8 }}>
                            ({services.length} service{services.length !== 1 ? 's' : ''})
                        </span>
                    </span>
                </div>
                <Button variant="secondary" icon={FileSpreadsheet} onClick={handleExport}>
                    Export
                </Button>
            </div>

            {groups.length === 0 ? (
                <Card>
                    <CardBody>
                        <div style={{ textAlign: 'center', padding: 'var(--spacing-2xl)' }}>
                            <CheckCircle size={48} style={{ color: 'var(--color-success)', marginBottom: 'var(--spacing-md)' }} />
                            <h3 style={{ marginBottom: 'var(--spacing-sm)', color: 'var(--color-text-primary)' }}>All Clear!</h3>
                            <p style={{ color: 'var(--color-text-muted)' }}>No vehicle services are due today.</p>
                        </div>
                    </CardBody>
                </Card>
            ) : (
                <div style={{ display: 'grid', gap: 'var(--spacing-md)' }}>
                    {groups.map(group => {
                        const isOpen = expandedGroups[group.key];
                        return (
                            <Card key={group.key} style={{ overflow: 'hidden' }}>
                                {/* Summary row */}
                                <CardBody
                                    style={{ cursor: group.rows.length > 1 ? 'pointer' : 'default', paddingBottom: isOpen ? 0 : undefined }}
                                    onClick={() => group.rows.length > 1 && toggleGroup(group.key)}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <div style={{ display: 'flex', gap: 'var(--spacing-md)', alignItems: 'flex-start' }}>
                                            <div style={{
                                                width: 44, height: 44, borderRadius: 'var(--radius-lg)',
                                                background: 'var(--color-warning-light)',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                                            }}>
                                                <Wrench size={20} style={{ color: 'var(--color-warning)' }} />
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 600, fontSize: 'var(--font-size-md)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
                                                    {group.customer_name}
                                                    {group.rows.length > 1 && (
                                                        isOpen
                                                            ? <ChevronDown size={15} style={{ color: 'var(--color-text-muted)' }} />
                                                            : <ChevronRight size={15} style={{ color: 'var(--color-text-muted)' }} />
                                                    )}
                                                </div>
                                                <div style={{ display: 'flex', gap: 'var(--spacing-md)', color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)' }}>
                                                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                                        <Phone size={12} /> {group.customer_mobile}
                                                    </span>
                                                    {group.vehicle_model && <span>🚜 {group.vehicle_model}</span>}
                                                    {group.taluka && <span>📍 {group.taluka}</span>}
                                                </div>
                                                <div style={{ marginTop: 8, display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                                                    {group.rows.map(r => (
                                                        <Badge key={r.id} variant="warning">{r.service_month}</Badge>
                                                    ))}
                                                    <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                                                        Delivered: {group.delivery_date}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        {/* If only one service, show inline button; else show in expanded area */}
                                        {group.rows.length === 1 && (
                                            <Button
                                                variant="primary"
                                                icon={CheckCircle}
                                                onClick={e => { e.stopPropagation(); handleMarkCompleted(group.rows[0].id); }}
                                            >
                                                Mark Done
                                            </Button>
                                        )}
                                    </div>
                                </CardBody>

                                {/* Expanded detail rows */}
                                {isOpen && group.rows.map((row, idx) => (
                                    <div key={row.id} style={{
                                        borderTop: '1px solid var(--color-border)',
                                        padding: '12px 20px 12px 68px',
                                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                        background: 'var(--color-bg-secondary)',
                                    }}>
                                        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                                            <Badge variant="warning">{row.service_month}</Badge>
                                            <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                                                Due: {row.service_date}
                                            </span>
                                        </div>
                                        <Button
                                            variant="primary"
                                            size="sm"
                                            icon={CheckCircle}
                                            onClick={e => { e.stopPropagation(); handleMarkCompleted(row.id); }}
                                        >
                                            Mark Done
                                        </Button>
                                    </div>
                                ))}
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
