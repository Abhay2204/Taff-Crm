import { useState } from 'react';
import { Receipt, Save, X, Printer, FileSpreadsheet } from 'lucide-react';
import { Card, CardHeader, CardBody, Button, Input, Select } from '../../components/UI';
import { useToast } from '../../context/ToastContext';
import { exportToExcel } from '../../utils/exportExcel';
import store from '../../services/store';

const vehicleOptions = [
    { value: '', label: 'Select Vehicle' },
    { value: 'TAFE 45 DI', label: 'TAFE 45 DI' },
    { value: 'TAFE 55 DI', label: 'TAFE 55 DI' },
    { value: 'TAFE 9000 DI', label: 'TAFE 9000 DI' },
    { value: 'TAFE 7502', label: 'TAFE 7502' },
    { value: 'Massey Ferguson 1035', label: 'Massey Ferguson 1035' },
    { value: 'Massey Ferguson 8055', label: 'Massey Ferguson 8055' },
];

export default function Invoice() {
    const toast = useToast();
    const [form, setForm] = useState({
        invoiceDate: new Date().toISOString().split('T')[0],
        customerName: '', mobile: '', address: '', taluka: '',
        vehicleModel: '', chassisNo: '', engineNo: '', color: '',
        exShowroom: '', insurance: '', rto: '', accessories: '',
        otherCharges: '', discount: '', advancePaid: '', salesPerson: '',
        financeBank: '', financeAmt: '', remarks: '',
    });
    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(p => ({ ...p, [name]: value }));
        if (errors[name]) setErrors(p => ({ ...p, [name]: '' }));
    };

    const total = ['exShowroom', 'insurance', 'rto', 'accessories', 'otherCharges']
        .reduce((s, k) => s + (parseFloat(form[k]) || 0), 0) - (parseFloat(form.discount) || 0);
    const balance = total - (parseFloat(form.advancePaid) || 0) - (parseFloat(form.financeAmt) || 0);

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
        if (validate()) toast.success('Invoice saved successfully!');
        else toast.error('Please fix the errors');
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="page-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                    <Receipt size={20} style={{ color: 'var(--color-primary)' }} />
                    <span style={{ fontWeight: 600, fontSize: 'var(--font-size-lg)' }}>New Invoice</span>
                </div>
                <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
                    <Button variant="secondary" icon={Printer} type="button">Print</Button>
                    <Button variant="primary" icon={Save} type="submit">Save Invoice</Button>
                </div>
            </div>

            <div className="form-grid">
                {/* Customer Details */}
                <Card>
                    <CardHeader>Customer Details</CardHeader>
                    <CardBody>
                        <div className="form-section">
                            <Input label="Invoice Date" name="invoiceDate" type="date" value={form.invoiceDate} onChange={handleChange} />
                            <Input label="Customer Name *" name="customerName" value={form.customerName} onChange={handleChange} error={errors.customerName} placeholder="Enter customer name" />
                            <Input label="Mobile *" name="mobile" type="tel" value={form.mobile} onChange={handleChange} error={errors.mobile} placeholder="10-digit mobile" />
                            <Input label="Address" name="address" value={form.address} onChange={handleChange} placeholder="Enter address" />
                            <Input label="Taluka" name="taluka" value={form.taluka} onChange={handleChange} placeholder="Enter taluka" />
                            <Input label="Salesperson" name="salesPerson" value={form.salesPerson} onChange={handleChange} placeholder="Enter salesperson name" />
                        </div>
                    </CardBody>
                </Card>

                {/* Vehicle Details */}
                <Card>
                    <CardHeader>Vehicle Details</CardHeader>
                    <CardBody>
                        <div className="form-section">
                            <Select label="Vehicle Model *" name="vehicleModel" value={form.vehicleModel} onChange={handleChange} options={vehicleOptions} error={errors.vehicleModel} />
                            <Input label="Chassis No *" name="chassisNo" value={form.chassisNo} onChange={handleChange} error={errors.chassisNo} placeholder="Enter chassis number" />
                            <Input label="Engine No" name="engineNo" value={form.engineNo} onChange={handleChange} placeholder="Enter engine number" />
                            <Input label="Color" name="color" value={form.color} onChange={handleChange} placeholder="Enter color" />
                        </div>
                    </CardBody>
                </Card>
            </div>

            {/* Pricing */}
            <Card style={{ marginTop: 'var(--spacing-lg)' }}>
                <CardHeader>Pricing Details</CardHeader>
                <CardBody>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 'var(--spacing-md)' }}>
                        <Input label="Ex-Showroom (₹)" name="exShowroom" type="number" value={form.exShowroom} onChange={handleChange} placeholder="0" />
                        <Input label="Insurance (₹)" name="insurance" type="number" value={form.insurance} onChange={handleChange} placeholder="0" />
                        <Input label="RTO (₹)" name="rto" type="number" value={form.rto} onChange={handleChange} placeholder="0" />
                        <Input label="Accessories (₹)" name="accessories" type="number" value={form.accessories} onChange={handleChange} placeholder="0" />
                        <Input label="Other Charges (₹)" name="otherCharges" type="number" value={form.otherCharges} onChange={handleChange} placeholder="0" />
                        <Input label="Discount (₹)" name="discount" type="number" value={form.discount} onChange={handleChange} placeholder="0" />
                        <Input label="Advance Paid (₹)" name="advancePaid" type="number" value={form.advancePaid} onChange={handleChange} placeholder="0" />
                        <Input label="Finance Bank" name="financeBank" value={form.financeBank} onChange={handleChange} placeholder="Bank name" />
                        <Input label="Finance Amount (₹)" name="financeAmt" type="number" value={form.financeAmt} onChange={handleChange} placeholder="0" />
                    </div>

                    {/* Summary */}
                    <div style={{ marginTop: 'var(--spacing-lg)', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--spacing-md)' }}>
                        {[
                            { label: 'On-Road Price', value: total, color: 'var(--color-primary)' },
                            { label: 'Total Received', value: (parseFloat(form.advancePaid) || 0) + (parseFloat(form.financeAmt) || 0), color: 'var(--color-success)' },
                            { label: 'Balance Due', value: balance, color: balance > 0 ? 'var(--color-danger)' : 'var(--color-success)' },
                        ].map(({ label, value, color }) => (
                            <div key={label} style={{ padding: 'var(--spacing-md)', borderRadius: 'var(--radius-lg)', background: 'var(--color-background)', border: `1px solid var(--color-border)`, textAlign: 'center' }}>
                                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', marginBottom: '4px' }}>{label}</div>
                                <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, color }}>₹{value.toLocaleString('en-IN')}</div>
                            </div>
                        ))}
                    </div>
                </CardBody>
            </Card>

            <Card style={{ marginTop: 'var(--spacing-lg)' }}>
                <CardBody>
                    <Input label="Remarks" name="remarks" value={form.remarks} onChange={handleChange} placeholder="Any additional notes..." />
                </CardBody>
            </Card>

            <div className="action-bar">
                <Button variant="secondary" icon={X} type="button" onClick={() => setForm({ invoiceDate: new Date().toISOString().split('T')[0], customerName: '', mobile: '', address: '', taluka: '', vehicleModel: '', chassisNo: '', engineNo: '', color: '', exShowroom: '', insurance: '', rto: '', accessories: '', otherCharges: '', discount: '', advancePaid: '', salesPerson: '', financeBank: '', financeAmt: '', remarks: '' })}>Reset</Button>
                <Button variant="secondary" icon={Printer} type="button">Print Invoice</Button>
                <Button variant="primary" icon={Save} type="submit">Save Invoice</Button>
            </div>
        </form>
    );
}
