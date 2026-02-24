import { useState, useEffect } from 'react';
import { Eye, FileSpreadsheet, Truck, Wrench, Calendar } from 'lucide-react';
import { Card, CardHeader, CardBody, Button, DataTable, Badge } from '../../components/UI';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';
import { exportToExcel } from '../../utils/exportExcel';

export default function DeliveredVehicles() {
    const toast = useToast();
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDeliveredVehicles();
    }, []);

    const loadDeliveredVehicles = async () => {
        try {
            setLoading(true);
            const result = await api.getServices({ limit: 200 });
            // Group services by prospect_id to show unique delivered vehicles
            const vehicleMap = new Map();
            for (const s of (result.data || [])) {
                if (!vehicleMap.has(s.prospect_id)) {
                    vehicleMap.set(s.prospect_id, {
                        prospect_id: s.prospect_id,
                        customer_name: s.customer_name,
                        customer_mobile: s.customer_mobile,
                        vehicle_model: s.vehicle_model,
                        taluka: s.taluka,
                        delivery_date: s.delivery_date,
                        services: [],
                    });
                }
                vehicleMap.get(s.prospect_id).services.push(s);
            }
            setServices(Array.from(vehicleMap.values()));
        } catch (error) {
            console.error('Failed to load delivered vehicles:', error);
            toast.error('Failed to load delivered vehicles');
        } finally {
            setLoading(false);
        }
    };

    const getNextServiceInfo = (vehicleServices) => {
        const today = new Date().toISOString().split('T')[0];
        const pending = vehicleServices
            .filter(s => s.status === 'Pending' && s.service_date >= today)
            .sort((a, b) => a.service_date.localeCompare(b.service_date));
        return pending.length > 0 ? pending[0] : null;
    };

    const getServiceProgress = (vehicleServices) => {
        const completed = vehicleServices.filter(s => s.status === 'Completed').length;
        return `${completed}/4`;
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
        { key: 'vehicle_model', label: 'Vehicle Model', render: (v) => v || '—' },
        { key: 'taluka', label: 'Taluka', render: (v) => v || '—' },
        { key: 'delivery_date', label: 'Delivery Date', render: (v) => v || '—' },
        {
            key: 'services', label: 'Service Progress', render: (services) => {
                const completed = services.filter(s => s.status === 'Completed').length;
                return (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{
                            width: '60px', height: '6px', borderRadius: '3px',
                            background: 'var(--color-border)',
                            overflow: 'hidden'
                        }}>
                            <div style={{
                                width: `${(completed / 4) * 100}%`, height: '100%',
                                borderRadius: '3px',
                                background: completed === 4 ? 'var(--color-success)' : 'var(--color-primary)',
                                transition: 'width 0.3s ease'
                            }} />
                        </div>
                        <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                            {completed}/4
                        </span>
                    </div>
                );
            }
        },
        {
            key: 'next_service', label: 'Next Service', sortable: false, render: (_, row) => {
                const next = getNextServiceInfo(row.services);
                if (!next) {
                    return <Badge variant="success">All Done</Badge>;
                }
                const today = new Date().toISOString().split('T')[0];
                const isDueToday = next.service_date === today;
                const isOverdue = next.service_date < today;
                return (
                    <div>
                        <Badge variant={isOverdue ? 'danger' : isDueToday ? 'warning' : 'info'}>
                            {next.service_month}
                        </Badge>
                        <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                            {next.service_date}
                        </div>
                    </div>
                );
            }
        },
        {
            key: 'service_details', label: 'Service Dates', sortable: false, render: (_, row) => (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    {row.services.map(s => (
                        <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: 'var(--font-size-xs)' }}>
                            <span style={{
                                width: '8px', height: '8px', borderRadius: '50%',
                                background: s.status === 'Completed' ? 'var(--color-success)' :
                                    s.service_date < new Date().toISOString().split('T')[0] ? 'var(--color-danger)' : 'var(--color-info)',
                                flexShrink: 0
                            }} />
                            <span style={{ color: 'var(--color-text-muted)', width: '70px' }}>{s.service_month}</span>
                            <span>{s.service_date}</span>
                        </div>
                    ))}
                </div>
            )
        }
    ];

    const handleExport = () => {
        const exportData = [];
        services.forEach(v => {
            v.services.forEach(s => {
                exportData.push({
                    'Customer': v.customer_name,
                    'Mobile': v.customer_mobile,
                    'Vehicle': v.vehicle_model,
                    'Taluka': v.taluka,
                    'Delivery Date': v.delivery_date,
                    'Service Month': s.service_month,
                    'Service Date': s.service_date,
                    'Status': s.status,
                });
            });
        });
        exportToExcel(exportData, 'Delivered_Vehicles', 'Vehicles');
    };

    if (loading) {
        return <div className="skeleton" style={{ height: '400px' }} />;
    }

    return (
        <div>
            <div className="page-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                    <Truck size={20} style={{ color: 'var(--color-primary)' }} />
                    <span style={{ fontWeight: 600, fontSize: 'var(--font-size-lg)' }}>
                        {services.length} Delivered Vehicles
                    </span>
                </div>
                <Button variant="secondary" icon={FileSpreadsheet} onClick={handleExport}>
                    Export to Excel
                </Button>
            </div>

            <Card>
                <CardBody style={{ padding: 0 }}>
                    <DataTable
                        columns={columns}
                        data={services}
                        searchable={true}
                        searchPlaceholder="Search by customer, vehicle, mobile..."
                        pagination={true}
                        pageSize={10}
                    />
                </CardBody>
            </Card>
        </div>
    );
}
