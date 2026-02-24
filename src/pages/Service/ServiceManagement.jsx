import { useState, useMemo } from 'react';
import {
    ChevronDown, ChevronRight, Edit, Trash2, FileSpreadsheet,
    CheckCircle, Clock, AlertCircle, Wrench, Calendar, Search, X
} from 'lucide-react';
import { Card, CardBody, Button, Badge } from '../../components/UI';
import { useToast } from '../../context/ToastContext';
import store from '../../services/store';
import { exportToExcel } from '../../utils/exportExcel';

// ─── helpers ────────────────────────────────────────────────────────────────

const TODAY = new Date().toISOString().split('T')[0];

function getStatusInfo(status, serviceDate) {
    if (status === 'Completed') return { variant: 'success', label: 'Completed' };
    if (status === 'Cancelled') return { variant: 'danger', label: 'Cancelled' };
    if (serviceDate < TODAY) return { variant: 'danger', label: 'Overdue' };
    if (serviceDate === TODAY) return { variant: 'warning', label: 'Due Today' };
    return { variant: 'info', label: 'Upcoming' };
}

/**
 * Returns the "worst" status across all service rows for a customer.
 * Priority: Overdue > Due Today > Upcoming > Completed
 */
function getGroupStatus(rows) {
    const pending = rows.filter(r => r.status === 'Pending');
    if (pending.some(r => r.service_date < TODAY)) return { variant: 'danger', label: 'Overdue' };
    if (pending.some(r => r.service_date === TODAY)) return { variant: 'warning', label: 'Due Today' };
    if (pending.some(r => r.service_date > TODAY)) return { variant: 'info', label: 'Upcoming' };
    return { variant: 'success', label: 'All Completed' };
}

/**
 * Next pending service date for a group of rows.
 */
function getNextService(rows) {
    const upcoming = rows
        .filter(r => r.status === 'Pending')
        .sort((a, b) => a.service_date.localeCompare(b.service_date));
    return upcoming[0] || null;
}

// ─── quick-filter chip options ───────────────────────────────────────────────

const QUICK_FILTERS = [
    { key: 'all', label: 'All', icon: Wrench },
    { key: 'today', label: 'Due Today', icon: Calendar },
    { key: 'upcoming', label: 'Upcoming', icon: Clock },
    { key: 'overdue', label: 'Overdue', icon: AlertCircle },
    { key: 'completed', label: 'Completed', icon: CheckCircle },
];

// ─── component ───────────────────────────────────────────────────────────────

export default function ServiceManagement() {
    const toast = useToast();
    const [rawServices, setRawServices] = useState(() => store.getServices({ limit: 500 }).data);
    const [expandedGroups, setExpandedGroups] = useState({});
    const [editingId, setEditingId] = useState(null);
    const [quickFilter, setQuickFilter] = useState('all');
    const [search, setSearch] = useState('');

    // ── reload ──────────────────────────────────────────────────────────────
    const reload = () => setRawServices(store.getServices({ limit: 500 }).data);

    // ── group by customer (prospect_id or customer_mobile) ──────────────────
    const groups = useMemo(() => {
        const map = {};
        rawServices.forEach(s => {
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
        // sort rows inside each group by service_month order
        const monthOrder = { '1st Month': 1, '4th Month': 2, '7th Month': 3, '12th Month': 4 };
        return Object.values(map).map(g => {
            g.rows.sort((a, b) => (monthOrder[a.service_month] || 99) - (monthOrder[b.service_month] || 99));
            g.groupStatus = getGroupStatus(g.rows);
            g.nextService = getNextService(g.rows);
            return g;
        });
    }, [rawServices]);

    // ── filter groups by quick-filter + search ──────────────────────────────
    const filteredGroups = useMemo(() => {
        return groups.filter(g => {
            // quick filter
            if (quickFilter === 'today') {
                if (!g.rows.some(r => r.service_date === TODAY && r.status === 'Pending')) return false;
            } else if (quickFilter === 'upcoming') {
                if (!g.rows.some(r => r.service_date > TODAY && r.status === 'Pending')) return false;
            } else if (quickFilter === 'overdue') {
                if (!g.rows.some(r => r.service_date < TODAY && r.status === 'Pending')) return false;
            } else if (quickFilter === 'completed') {
                if (!g.rows.every(r => r.status === 'Completed')) return false;
            }
            // search
            if (search.trim()) {
                const q = search.toLowerCase();
                if (
                    !g.customer_name.toLowerCase().includes(q) &&
                    !g.customer_mobile.includes(q) &&
                    !(g.vehicle_model || '').toLowerCase().includes(q) &&
                    !(g.taluka || '').toLowerCase().includes(q)
                ) return false;
            }
            return true;
        });
    }, [groups, quickFilter, search]);

    // ── toggle expand ────────────────────────────────────────────────────────
    const toggleGroup = (key) =>
        setExpandedGroups(prev => ({ ...prev, [key]: !prev[key] }));

    // ── actions ──────────────────────────────────────────────────────────────
    const handleUpdateService = (id, data) => {
        store.updateService(id, data);
        toast.success('Service updated');
        setEditingId(null);
        reload();
    };

    const handleDeleteService = (id) => {
        if (!confirm('Delete this service record?')) return;
        store.deleteService(id);
        toast.success('Service deleted');
        reload();
    };

    const handleExport = () => {
        const rows = filteredGroups.flatMap(g =>
            g.rows.map(r => ({
                Customer: r.customer_name,
                Mobile: r.customer_mobile,
                Vehicle: r.vehicle_model,
                Taluka: r.taluka,
                'Service Month': r.service_month,
                'Delivery Date': r.delivery_date,
                'Service Date': r.service_date,
                Status: r.status,
            }))
        );
        exportToExcel(rows, 'Services', 'Services');
    };

    // ── counts for badges ────────────────────────────────────────────────────
    const counts = useMemo(() => ({
        all: groups.length,
        today: groups.filter(g => g.rows.some(r => r.service_date === TODAY && r.status === 'Pending')).length,
        upcoming: groups.filter(g => g.rows.some(r => r.service_date > TODAY && r.status === 'Pending')).length,
        overdue: groups.filter(g => g.rows.some(r => r.service_date < TODAY && r.status === 'Pending')).length,
        completed: groups.filter(g => g.rows.every(r => r.status === 'Completed')).length,
    }), [groups]);

    // ────────────────────────────────────────────────────────────────────────
    return (
        <div>
            {/* ── Toolbar ─────────────────────────────────────────────── */}
            <div className="page-header" style={{ flexWrap: 'wrap', gap: 'var(--spacing-sm)' }}>
                {/* Quick-filter chips */}
                <div className="filter-tabs" style={{ flexWrap: 'wrap' }}>
                    {QUICK_FILTERS.map(f => (
                        <button
                            key={f.key}
                            className={`filter-tab ${quickFilter === f.key ? 'active' : ''}`}
                            onClick={() => setQuickFilter(f.key)}
                        >
                            <f.icon size={14} style={{ marginRight: 4 }} />
                            {f.label}
                            <span style={{
                                marginLeft: 6,
                                background: quickFilter === f.key ? 'rgba(255,255,255,0.25)' : 'var(--color-bg-tertiary)',
                                color: quickFilter === f.key ? 'inherit' : 'var(--color-text-muted)',
                                borderRadius: 999,
                                padding: '1px 7px',
                                fontSize: 11,
                                fontWeight: 700,
                            }}>
                                {counts[f.key]}
                            </span>
                        </button>
                    ))}
                </div>

                {/* Search + export */}
                <div style={{ display: 'flex', gap: 'var(--spacing-sm)', alignItems: 'center', marginLeft: 'auto' }}>
                    <div style={{ position: 'relative' }}>
                        <Search size={14} style={{
                            position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)',
                            color: 'var(--color-text-muted)', pointerEvents: 'none'
                        }} />
                        <input
                            type="text"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Search name, mobile, vehicle…"
                            style={{
                                paddingLeft: 32, paddingRight: search ? 32 : 12, paddingTop: 7, paddingBottom: 7,
                                border: '1px solid var(--color-border)',
                                borderRadius: 'var(--radius-md)',
                                background: 'var(--color-bg-secondary)',
                                color: 'var(--color-text-primary)',
                                fontSize: 'var(--font-size-sm)',
                                minWidth: 230,
                                outline: 'none',
                            }}
                        />
                        {search && (
                            <button
                                onClick={() => setSearch('')}
                                style={{
                                    position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
                                    background: 'none', border: 'none', cursor: 'pointer',
                                    color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center',
                                }}
                            >
                                <X size={13} />
                            </button>
                        )}
                    </div>
                    <Button variant="secondary" icon={FileSpreadsheet} onClick={handleExport}>
                        Export
                    </Button>
                </div>
            </div>

            {/* ── Results count ───────────────────────────────────────── */}
            <div style={{ marginBottom: 'var(--spacing-md)', color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)' }}>
                Showing <strong>{filteredGroups.length}</strong> customer{filteredGroups.length !== 1 ? 's' : ''}
                {search && <> matching "<strong>{search}</strong>"</>}
            </div>

            {/* ── Grouped Table ────────────────────────────────────────── */}
            <Card>
                <CardBody style={{ padding: 0, overflow: 'hidden' }}>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{
                                    background: 'var(--color-bg-tertiary)',
                                    borderBottom: '2px solid var(--color-border)',
                                }}>
                                    {['', 'Customer', 'Vehicle', 'Taluka', 'Delivery Date', 'Next Service', 'Overall Status', 'Actions'].map(h => (
                                        <th key={h} style={{
                                            padding: '10px 14px', textAlign: 'left',
                                            fontSize: 'var(--font-size-xs)', fontWeight: 700,
                                            color: 'var(--color-text-secondary)',
                                            textTransform: 'uppercase', letterSpacing: '0.05em',
                                            whiteSpace: 'nowrap',
                                        }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {filteredGroups.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} style={{
                                            textAlign: 'center', padding: '48px 24px',
                                            color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)',
                                        }}>
                                            No customers found.
                                        </td>
                                    </tr>
                                ) : filteredGroups.map(group => {
                                    const isOpen = expandedGroups[group.key];
                                    const next = group.nextService;

                                    return (
                                        <>
                                            {/* ── Customer (summary) row ── */}
                                            <tr
                                                key={`g-${group.key}`}
                                                onClick={() => toggleGroup(group.key)}
                                                style={{
                                                    cursor: 'pointer',
                                                    borderBottom: isOpen ? 'none' : '1px solid var(--color-border)',
                                                    background: isOpen
                                                        ? 'var(--color-bg-tertiary)'
                                                        : 'var(--color-bg-primary)',
                                                    transition: 'background 0.15s',
                                                }}
                                                onMouseEnter={e => !isOpen && (e.currentTarget.style.background = 'var(--color-bg-secondary)')}
                                                onMouseLeave={e => !isOpen && (e.currentTarget.style.background = 'var(--color-bg-primary)')}
                                            >
                                                {/* Expand toggle */}
                                                <td style={{ padding: '12px 10px 12px 16px', width: 32 }}>
                                                    {isOpen
                                                        ? <ChevronDown size={16} style={{ color: 'var(--color-primary)' }} />
                                                        : <ChevronRight size={16} style={{ color: 'var(--color-text-muted)' }} />
                                                    }
                                                </td>

                                                {/* Customer */}
                                                <td style={{ padding: '12px 14px' }}>
                                                    <div style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
                                                        {group.customer_name}
                                                    </div>
                                                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginTop: 2 }}>
                                                        {group.customer_mobile}
                                                    </div>
                                                </td>

                                                {/* Vehicle */}
                                                <td style={{ padding: '12px 14px', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
                                                    {group.vehicle_model || '—'}
                                                </td>

                                                {/* Taluka */}
                                                <td style={{ padding: '12px 14px', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
                                                    {group.taluka || '—'}
                                                </td>

                                                {/* Delivery Date */}
                                                <td style={{ padding: '12px 14px', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
                                                    {group.delivery_date || '—'}
                                                </td>

                                                {/* Next Service */}
                                                <td style={{ padding: '12px 14px' }}>
                                                    {next ? (
                                                        <div>
                                                            <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 500 }}>{next.service_date}</div>
                                                            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>{next.service_month}</div>
                                                        </div>
                                                    ) : <span style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)' }}>—</span>}
                                                </td>

                                                {/* Overall Status */}
                                                <td style={{ padding: '12px 14px' }}>
                                                    <Badge variant={group.groupStatus.variant}>{group.groupStatus.label}</Badge>
                                                    <span style={{
                                                        marginLeft: 8, fontSize: 'var(--font-size-xs)',
                                                        color: 'var(--color-text-muted)',
                                                    }}>
                                                        ({group.rows.filter(r => r.status === 'Completed').length}/{group.rows.length} done)
                                                    </span>
                                                </td>

                                                {/* Actions placeholder */}
                                                <td style={{ padding: '12px 14px' }}>
                                                    <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                                                        {isOpen ? 'Collapse ▲' : 'Expand ▼'}
                                                    </span>
                                                </td>
                                            </tr>

                                            {/* ── Service detail rows (expandable) ── */}
                                            {isOpen && group.rows.map((row, idx) => {
                                                const si = getStatusInfo(row.status, row.service_date);
                                                return (
                                                    <tr
                                                        key={row.id}
                                                        style={{
                                                            background: 'var(--color-bg-secondary)',
                                                            borderBottom: idx === group.rows.length - 1
                                                                ? '2px solid var(--color-border)'
                                                                : '1px solid var(--color-border)',
                                                        }}
                                                    >
                                                        {/* indent */}
                                                        <td style={{ padding: '9px 10px 9px 28px' }} />

                                                        {/* service month label */}
                                                        <td colSpan={2} style={{ padding: '9px 14px' }}>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                                <div style={{
                                                                    width: 3, height: 32, borderRadius: 99,
                                                                    background: si.variant === 'success' ? 'var(--color-success)'
                                                                        : si.variant === 'danger' ? 'var(--color-danger)'
                                                                            : si.variant === 'warning' ? 'var(--color-warning)'
                                                                                : 'var(--color-info)',
                                                                    flexShrink: 0,
                                                                }} />
                                                                <div>
                                                                    <div style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)' }}>
                                                                        {row.service_month}
                                                                    </div>
                                                                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                                                                        Service #{idx + 1}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </td>

                                                        {/* taluka blank (already shown in parent) */}
                                                        <td style={{ padding: '9px 14px' }} />

                                                        {/* delivery date (same for all) */}
                                                        <td style={{ padding: '9px 14px' }} />

                                                        {/* service date — editable */}
                                                        <td style={{ padding: '9px 14px' }}>
                                                            {editingId === row.id ? (
                                                                <input
                                                                    type="date"
                                                                    defaultValue={row.service_date}
                                                                    className="input"
                                                                    style={{ width: 140, padding: '4px 8px', fontSize: 12 }}
                                                                    autoFocus
                                                                    onBlur={e => handleUpdateService(row.id, { serviceDate: e.target.value })}
                                                                    onKeyDown={e => e.key === 'Escape' && setEditingId(null)}
                                                                />
                                                            ) : (
                                                                <div>
                                                                    <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 500 }}>{row.service_date || '—'}</div>
                                                                </div>
                                                            )}
                                                        </td>

                                                        {/* status badge */}
                                                        <td style={{ padding: '9px 14px' }}>
                                                            <Badge variant={si.variant}>{si.label}</Badge>
                                                        </td>

                                                        {/* row actions */}
                                                        <td style={{ padding: '9px 14px' }}>
                                                            <div style={{ display: 'flex', gap: 4 }}>
                                                                <button
                                                                    title="Edit date"
                                                                    onClick={e => { e.stopPropagation(); setEditingId(row.id); }}
                                                                    style={iconBtn}
                                                                >
                                                                    <Edit size={14} />
                                                                </button>
                                                                {row.status === 'Pending' && (
                                                                    <button
                                                                        title="Mark Completed"
                                                                        onClick={e => { e.stopPropagation(); handleUpdateService(row.id, { status: 'Completed' }); }}
                                                                        style={{ ...iconBtn, color: 'var(--color-success)' }}
                                                                    >
                                                                        <CheckCircle size={14} />
                                                                    </button>
                                                                )}
                                                                <button
                                                                    title="Delete"
                                                                    onClick={e => { e.stopPropagation(); handleDeleteService(row.id); }}
                                                                    style={{ ...iconBtn, color: 'var(--color-danger)' }}
                                                                >
                                                                    <Trash2 size={14} />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </CardBody>
            </Card>

            {/* ── bottom stats ─────────────────────────────────────── */}
            <div style={{
                marginTop: 'var(--spacing-md)',
                fontSize: 'var(--font-size-xs)',
                color: 'var(--color-text-muted)',
                textAlign: 'right',
            }}>
                Total service records: {rawServices.length} &nbsp;·&nbsp; Customers: {groups.length}
            </div>
        </div>
    );
}

// tiny reusable icon-button style
const iconBtn = {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '4px 6px',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--color-text-secondary)',
    display: 'inline-flex',
    alignItems: 'center',
    transition: 'background 0.15s',
};
