import { useState } from 'react';
import { Save, Plus, X } from 'lucide-react';
import { Card, CardHeader, CardBody, Button, Input, Textarea, Select, Checkbox, CheckboxGroup } from '../../components/UI';
import { useToast } from '../../context/ToastContext';

const sourceOptions = [
    { value: 'Walk in', label: 'Walk in' },
    { value: 'Phone', label: 'Phone' },
    { value: 'Visited', label: 'Visited' },
];

const talukaOptions = [
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

const salesPersonOptions = [
    { value: 'sp1', label: 'Rahul Sharma' },
    { value: 'sp2', label: 'Priya Patel' },
    { value: 'sp3', label: 'Amit Kumar' },
    { value: 'sp4', label: 'Sneha Reddy' },
];

export default function Prospect() {
    const toast = useToast();
    const [formData, setFormData] = useState({
        // Contact Information
        firstName: '',
        lastName: '',
        mobile: '',
        email: '',
        address: '',
        city: '',
        taluka: '',

        // Enquiry Details
        source: '',
        model: '',
        budget: '',
        salesPerson: '',
        remarks: '',

        // Options
        sendSms: true,
        sendWhatsapp: false,
    });

    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));

        // Clear error when field is edited
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.firstName) newErrors.firstName = 'First name is required';
        if (!formData.mobile) newErrors.mobile = 'Mobile number is required';
        else if (!/^\d{10}$/.test(formData.mobile)) newErrors.mobile = 'Enter valid 10-digit mobile';
        if (!formData.source) newErrors.source = 'Please select a source';
        if (!formData.salesPerson) newErrors.salesPerson = 'Please assign a salesperson';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validate()) {
            // Simulate save
            toast.success('Prospect saved successfully!', 'Success');
            // Reset form or redirect
        } else {
            toast.error('Please fix the errors in the form', 'Validation Error');
        }
    };

    const handleReset = () => {
        setFormData({
            firstName: '',
            lastName: '',
            mobile: '',
            email: '',
            address: '',
            city: '',
            taluka: '',
            source: '',
            model: '',
            budget: '',
            salesPerson: '',
            remarks: '',
            sendSms: true,
            sendWhatsapp: false,
        });
        setErrors({});
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="form-grid">
                {/* Left Column - Contact Information */}
                <Card>
                    <CardHeader>Contact Information</CardHeader>
                    <CardBody>
                        <div className="form-section">
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
                                <Input
                                    label="First Name"
                                    name="firstName"
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    placeholder="Enter first name"
                                    required
                                    error={errors.firstName}
                                />
                                <Input
                                    label="Last Name"
                                    name="lastName"
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    placeholder="Enter last name"
                                />
                            </div>

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
                                label="Email Address"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="Enter email address"
                            />

                            <Textarea
                                label="Address"
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                placeholder="Enter full address"
                                rows={3}
                            />

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
                                <Input
                                    label="City"
                                    name="city"
                                    value={formData.city}
                                    onChange={handleChange}
                                    placeholder="Enter city"
                                />
                                <Select
                                    label="Taluka"
                                    name="taluka"
                                    value={formData.taluka}
                                    onChange={handleChange}
                                    options={talukaOptions}
                                    placeholder="Select taluka"
                                    searchable
                                />
                            </div>
                        </div>
                    </CardBody>
                </Card>

                {/* Right Column - Enquiry Details */}
                <Card>
                    <CardHeader>Enquiry Details</CardHeader>
                    <CardBody>
                        <div className="form-section">
                            <Select
                                label="Source"
                                name="source"
                                value={formData.source}
                                onChange={handleChange}
                                options={sourceOptions}
                                placeholder="Select enquiry source"
                                required
                                error={errors.source}
                            />

                            <Input
                                label="Preferred Model"
                                name="model"
                                value={formData.model}
                                onChange={handleChange}
                                placeholder="Enter preferred model"
                            />

                            <Input
                                label="Budget Range"
                                name="budget"
                                value={formData.budget}
                                onChange={handleChange}
                                placeholder="e.g., ₹10L - ₹15L"
                            />

                            <Select
                                label="Assigned Salesperson"
                                name="salesPerson"
                                value={formData.salesPerson}
                                onChange={handleChange}
                                options={salesPersonOptions}
                                placeholder="Select salesperson"
                                searchable
                                required
                                error={errors.salesPerson}
                            />

                            <Textarea
                                label="Remarks"
                                name="remarks"
                                value={formData.remarks}
                                onChange={handleChange}
                                placeholder="Enter any additional notes..."
                                rows={3}
                            />
                        </div>
                    </CardBody>
                </Card>
            </div>

            {/* Options Section */}
            <Card style={{ marginTop: 'var(--spacing-lg)' }}>
                <CardBody>
                    <CheckboxGroup label="Notification Options">
                        <Checkbox
                            label="Send SMS after save"
                            name="sendSms"
                            checked={formData.sendSms}
                            onChange={handleChange}
                        />
                        <Checkbox
                            label="Send WhatsApp to salesman after save"
                            name="sendWhatsapp"
                            checked={formData.sendWhatsapp}
                            onChange={handleChange}
                        />
                    </CheckboxGroup>
                </CardBody>
            </Card>

            {/* Action Bar */}
            <div className="action-bar">
                <Button variant="secondary" icon={X} onClick={handleReset}>
                    Cancel
                </Button>
                <Button variant="secondary" icon={Plus}>
                    Save & New
                </Button>
                <Button variant="primary" icon={Save} type="submit">
                    Save Prospect
                </Button>
            </div>
        </form>
    );
}
