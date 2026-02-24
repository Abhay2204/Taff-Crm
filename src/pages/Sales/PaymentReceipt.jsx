import { useState } from 'react';
import { IndianRupee, Save, X, Printer, FileSpreadsheet } from 'lucide-react';
import { Card, CardHeader, CardBody, Button, Input, Select, DataTable, Badge } from '../../components/UI';
import { useToast } from '../../context/ToastContext';
import { exportToExcel } from '../../utils/exportExcel';

const paymentModes = [
    { value: '', label: 'Select Mode' },
    { value: 'Cash', label: 'Cash' },
    { value: 'Cheque', label: 'Cheque' },
    { value: 'NEFT/RTGS', label: 'NEFT / RTGS' },
    { value: 'UPI', label: 'UPI' },
    { value: 'Finance', label: 'Finance' },
];

// Demo receipts stored in state
const SAMPLE_RECEIPTS = [
    { id: 'r1', date: '2026-02-20', customerName: 'Ganesh Wankhede', mobile: '9876543215', vehicle: 'TAFE 45 DI', amount: 25000, mode: 'Cash', reference: '', purpose: 'Advance' },
    { id: 'r2', date: '2026-02-18', customerName: 'Ganesh Wankhede', mobile: '9876543215', vehicle: 'TAFE 45 DI', amount: 450000, mode: 'NEFT/RTGS', reference: 'TXN123456', purpose: 'Full Payment' },
    { id: 'r3', date: '2026-02-15', customerName: 'Santosh Korpe', mobile: '9765432101', vehicle: 'TAFE 55 DI', amount: 50000, mode: 'Cheque', reference: 'CHQ-44521', purpose: 'Advance' },
];

export default function PaymentReceipt() {
    const toast = useToast();
    const [receipts, setReceipts] = useState(SAMPLE_RECEIPTS);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({
        date: new Date().toISOString().split('T')[0],
        customerName: '', mobile: '', vehicle: '', amount: '',
        mode: '', reference: '', purpose: '', remarks: '',
    });
    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(p => ({ ...p, [name]: value }));
        if (errors[name]) setErrors(p => ({ ...p, [name]: '' }));
    };

    const validate = () => {
        const e = {};
        if (!form.customerName) e.customerName = 'Required';
        if (!form.amount || isNaN(form.amount)) e.amount = 'Enter valid amount';
        if (!form.mode) e.mode = 'Select payment mode';
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSubmit = (ev) => {
        ev.preventDefault();
        if (!validate()) { toast.error('Please fix the errors'); return; }
        const newReceipt = { ...form, id: `r${Date.now()}`, amount: parseFloat(form.amount) };
        setReceipts(p => [newReceipt, ...p]);
        toast.success('Payment receipt saved!');
        setShowForm(false);
        setForm({ date: new Date().toISOString().split('T')[0], customerName: '', mobile: '', vehicle: '', amount: '', mode: '', reference: '', purpose: '', remarks: '' });
    };

    const columns = [
        { key: 'date', label: 'Date' },
        { key: 'customerName', label: 'Customer', render: (v, row) => (<div><div style={{ fontWeight: 600 }}>{v}</div><div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>{row.mobile}</div></div>) },
        { key: 'vehicle', label: 'Vehicle', render: (v) => v || '—' },
        { key: 'purpose', label: 'Purpose', render: (v) => v || '—' },
        { key: 'mode', label: 'Mode', render: (v) => <Badge variant="info">{v}</Badge> },
        { key: 'reference', label: 'Ref / Cheque No', render: (v) => v || '—' },
        { key: 'amount', label: 'Amount', render: (v) => <span style={{ fontWeight: 700, color: 'var(--color-success)' }}>₹{v.toLocaleString('en-IN')}</span> },
    ];

    const totalReceipts = receipts.reduce((s, r) => s + r.amount, 0);

    return (
        <div>
            <div className="page-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                    <IndianRupee size={20} style={{ color: 'var(--color-success)' }} />
                    <span style={{ fontWeight: 600, fontSize: 'var(--font-size-lg)' }}>Payment Receipts</span>
                </div>
                <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
                    <Button variant="secondary" icon={FileSpreadsheet} onClick={() => exportToExcel(receipts.map(r => ({ Date: r.date, Customer: r.customerName, Mobile: r.mobile, Vehicle: r.vehicle, Purpose: r.purpose, Mode: r.mode, Reference: r.reference, Amount: r.amount })), 'Payment_Receipts', 'Receipts')}>Export</Button>
                    <Button variant="primary" icon={IndianRupee} onClick={() => setShowForm(true)}>New Receipt</Button>
                </div>
            </div>

            {/* Summary card */}
            <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                <Card>
                    <CardBody>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
                            <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-lg)', background: 'var(--color-success-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <IndianRupee size={24} style={{ color: 'var(--color-success)' }} />
                            </div>
                            <div>
                                <div style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 700, color: 'var(--color-success)' }}>₹{totalReceipts.toLocaleString('en-IN')}</div>
                                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>Total Received ({receipts.length} receipts)</div>
                            </div>
                        </div>
                    </CardBody>
                </Card>
            </div>

            {/* New receipt form */}
            {showForm && (
                <Card style={{ marginBottom: 'var(--spacing-lg)' }}>
                    <CardHeader actions={<Button variant="ghost" icon={X} onClick={() => setShowForm(false)}>Cancel</Button>}>New Payment Receipt</CardHeader>
                    <CardBody>
                        <form onSubmit={handleSubmit}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--spacing-md)' }}>
                                <Input label="Date" name="date" type="date" value={form.date} onChange={handleChange} />
                                <Input label="Customer Name *" name="customerName" value={form.customerName} onChange={handleChange} error={errors.customerName} placeholder="Customer name" />
                                <Input label="Mobile" name="mobile" type="tel" value={form.mobile} onChange={handleChange} placeholder="Mobile number" />
                                <Input label="Vehicle" name="vehicle" value={form.vehicle} onChange={handleChange} placeholder="Vehicle model" />
                                <Input label="Amount (₹) *" name="amount" type="number" value={form.amount} onChange={handleChange} error={errors.amount} placeholder="0" />
                                <Select label="Payment Mode *" name="mode" value={form.mode} onChange={handleChange} options={paymentModes} error={errors.mode} />
                                <Input label="Reference / Cheque No" name="reference" value={form.reference} onChange={handleChange} placeholder="Ref number" />
                                <Input label="Purpose" name="purpose" value={form.purpose} onChange={handleChange} placeholder="e.g. Advance, Full Payment" />
                            </div>
                            <div style={{ marginTop: 'var(--spacing-md)' }}>
                                <Input label="Remarks" name="remarks" value={form.remarks} onChange={handleChange} placeholder="Optional remarks" />
                            </div>
                            <div style={{ marginTop: 'var(--spacing-md)', display: 'flex', gap: 'var(--spacing-sm)', justifyContent: 'flex-end' }}>
                                <Button variant="secondary" type="button" onClick={() => setShowForm(false)}>Cancel</Button>
                                <Button variant="primary" icon={Save} type="submit">Save Receipt</Button>
                            </div>
                        </form>
                    </CardBody>
                </Card>
            )}

            <Card>
                <CardBody style={{ padding: 0 }}>
                    <DataTable columns={columns} data={receipts} searchable searchPlaceholder="Search by customer, vehicle..." pagination pageSize={10} />
                </CardBody>
            </Card>
        </div>
    );
}
