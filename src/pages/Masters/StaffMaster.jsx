import { useState, useEffect } from 'react';
import { Save, X, Search, Plus, Trash2, LogOut, FileSpreadsheet } from 'lucide-react';
import { Card, CardHeader, CardBody, Button, Input, Textarea, Select } from '../../components/UI';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';
import { exportToExcel } from '../../utils/exportExcel';

const titleOptions = [
    { value: 'mr', label: 'Mr.' },
    { value: 'ms', label: 'Ms.' },
    { value: 'mrs', label: 'Mrs.' },
    { value: 'dr', label: 'Dr.' },
];

const relationOptions = [
    { value: 'so', label: 'S/o (Son of)' },
    { value: 'do', label: 'D/o (Daughter of)' },
    { value: 'wo', label: 'W/o (Wife of)' },
];

const cityOptions = [
    { value: 'mumbai', label: 'Mumbai' },
    { value: 'delhi', label: 'Delhi' },
    { value: 'bangalore', label: 'Bangalore' },
    { value: 'chennai', label: 'Chennai' },
    { value: 'hyderabad', label: 'Hyderabad' },
    { value: 'pune', label: 'Pune' },
    { value: 'kolkata', label: 'Kolkata' },
    { value: 'ahmedabad', label: 'Ahmedabad' },
    { value: 'nagpur', label: 'Nagpur' },
];

const designationOptions = [
    { value: 'crm', label: 'CRM' },
    { value: 'sales_exec', label: 'Sales Executive' },
    { value: 'sales_mgr', label: 'Sales Manager' },
    { value: 'team_lead', label: 'Team Lead' },
    { value: 'accountant', label: 'Accountant' },
    { value: 'admin', label: 'Admin' },
];

const departmentOptions = [
    { value: 'account', label: 'Account' },
    { value: 'sales', label: 'Sales' },
    { value: 'service', label: 'Service' },
    { value: 'hr', label: 'Human Resources' },
    { value: 'admin', label: 'Administration' },
];

const locationOptions = [
    { value: 'showroom1', label: 'Show Room 1 Motors' },
    { value: 'showroom2', label: 'Show Room 2 Motors' },
    { value: 'headoffice', label: 'Head Office' },
    { value: 'warehouse', label: 'Warehouse' },
];

// Sample staff data
const sampleStaff = [
    { id: 1, name: 'ROHIT KANDULWAR', title: 'mr', designation: 'crm', department: 'sales', mobile: '9876543210' },
    { id: 2, name: 'CHANDRASHEKHAR MOREY', title: 'mr', designation: 'sales_exec', department: 'sales', mobile: '9876543211' },
    { id: 3, name: 'YOGESH DEURMALE', title: 'mr', designation: 'sales_mgr', department: 'sales', mobile: '9876543212' },
    { id: 4, name: 'VIJAY NARNAWARE', title: 'mr', designation: 'team_lead', department: 'account', mobile: '9876543213' },
    { id: 5, name: 'PRIYA SHARMA', title: 'ms', designation: 'accountant', department: 'account', mobile: '9876543214' },
];

export default function StaffMaster() {
    const toast = useToast();
    const [staffList, setStaffList] = useState(sampleStaff);
    const [selectedStaff, setSelectedStaff] = useState('');
    const [isEditing, setIsEditing] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        staffName: '',
        relationType: '',
        relativeName: '',
        address: '',
        city: '',
        stdCode: '',
        district: '',
        state: '',
        mobile: '',
        pin: '',
        designation: 'crm',
        department: 'account',
        location: 'showroom1',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFind = () => {
        if (!selectedStaff) {
            toast.error('Please select a staff member from the list');
            return;
        }

        const staff = staffList.find(s => s.id === parseInt(selectedStaff));
        if (staff) {
            setFormData({
                title: staff.title || '',
                staffName: staff.name || '',
                relationType: staff.relationType || '',
                relativeName: staff.relativeName || '',
                address: staff.address || '',
                city: staff.city || '',
                stdCode: staff.stdCode || '',
                district: staff.district || '',
                state: staff.state || '',
                mobile: staff.mobile || '',
                pin: staff.pin || '',
                designation: staff.designation || 'crm',
                department: staff.department || 'account',
                location: staff.location || 'showroom1',
            });
            setIsEditing(true);
            toast.success('Staff record loaded');
        }
    };

    const handleNew = () => {
        setFormData({
            title: '',
            staffName: '',
            relationType: '',
            relativeName: '',
            address: '',
            city: '',
            stdCode: '',
            district: '',
            state: '',
            mobile: '',
            pin: '',
            designation: 'crm',
            department: 'account',
            location: 'showroom1',
        });
        setSelectedStaff('');
        setIsEditing(false);
        toast.info('Form cleared for new entry');
    };

    const handleSave = () => {
        if (!formData.staffName || !formData.mobile) {
            toast.error('Staff Name and Mobile are required');
            return;
        }

        if (isEditing) {
            setStaffList(prev => prev.map(s =>
                s.id === parseInt(selectedStaff)
                    ? { ...s, ...formData, name: formData.staffName }
                    : s
            ));
            toast.success('Staff record updated successfully');
        } else {
            const newStaff = {
                id: Date.now(),
                name: formData.staffName,
                ...formData,
            };
            setStaffList(prev => [...prev, newStaff]);
            toast.success('New staff record created');
        }
        handleNew();
    };

    const handleDelete = () => {
        if (!selectedStaff) {
            toast.error('Please select a staff member to delete');
            return;
        }
        setStaffList(prev => prev.filter(s => s.id !== parseInt(selectedStaff)));
        handleNew();
        toast.success('Staff record deleted');
    };

    const handleCancel = () => {
        handleNew();
    };

    const handleExit = () => {
        window.history.back();
    };

    const staffOptions = staffList.map(s => ({ value: s.id.toString(), label: s.name }));

    const handleExport = () => {
        const exportData = staffList.map(s => ({
            'Name': s.name,
            'Designation': designationOptions.find(d => d.value === s.designation)?.label || s.designation,
            'Department': departmentOptions.find(d => d.value === s.department)?.label || s.department,
            'Mobile': s.mobile
        }));
        exportToExcel(exportData, 'Staff_Master', 'Staff');
    };

    return (
        <div>
            <Card>
                <CardHeader actions={
                    <Button variant="secondary" icon={FileSpreadsheet} onClick={handleExport}>
                        Export to Excel
                    </Button>
                }>Staff Master - Entry Form</CardHeader>
                <CardBody>
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--spacing-xl)' }}>
                        {/* Left: Entry Fields */}
                        <div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-lg)' }}>
                                <Select
                                    label="Title"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    options={titleOptions}
                                    placeholder="Select"
                                />
                                <Input
                                    label="Staff Name"
                                    name="staffName"
                                    value={formData.staffName}
                                    onChange={handleChange}
                                    placeholder="Enter full name"
                                    required
                                />
                            </div>

                            <div style={{ marginBottom: 'var(--spacing-md)' }}>
                                <label className="form-label">S/o - D/o - W/o</label>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 'var(--spacing-sm)' }}>
                                    <Select
                                        name="relationType"
                                        value={formData.relationType}
                                        onChange={handleChange}
                                        options={relationOptions}
                                        placeholder="Select"
                                    />
                                    <input
                                        type="text"
                                        name="relativeName"
                                        value={formData.relativeName}
                                        onChange={handleChange}
                                        placeholder="Relative's name"
                                        className="form-input"
                                    />
                                </div>
                            </div>

                            <Textarea
                                label="ADDRESS"
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                placeholder="Enter full address"
                                rows={3}
                            />

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--spacing-md)' }}>
                                <Select
                                    label="CITY"
                                    name="city"
                                    value={formData.city}
                                    onChange={handleChange}
                                    options={cityOptions}
                                    placeholder="Select City"
                                    searchable
                                />
                                <Input
                                    label="STD Code"
                                    name="stdCode"
                                    value={formData.stdCode}
                                    onChange={handleChange}
                                    placeholder="e.g. 022"
                                />
                                <Input
                                    label="Distric"
                                    name="district"
                                    value={formData.district}
                                    onChange={handleChange}
                                    placeholder="District"
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--spacing-md)' }}>
                                <Input
                                    label="STATE"
                                    name="state"
                                    value={formData.state}
                                    onChange={handleChange}
                                    placeholder="State"
                                />
                                <Input
                                    label="MOB"
                                    name="mobile"
                                    value={formData.mobile}
                                    onChange={handleChange}
                                    placeholder="Mobile number"
                                    required
                                />
                                <Input
                                    label="PIN"
                                    name="pin"
                                    value={formData.pin}
                                    onChange={handleChange}
                                    placeholder="PIN Code"
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--spacing-md)', marginTop: 'var(--spacing-md)' }}>
                                <Select
                                    label="Staff Designation"
                                    name="designation"
                                    value={formData.designation}
                                    onChange={handleChange}
                                    options={designationOptions}
                                />
                                <Select
                                    label="Department"
                                    name="department"
                                    value={formData.department}
                                    onChange={handleChange}
                                    options={departmentOptions}
                                />
                                <Select
                                    label="Location"
                                    name="location"
                                    value={formData.location}
                                    onChange={handleChange}
                                    options={locationOptions}
                                />
                            </div>
                        </div>

                        {/* Right: Search & Edit */}
                        <div style={{ borderLeft: '1px solid var(--color-border)', paddingLeft: 'var(--spacing-lg)' }}>
                            <div className="form-group">
                                <label className="form-label">Search Staff</label>
                                <Select
                                    name="selectedStaff"
                                    value={selectedStaff}
                                    onChange={(e) => setSelectedStaff(e.target.value)}
                                    options={staffOptions}
                                    placeholder="Select staff to edit"
                                    searchable
                                />
                            </div>

                            <Button variant="primary" icon={Search} onClick={handleFind} style={{ width: '100%', marginTop: 'var(--spacing-sm)' }}>
                                Find
                            </Button>

                            <div style={{ marginTop: 'var(--spacing-lg)', padding: 'var(--spacing-md)', background: 'var(--color-background)', borderRadius: 'var(--radius-md)' }}>
                                <h4 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, marginBottom: 'var(--spacing-sm)', color: 'var(--color-text-secondary)' }}>Staff List</h4>
                                <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                    {staffList.map(staff => (
                                        <div
                                            key={staff.id}
                                            onClick={() => setSelectedStaff(staff.id.toString())}
                                            style={{
                                                padding: 'var(--spacing-sm)',
                                                borderRadius: 'var(--radius-sm)',
                                                marginBottom: 'var(--spacing-xs)',
                                                cursor: 'pointer',
                                                background: selectedStaff === staff.id.toString() ? 'var(--color-primary-light)' : 'transparent',
                                                color: selectedStaff === staff.id.toString() ? 'var(--color-primary)' : 'var(--color-text-primary)',
                                                fontSize: 'var(--font-size-sm)',
                                                transition: 'all var(--transition-fast)'
                                            }}
                                        >
                                            {staff.name}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </CardBody>
            </Card>

            {/* Action Buttons */}
            <Card style={{ marginTop: 'var(--spacing-lg)' }}>
                <CardBody>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--spacing-sm)' }}>
                        <Button variant="secondary" icon={Plus} onClick={handleNew}>
                            New
                        </Button>
                        <Button variant="primary" icon={Save} onClick={handleSave}>
                            Save
                        </Button>
                        <Button variant="danger" icon={Trash2} onClick={handleDelete}>
                            Delete
                        </Button>
                        <Button variant="secondary" icon={X} onClick={handleCancel}>
                            Cancel
                        </Button>
                        <Button variant="secondary" icon={LogOut} onClick={handleExit}>
                            Exit
                        </Button>
                    </div>
                </CardBody>
            </Card>
        </div>
    );
}
