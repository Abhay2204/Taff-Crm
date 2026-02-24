import { useState, useEffect } from 'react';
import { CheckCircle, Calendar, Phone, Wrench, FileSpreadsheet } from 'lucide-react';
import { Card, CardHeader, CardBody, Button, Badge } from '../../components/UI';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';
import { exportToExcel } from '../../utils/exportExcel';

export default function TodayServices() {
    const toast = useToast();
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadTodayServices();
    }, []);

    const loadTodayServices = async () => {
        try {
            setLoading(true);
            const data = await api.getTodayServices();
            setServices(data || []);
        } catch (error) {
            console.error('Failed to load today services:', error);
            toast.error('Failed to load today\'s services');
        } finally {
            setLoading(false);
        }
    };

    const handleMarkCompleted = async (id) => {
        try {
            await api.updateService(id, { status: 'Completed' });
            toast.success('Service marked as completed');
            loadTodayServices();
        } catch (error) {
            toast.error('Failed to update service');
        }
    };

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

    if (loading) {
        return <div className="skeleton" style={{ height: '300px' }} />;
    }

    return (
        <div>
            <div className="page-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                    <Calendar size={20} style={{ color: 'var(--color-warning)' }} />
                    <span style={{ fontWeight: 600, fontSize: 'var(--font-size-lg)' }}>
                        {services.length} Service{services.length !== 1 ? 's' : ''} Due Today
                    </span>
                </div>
                <Button variant="secondary" icon={FileSpreadsheet} onClick={handleExport}>
                    Export
                </Button>
            </div>

            {services.length === 0 ? (
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
                    {services.map(service => (
                        <Card key={service.id}>
                            <CardBody>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div style={{ display: 'flex', gap: 'var(--spacing-md)', alignItems: 'flex-start' }}>
                                        <div style={{
                                            width: '44px', height: '44px', borderRadius: 'var(--radius-lg)',
                                            background: 'var(--color-warning-light)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            flexShrink: 0
                                        }}>
                                            <Wrench size={20} style={{ color: 'var(--color-warning)' }} />
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 600, fontSize: 'var(--font-size-md)', marginBottom: '4px' }}>
                                                {service.customer_name}
                                            </div>
                                            <div style={{ display: 'flex', gap: 'var(--spacing-md)', color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)' }}>
                                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    <Phone size={12} /> {service.customer_mobile}
                                                </span>
                                                {service.vehicle_model && (
                                                    <span>🚗 {service.vehicle_model}</span>
                                                )}
                                                {service.taluka && (
                                                    <span>📍 {service.taluka}</span>
                                                )}
                                            </div>
                                            <div style={{ marginTop: '8px', display: 'flex', gap: 'var(--spacing-sm)', alignItems: 'center' }}>
                                                <Badge variant="warning">{service.service_month} Service</Badge>
                                                <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                                                    Delivered: {service.delivery_date}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <Button
                                        variant="primary"
                                        icon={CheckCircle}
                                        onClick={() => handleMarkCompleted(service.id)}
                                    >
                                        Mark Done
                                    </Button>
                                </div>
                            </CardBody>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
