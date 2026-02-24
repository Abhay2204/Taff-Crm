import { useState } from 'react';
import { Save, Plus, X, FileText, Printer } from 'lucide-react';
import { Card, CardHeader, CardBody, Button, Input, Select } from '../../components/UI';
import { useToast } from '../../context/ToastContext';

const salesPersonOptions = [
    { value: 'sp1', label: 'Rahul Sharma' },
    { value: 'sp2', label: 'Priya Patel' },
    { value: 'sp3', label: 'Amit Kumar' },
    { value: 'sp4', label: 'Sneha Reddy' },
];

export default function Quotation() {
    const toast = useToast();
    const [formData, setFormData] = useState({
        customerName: '',
        mobile: '',
        address: '',
        city: '',
        taluka: '',
        vehicleModel: '',
        variant: '',
        exShowroomPrice: '',
        insurance: '',
        rto: '',
        accessories: '',
        otherCharges: '',
        discount: '',
        salesPerson: '',
        remarks: '',
        quotationDate: new Date().toISOString().split('T')[0],
    });

    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const calculateTotal = () => {
        const ex = parseFloat(formData.exShowroomPrice) || 0;
        const ins = parseFloat(formData.insurance) || 0;
        const rto = parseFloat(formData.rto) || 0;
        const acc = parseFloat(formData.accessories) || 0;
        const other = parseFloat(formData.otherCharges) || 0;
        const disc = parseFloat(formData.discount) || 0;
        return ex + ins + rto + acc + other - disc;
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.customerName) newErrors.customerName = 'Customer name is required';
        if (!formData.mobile) newErrors.mobile = 'Mobile is required';
        else if (!/^\d{10}$/.test(formData.mobile)) newErrors.mobile = 'Enter valid 10-digit mobile';
        if (!formData.vehicleModel) newErrors.vehicleModel = 'Vehicle model is required';
        if (!formData.exShowroomPrice) newErrors.exShowroomPrice = 'Ex-showroom price is required';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validate()) {
            toast.success('Quotation saved successfully!');
        } else {
            toast.error('Please fix the errors in the form');
        }
    };

    const handleReset = () => {
        setFormData({
            customerName: '', mobile: '', address: '', city: '', taluka: '',
            vehicleModel: '', variant: '', exShowroomPrice: '', insurance: '',
            rto: '', accessories: '', otherCharges: '', discount: '', salesPerson: '',
            remarks: '', quotationDate: new Date().toISOString().split('T')[0],
        });
        setErrors({});
    };

    const onRoadPrice = calculateTotal();

    return (
        <form onSubmit={handleSubmit}>
            <div className="form-grid">
                {/* Left Column - Customer Details */}
                <Card>
                    <CardHeader>Customer Details</CardHeader>
                    <CardBody>
                        <div className="form-section">
                            <Input
                                label="Quotation Date"
                                name="quotationDate"
                                type="date"
                                value={formData.quotationDate}
                                onChange={handleChange}
                            />
                            <Input
                                label="Customer Name"
                                name="customerName"
                                value={formData.customerName}
                                onChange={handleChange}
                                placeholder="Enter customer name"
                                required
                                error={errors.customerName}
                            />
                            <Input
                                label="Mobile Number"
                                name="mobile"
                                type="tel"
                                value={formData.mobile}
                                onChange={handleChange}
                                placeholder="Enter 10-digit mobile"
                                required
                                error={errors.mobile}
                            />
                            <Input
                                label="Address"
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                placeholder="Enter address"
                            />
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
                                <Input
                                    label="City"
                                    name="city"
                                    value={formData.city}
                                    onChange={handleChange}
                                    placeholder="Enter city"
                                />
                                <Input
                                    label="Taluka"
                                    name="taluka"
                                    value={formData.taluka}
                                    onChange={handleChange}
                                    placeholder="Enter taluka"
                                />
                            </div>
                            <Select
                                label="Salesperson"
                                name="salesPerson"
                                value={formData.salesPerson}
                                onChange={handleChange}
                                options={salesPersonOptions}
                                placeholder="Select salesperson"
                            />
                        </div>
                    </CardBody>
                </Card>

                {/* Right Column - Vehicle & Pricing */}
                <Card>
                    <CardHeader>Vehicle & Pricing</CardHeader>
                    <CardBody>
                        <div className="form-section">
                            <Input
                                label="Vehicle Model"
                                name="vehicleModel"
                                value={formData.vehicleModel}
                                onChange={handleChange}
                                placeholder="Enter vehicle model"
                                required
                                error={errors.vehicleModel}
                            />
                            <Input
                                label="Variant"
                                name="variant"
                                value={formData.variant}
                                onChange={handleChange}
                                placeholder="Enter variant"
                            />
                            <Input
                                label="Ex-Showroom Price (₹)"
                                name="exShowroomPrice"
                                type="number"
                                value={formData.exShowroomPrice}
                                onChange={handleChange}
                                placeholder="0"
                                required
                                error={errors.exShowroomPrice}
                            />
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
                                <Input
                                    label="Insurance (₹)"
                                    name="insurance"
                                    type="number"
                                    value={formData.insurance}
                                    onChange={handleChange}
                                    placeholder="0"
                                />
                                <Input
                                    label="RTO (₹)"
                                    name="rto"
                                    type="number"
                                    value={formData.rto}
                                    onChange={handleChange}
                                    placeholder="0"
                                />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
                                <Input
                                    label="Accessories (₹)"
                                    name="accessories"
                                    type="number"
                                    value={formData.accessories}
                                    onChange={handleChange}
                                    placeholder="0"
                                />
                                <Input
                                    label="Other Charges (₹)"
                                    name="otherCharges"
                                    type="number"
                                    value={formData.otherCharges}
                                    onChange={handleChange}
                                    placeholder="0"
                                />
                            </div>
                            <Input
                                label="Discount (₹)"
                                name="discount"
                                type="number"
                                value={formData.discount}
                                onChange={handleChange}
                                placeholder="0"
                            />

                            {/* Total Section */}
                            <div style={{
                                marginTop: 'var(--spacing-md)',
                                padding: 'var(--spacing-md)',
                                borderRadius: 'var(--radius-lg)',
                                background: 'linear-gradient(135deg, var(--color-primary-light), #dbeafe)',
                                border: '2px solid var(--color-primary)'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontWeight: 600, fontSize: 'var(--font-size-md)', color: 'var(--color-text-primary)' }}>
                                        On-Road Price
                                    </span>
                                    <span style={{ fontWeight: 700, fontSize: 'var(--font-size-2xl)', color: 'var(--color-primary)' }}>
                                        ₹{onRoadPrice.toLocaleString('en-IN')}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </CardBody>
                </Card>
            </div>

            {/* Remarks */}
            <Card style={{ marginTop: 'var(--spacing-lg)' }}>
                <CardBody>
                    <Input
                        label="Remarks / Notes"
                        name="remarks"
                        value={formData.remarks}
                        onChange={handleChange}
                        placeholder="Enter any additional remarks..."
                    />
                </CardBody>
            </Card>

            {/* Action Bar */}
            <div className="action-bar">
                <Button variant="secondary" icon={X} onClick={handleReset}>
                    Cancel
                </Button>
                <Button variant="secondary" icon={Printer}>
                    Print Quotation
                </Button>
                <Button variant="primary" icon={Save} type="submit">
                    Save Quotation
                </Button>
            </div>
        </form>
    );
}
