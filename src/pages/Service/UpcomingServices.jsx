import { useState, useMemo } from 'react';
import { Clock, FileSpreadsheet, ChevronDown, ChevronRight } from 'lucide-react';
import { Card, CardBody, Button, Badge } from '../../components/UI';
import store from '../../services/store';
import { exportToExcel } from '../../utils/exportExcel';

const TODAY = new Date().toISOString().split('T')[0];

function getDaysUntil(dateStr) {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const target = new Date(dateStr); target.setHours(0, 0, 0, 0);
    const diff = Math.ceil((target - today) / (1000 * 60 * 60 * 24));
    if (diff === 0) return 'Today';
    if (diff === 1) return 'Tomorrow';
    return `In ${diff} days`;
}

export default function UpcomingServices() {
    const [services] = useState(() => store.getUpcomingServicesList());
    const [expandedGroups, setExpandedGroups] = useState({});

    // Group by customer
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
        // Sort groups by their earliest upcoming service date
        return Object.values(map).sort((a, b) => {
            const aDate = a.rows[0]?.service_date || '';
            const bDate = b.rows[0]?.service_date || '';
            return aDate.localeCompare(bDate);
        });
    }, [services]);

    const toggleGroup = (key) =>
        setExpandedGroups(prev => ({ ...prev, [key]: !prev[key] }));

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
                        {groups.length} Customer{groups.length !== 1 ? 's' : ''} Upcoming
                        <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 400, color: 'var(--color-text-muted)', marginLeft: 8 }}>
                            ({services.length} service{services.length !== 1 ? 's' : ''})
                        </span>
                    </span>
                </div>
                <Button variant="secondary" icon={FileSpreadsheet} onClick={handleExport}>Export</Button>
            </div>

            <Card>
                <CardBody style={{ padding: 0, overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: 'var(--color-bg-tertiary)', borderBottom: '2px solid var(--color-border)' }}>
                                {['', 'Customer', 'Vehicle', 'Taluka', 'Next Service', 'Due In'].map(h => (
                                    <th key={h} style={{
                                        padding: '10px 14px', textAlign: 'left',
                                        fontSize: 'var(--font-size-xs)', fontWeight: 700,
                                        color: 'var(--color-text-secondary)', textTransform: 'uppercase',
                                        letterSpacing: '0.05em', whiteSpace: 'nowrap',
                                    }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {groups.map(group => {
                                const isOpen = expandedGroups[group.key];
                                const firstRow = group.rows[0];
                                return (
                                    <>
                                        <tr
                                            key={`g-${group.key}`}
                                            onClick={() => group.rows.length > 1 && toggleGroup(group.key)}
                                            style={{
                                                cursor: group.rows.length > 1 ? 'pointer' : 'default',
                                                borderBottom: isOpen ? 'none' : '1px solid var(--color-border)',
                                                background: isOpen ? 'var(--color-bg-tertiary)' : 'var(--color-bg-primary)',
                                            }}
                                            onMouseEnter={e => !isOpen && group.rows.length > 1 && (e.currentTarget.style.background = 'var(--color-bg-secondary)')}
                                            onMouseLeave={e => !isOpen && (e.currentTarget.style.background = 'var(--color-bg-primary)')}
                                        >
                                            <td style={{ padding: '12px 10px 12px 16px', width: 32 }}>
                                                {group.rows.length > 1
                                                    ? isOpen
                                                        ? <ChevronDown size={16} style={{ color: 'var(--color-primary)' }} />
                                                        : <ChevronRight size={16} style={{ color: 'var(--color-text-muted)' }} />
                                                    : null
                                                }
                                            </td>
                                            <td style={{ padding: '12px 14px' }}>
                                                <div style={{ fontWeight: 600 }}>{group.customer_name}</div>
                                                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>{group.customer_mobile}</div>
                                            </td>
                                            <td style={{ padding: '12px 14px', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
                                                {group.vehicle_model || '—'}
                                            </td>
                                            <td style={{ padding: '12px 14px', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
                                                {group.taluka || '—'}
                                            </td>
                                            <td style={{ padding: '12px 14px' }}>
                                                <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 500 }}>{firstRow?.service_date}</div>
                                                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginTop: 2 }}>
                                                    {firstRow?.service_month}
                                                    {group.rows.length > 1 && (
                                                        <span style={{ marginLeft: 6, color: 'var(--color-info)' }}>
                                                            +{group.rows.length - 1} more
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td style={{ padding: '12px 14px' }}>
                                                <span style={{
                                                    fontWeight: 500,
                                                    color: firstRow?.service_date === TODAY
                                                        ? 'var(--color-warning)' : 'var(--color-info)',
                                                    fontSize: 'var(--font-size-sm)',
                                                }}>
                                                    {firstRow ? getDaysUntil(firstRow.service_date) : '—'}
                                                </span>
                                            </td>
                                        </tr>

                                        {/* Expanded detail rows */}
                                        {isOpen && group.rows.map((row, idx) => (
                                            <tr key={row.id} style={{
                                                background: 'var(--color-bg-secondary)',
                                                borderBottom: idx === group.rows.length - 1
                                                    ? '2px solid var(--color-border)'
                                                    : '1px solid var(--color-border)',
                                            }}>
                                                <td style={{ padding: '9px 10px 9px 28px' }} />
                                                <td colSpan={2} style={{ padding: '9px 14px' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                        <Badge variant="info">{row.service_month}</Badge>
                                                        <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                                                            Service #{idx + 1}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td style={{ padding: '9px 14px' }} />
                                                <td style={{ padding: '9px 14px', fontSize: 'var(--font-size-sm)', fontWeight: 500 }}>
                                                    {row.service_date}
                                                </td>
                                                <td style={{ padding: '9px 14px' }}>
                                                    <span style={{
                                                        fontWeight: 500, fontSize: 'var(--font-size-sm)',
                                                        color: row.service_date === TODAY ? 'var(--color-warning)' : 'var(--color-info)',
                                                    }}>
                                                        {getDaysUntil(row.service_date)}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </>
                                );
                            })}
                        </tbody>
                    </table>
                </CardBody>
            </Card>

            <div style={{ marginTop: 'var(--spacing-md)', fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', textAlign: 'right' }}>
                {services.length} upcoming service{services.length !== 1 ? 's' : ''} across {groups.length} customer{groups.length !== 1 ? 's' : ''}
            </div>
        </div>
    );
}
