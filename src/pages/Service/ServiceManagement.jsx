import { useState, useEffect } from 'react';
import { Eye, Edit, Trash2, FileSpreadsheet, Filter, CheckCircle, Clock, AlertCircle, Wrench, Calendar } from 'lucide-react';
import { Card, CardHeader, CardBody, Button, DataTable, Badge, Input, Select } from '../../components/UI';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';
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
    { value: 'Pombhurna', label: 'Pombhurna' },
    { value: 'Jivati', label: 'Jivati' },
    { value: 'Ballarpur', label: 'Ballarpur' },
    { value: 'Korpana', label: 'Korpana' },
    { value: 'Saoli', label: 'Saoli' },
];

const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'Pending', label: 'Pending' },
    { value: 'Completed', label: 'Completed' },
    { value: 'Overdue', label: 'Overdue' },
    { value: 'Cancelled', label: 'Cancelled' },
];

const serviceMonthOptions = [
    { value: '', label: 'All Service Months' },
    { value: '1st Month', label: '1st Month' },
    { value: '4th Month', label: '4th Month' },
    { value: '7th Month', label: '7th Month' },
    { value: '12th Month', label: '12th Month' },
];

export default function ServiceManagement() {
    const toast = useToast();
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('all');
    const [showFilters, setShowFilters] = useState(false);
    const [editingService, setEditingService] = useState(null);
    const [filters, setFilters] = useState({
        taluka: '',
        status: '',
        serviceMonth: '',
        fromDate: '',
        toDate: '',
        search: '',
    });

    useEffect(() => {
        loadServices();
    }, []);

    const loadServices = async () => {
        try {
            setLoading(true);
            const params = {};
            if (filters.taluka) params.taluka = filters.taluka;
            if (filters.status) params.status = filters.status;
            if (filters.serviceMonth) params.serviceMonth = filters.serviceMonth;
            if (filters.fromDate) params.fromDate = filters.fromDate;
            if (filters.toDate) params.toDate = filters.toDate;
            if (filters.search) params.search = filters.search;
            params.limit = 100;

            const result = await api.getServices(params);
            setServices(result.data || []);
        } catch (error) {
            console.error('Failed to load services:', error);
            toast.error('Failed to load services');
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const applyFilters = () => {
        loadServices();
    };

    const resetFilters = () => {
        setFilters({ taluka: '', status: '', serviceMonth: '', fromDate: '', toDate: '', search: '' });
        setTimeout(() => loadServices(), 100);
    };

    const handleUpdateService = async (id, data) => {
        try {
            await api.updateService(id, data);
            toast.success('Service updated successfully');
            setEditingService(null);
            loadServices();
        } catch (error) {
            toast.error('Failed to update service');
        }
    };

    const handleDeleteService = async (id) => {
        if (!confirm('Are you sure you want to delete this service record?')) return;
        try {
            await api.deleteService(id);
            toast.success('Service deleted successfully');
            loadServices();
        } catch (error) {
            toast.error('Failed to delete service');
        }
    };

    const getStatusBadge = (status, serviceDate) => {
        const today = new Date().toISOString().split('T')[0];
        let variant = 'secondary';
        let label = status;

        if (status === 'Completed') {
            variant = 'success';
        } else if (status === 'Cancelled') {
            variant = 'danger';
        } else if (serviceDate < today) {
            variant = 'danger';
            label = 'Overdue';
        } else if (serviceDate === today) {
            variant = 'warning';
            label = 'Due Today';
        } else {
            variant = 'info';
            label = 'Upcoming';
        }

        return <Badge variant={variant}>{label}</Badge>;
    };

    const tabs = [
        { key: 'all', label: 'All Services', icon: Wrench },
        { key: 'today', label: 'Due Today', icon: Calendar },
        { key: 'upcoming', label: 'Upcoming', icon: Clock },
        { key: 'completed', label: 'Completed', icon: CheckCircle },
        { key: 'overdue', label: 'Overdue', icon: AlertCircle },
    ];

    const today = new Date().toISOString().split('T')[0];
    const filteredByTab = services.filter(s => {
        if (activeTab === 'today') return s.service_date === today && s.status === 'Pending';
        if (activeTab === 'upcoming') return s.service_date > today && s.status === 'Pending';
        if (activeTab === 'completed') return s.status === 'Completed';
        if (activeTab === 'overdue') return s.service_date < today && s.status === 'Pending';
        return true;
    });

    const columns = [
        {
            key: 'customer_name', label: 'Customer', render: (v, row) => (
                <div>
                    <div style={{ fontWeight: 600 }}>{v}</div>
                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>{row.customer_mobile}</div>
                </div>
            )
        },
        { key: 'vehicle_model', label: 'Vehicle Model' },
        { key: 'taluka', label: 'Taluka' },
        {
            key: 'service_month', label: 'Service', render: (v) => (
                <Badge variant="info">{v}</Badge>
            )
        },
        {
            key: 'delivery_date', label: 'Delivery Date', render: (v) => v || '—'
        },
        {
            key: 'service_date', label: 'Service Date', render: (v, row) => {
                if (editingService === row.id) {
                    return (
                        <input
                            type="date"
                            defaultValue={v}
                            className="input"
                            style={{ width: '140px', padding: '4px 8px', fontSize: '12px' }}
                            onBlur={(e) => handleUpdateService(row.id, { serviceDate: e.target.value })}
                        />
                    );
                }
                return v || '—';
            }
        },
        {
            key: 'status', label: 'Status', render: (v, row) => getStatusBadge(v, row.service_date)
        },
        {
            key: 'actions',
            label: 'Actions',
            sortable: false,
            render: (_, row) => (
                <div className="table-actions">
                    <Button variant="ghost" size="sm" title="Edit Date" onClick={() => setEditingService(row.id)}>
                        <Edit size={16} />
                    </Button>
                    {row.status === 'Pending' && (
                        <Button variant="ghost" size="sm" title="Mark Completed" onClick={() => handleUpdateService(row.id, { status: 'Completed' })}>
                            <CheckCircle size={16} />
                        </Button>
                    )}
                    <Button variant="ghost" size="sm" title="Delete" onClick={() => handleDeleteService(row.id)}>
                        <Trash2 size={16} />
                    </Button>
                </div>
            )
        }
    ];

    const handleExport = () => {
        const exportData = filteredByTab.map(s => ({
            'Customer': s.customer_name,
            'Mobile': s.customer_mobile,
            'Vehicle': s.vehicle_model,
            'Taluka': s.taluka,
            'Service Month': s.service_month,
            'Delivery Date': s.delivery_date,
            'Service Date': s.service_date,
            'Status': s.status,
        }));
        exportToExcel(exportData, 'Services', 'Services');
    };

    if (loading) {
        return <div className="skeleton" style={{ height: '400px' }} />;
    }

    return (
        <div>
            {/* Tab Navigation */}
            <div className="page-header">
                <div className="filter-tabs">
                    {tabs.map(tab => (
                        <button
                            key={tab.key}
                            className={`filter-tab ${activeTab === tab.key ? 'active' : ''}`}
                            onClick={() => setActiveTab(tab.key)}
                        >
                            <tab.icon size={14} style={{ marginRight: '4px' }} />
                            {tab.label}
                        </button>
                    ))}
                </div>
                <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
                    <Button variant="secondary" icon={Filter} onClick={() => setShowFilters(!showFilters)}>
                        Filters
                    </Button>
                    <Button variant="secondary" icon={FileSpreadsheet} onClick={handleExport}>
                        Export
                    </Button>
                </div>
            </div>

            {/* Filters Panel */}
            {showFilters && (
                <Card style={{ marginBottom: 'var(--spacing-lg)' }}>
                    <CardBody>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 'var(--spacing-md)', alignItems: 'end' }}>
                            <Select
                                label="Taluka"
                                name="taluka"
                                value={filters.taluka}
                                onChange={handleFilterChange}
                                options={talukaOptions}
                                placeholder="All Talukas"
                            />
                            <Select
                                label="Status"
                                name="status"
                                value={filters.status}
                                onChange={handleFilterChange}
                                options={statusOptions}
                                placeholder="All Statuses"
                            />
                            <Select
                                label="Service Month"
                                name="serviceMonth"
                                value={filters.serviceMonth}
                                onChange={handleFilterChange}
                                options={serviceMonthOptions}
                                placeholder="All Months"
                            />
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
                            <div style={{ display: 'flex', gap: 'var(--spacing-sm)', paddingBottom: '2px' }}>
                                <Button variant="primary" onClick={applyFilters}>Apply</Button>
                                <Button variant="secondary" onClick={resetFilters}>Reset</Button>
                            </div>
                        </div>
                    </CardBody>
                </Card>
            )}

            {/* Data Table */}
            <Card>
                <CardBody style={{ padding: 0 }}>
                    <DataTable
                        columns={columns}
                        data={filteredByTab}
                        searchable={true}
                        searchPlaceholder="Search by customer, mobile, vehicle..."
                        pagination={true}
                        pageSize={15}
                    />
                </CardBody>
            </Card>
        </div>
    );
}
