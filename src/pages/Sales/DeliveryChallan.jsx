import { useState } from 'react';
import { Truck, Save, X, Printer } from 'lucide-react';
import { Card, CardHeader, CardBody, Button, Input, Select } from '../../components/UI';
import { useToast } from '../../context/ToastContext';

const vehicleOptions = [
    { value: '', label: 'Select Vehicle' },
    { value: 'TAFE 45 DI', label: 'TAFE 45 DI' },
    { value: 'TAFE 55 DI', label: 'TAFE 55 DI' },
    { value: 'TAFE 9000 DI', label: 'TAFE 9000 DI' },
    { value: 'TAFE 7502', label: 'TAFE 7502' },
    { value: 'Massey Ferguson 1035', label: 'Massey Ferguson 1035' },
    { value: 'Massey Ferguson 8055', label: 'Massey Ferguson 8055' },
];

export default function DeliveryChallan() {
    const toast = useToast();
    const [form, setForm] = useState({
        challanDate: new Date().toISOString().split('T')[0],
        deliveryDate: new Date().toISOString().split('T')[0],
        customerName: '', mobile: '', address: '', taluka: '',
        vehicleModel: '', chassisNo: '', engineNo: '', color: '',
        registrationNo: '', insuranceCompany: '', policyNo: '',
        salesPerson: '', remarks: '',
    });
    const [errors, setErrors] = useState({});
    const [serviceSchedule] = useState([
        { month: '1st Month', dueDate: '' },
        { month: '4th Month', dueDate: '' },
        { month: '7th Month', dueDate: '' },
        { month: '12th Month', dueDate: '' },
    ]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(p => ({ ...p, [name]: value }));
        if (errors[name]) setErrors(p => ({ ...p, [name]: '' }));
    };

    const validate = () => {
        const e = {};
        if (!form.customerName) e.customerName = 'Required';
        if (!form.mobile || !/^\d{10}$/.test(form.mobile)) e.mobile = 'Enter valid 10-digit mobile';
        if (!form.vehicleModel) e.vehicleModel = 'Required';
        if (!form.chassisNo) e.chassisNo = 'Required';
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validate()) toast.success('Delivery Challan saved successfully!');
        else toast.error('Please fix the errors');
    };

    // Auto-compute service schedule based on delivery date
    const computedSchedule = (() => {
        if (!form.deliveryDate) return serviceSchedule;
        const base = new Date(form.deliveryDate);
        return [1, 4, 7, 12].map((m, i) => {
            const dt = new Date(base);
            dt.setMonth(dt.getMonth() + m);
            return { month: `${m === 1 ? '1st' : m === 4 ? '4th' : m === 7 ? '7th' : '12th'} Month`, dueDate: dt.toISOString().split('T')[0] };
        });
    })();

    return (
        <form onSubmit={handleSubmit}>
            <div className="page-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                    <Truck size={20} style={{ color: 'var(--color-primary)' }} />
                    <span style={{ fontWeight: 600, fontSize: 'var(--font-size-lg)' }}>Delivery Challan</span>
                </div>
                <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
                    <Button variant="secondary" icon={Printer} type="button">Print</Button>
                    <Button variant="primary" icon={Save} type="submit">Save Challan</Button>
                </div>
            </div>

            <div className="form-grid">
                {/* Customer */}
                <Card>
                    <CardHeader>Customer Details</CardHeader>
                    <CardBody>
                        <div className="form-section">
                            <Input label="Challan Date" name="challanDate" type="date" value={form.challanDate} onChange={handleChange} />
                            <Input label="Delivery Date" name="deliveryDate" type="date" value={form.deliveryDate} onChange={handleChange} />
                            <Input label="Customer Name *" name="customerName" value={form.customerName} onChange={handleChange} error={errors.customerName} placeholder="Enter customer name" />
                            <Input label="Mobile *" name="mobile" type="tel" value={form.mobile} onChange={handleChange} error={errors.mobile} placeholder="10-digit mobile" />
                            <Input label="Address" name="address" value={form.address} onChange={handleChange} placeholder="Enter address" />
                            <Input label="Taluka" name="taluka" value={form.taluka} onChange={handleChange} placeholder="Enter taluka" />
                            <Input label="Salesperson" name="salesPerson" value={form.salesPerson} onChange={handleChange} placeholder="Enter salesperson" />
                        </div>
                    </CardBody>
                </Card>

                {/* Vehicle */}
                <Card>
                    <CardHeader>Vehicle Details</CardHeader>
                    <CardBody>
                        <div className="form-section">
                            <Select label="Vehicle Model *" name="vehicleModel" value={form.vehicleModel} onChange={handleChange} options={vehicleOptions} error={errors.vehicleModel} />
                            <Input label="Chassis No *" name="chassisNo" value={form.chassisNo} onChange={handleChange} error={errors.chassisNo} placeholder="Enter chassis number" />
                            <Input label="Engine No" name="engineNo" value={form.engineNo} onChange={handleChange} placeholder="Enter engine number" />
                            <Input label="Color" name="color" value={form.color} onChange={handleChange} placeholder="Enter color" />
                            <Input label="Registration No" name="registrationNo" value={form.registrationNo} onChange={handleChange} placeholder="e.g. MH-34-AB-1234" />
                            <Input label="Insurance Company" name="insuranceCompany" value={form.insuranceCompany} onChange={handleChange} placeholder="Insurance company name" />
                            <Input label="Policy No" name="policyNo" value={form.policyNo} onChange={handleChange} placeholder="Policy number" />
                        </div>
                    </CardBody>
                </Card>
            </div>

            {/* Service Schedule (auto-computed) */}
            <Card style={{ marginTop: 'var(--spacing-lg)' }}>
                <CardHeader>Service Schedule (Auto-Generated)</CardHeader>
                <CardBody>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--spacing-md)' }}>
                        {computedSchedule.map(({ month, dueDate }) => (
                            <div key={month} style={{ padding: 'var(--spacing-md)', borderRadius: 'var(--radius-lg)', background: 'var(--color-background)', border: '1px solid var(--color-border)', textAlign: 'center' }}>
                                <div style={{ fontWeight: 600, color: 'var(--color-primary)', marginBottom: '8px' }}>{month}</div>
                                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>{dueDate || '—'}</div>
                            </div>
                        ))}
                    </div>
                    <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginTop: 'var(--spacing-sm)' }}>
                        * Service dates are automatically calculated from the delivery date.
                    </p>
                </CardBody>
            </Card>

            <Card style={{ marginTop: 'var(--spacing-lg)' }}>
                <CardBody>
                    <Input label="Remarks" name="remarks" value={form.remarks} onChange={handleChange} placeholder="Any additional notes..." />
                </CardBody>
            </Card>

            <div className="action-bar">
                <Button variant="secondary" icon={X} type="button">Reset</Button>
                <Button variant="secondary" icon={Printer} type="button">Print Challan</Button>
                <Button variant="primary" icon={Save} type="submit">Save Challan</Button>
            </div>
        </form>
    );
}
