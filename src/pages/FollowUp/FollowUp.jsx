import { useState, useEffect } from 'react';
import { Save, X, Search, Plus, Trash2, LogOut, Eye, FileSpreadsheet } from 'lucide-react';
import { Card, CardHeader, CardBody, Button, Input, Textarea, Select, Checkbox, DataTable, Badge } from '../../components/UI';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';
import { exportToExcel } from '../../utils/exportExcel';

const priorityOptions = [
    { value: 'high', label: 'High' },
    { value: 'medium', label: 'Medium' },
    { value: 'low', label: 'Low' },
];

const locationOptions = [
    { value: 'showroom1', label: 'Show Room 1 Motors' },
    { value: 'showroom2', label: 'Show Room 2 Motors' },
    { value: 'headoffice', label: 'Head Office' },
];

const followTypeOptions = [
    { value: 'phone', label: 'Phone Call' },
    { value: 'email', label: 'Email' },
    { value: 'meeting', label: 'In-Person Meeting' },
    { value: 'whatsapp', label: 'WhatsApp' },
    { value: 'video', label: 'Video Call' },
];

const enquiryStatusOptions = [
    { value: 'hot', label: 'Hot' },
    { value: 'warm', label: 'Warm' },
    { value: 'cold', label: 'Cold' },
    { value: 'converted', label: 'Converted' },
    { value: 'lost', label: 'Lost' },
];

const historyColumns = [
    { key: 'contacted_date', label: 'Contacted Date' },
    { key: 'contacted_time', label: 'Contacted Time' },
    { key: 'follow_type', label: 'Follow Type' },
    { key: 'appointment_date', label: 'Appt. Date' },
    { key: 'appointment_time', label: 'Appt. Time' },
    { key: 'remarks', label: 'Remarks' },
    { key: 'action_taken', label: 'Action Taken' },
    { key: 'location', label: 'Location' },
];

// Sample history data
const sampleHistory = [
    { id: 1, contacted_date: '2026-01-30', contacted_time: '10:30', follow_type: 'Phone Call', appointment_date: '2026-01-31', appointment_time: '14:00', remarks: 'Discussed pricing', action_taken: 'Sent quote', location: 'Show Room 1' },
    { id: 2, contacted_date: '2026-01-28', contacted_time: '15:00', follow_type: 'Email', appointment_date: '2026-01-30', appointment_time: '10:30', remarks: 'Follow up on query', action_taken: 'Scheduled call', location: 'Head Office' },
    { id: 3, contacted_date: '2026-01-25', contacted_time: '11:00', follow_type: 'WhatsApp', appointment_date: '2026-01-28', appointment_time: '15:00', remarks: 'Initial contact', action_taken: 'Sent brochure', location: 'Show Room 1' },
];

export default function FollowUp() {
    const toast = useToast();
    const [staffOptions, setStaffOptions] = useState([]);
    const [history, setHistory] = useState(sampleHistory);
    const [formData, setFormData] = useState({
        refNo: '',
        visitorName: '',
        priority: '',
        contactPerson: '',
        location: 'showroom1',
        splRemarks: '',
        contactNo: '',
        contactDate: '2026-01-31',
        contactTime: '16:35',
        followType: '',
        enquiryStatus: '',
        followUpBy: '',
        remarks: '',
        actionTaken: '',
        appointmentDate: '2026-01-31',
        appointmentTime: '16:35',
        sendWhatsapp: false,
    });

    const [prospectFound, setProspectFound] = useState(false);

    useEffect(() => {
        loadStaff();
    }, []);

    const loadStaff = async () => {
        try {
            const users = await api.getUsers();
            setStaffOptions(users.map(u => ({ value: u.id, label: u.name })));
        } catch (error) {
            console.error('Failed to load staff:', error);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleFind = () => {
        if (!formData.refNo) {
            toast.error('Please enter a Reference Number');
            return;
        }
        // Simulate finding prospect
        setProspectFound(true);
        setFormData(prev => ({
            ...prev,
            visitorName: 'John Smith',
            contactPerson: 'John Smith',
            contactNo: '9876543210'
        }));
        toast.success('Prospect found!');
    };

    const handleShowDetails = () => {
        if (!prospectFound) {
            toast.warning('Please find a prospect first');
            return;
        }
        toast.info('Showing prospect details...');
    };

    const handleNew = () => {
        setFormData({
            refNo: '',
            visitorName: '',
            priority: '',
            contactPerson: '',
            location: 'showroom1',
            splRemarks: '',
            contactNo: '',
            contactDate: new Date().toISOString().split('T')[0],
            contactTime: new Date().toTimeString().slice(0, 5),
            followType: '',
            enquiryStatus: '',
            followUpBy: '',
            remarks: '',
            actionTaken: '',
            appointmentDate: new Date().toISOString().split('T')[0],
            appointmentTime: new Date().toTimeString().slice(0, 5),
            sendWhatsapp: false,
        });
        setProspectFound(false);
        toast.info('Form cleared for new entry');
    };

    const handleSave = () => {
        if (!formData.refNo || !formData.contactDate) {
            toast.error('Please fill required fields');
            return;
        }
        // Add to history
        const newEntry = {
            id: Date.now(),
            contacted_date: formData.contactDate,
            contacted_time: formData.contactTime,
            follow_type: followTypeOptions.find(o => o.value === formData.followType)?.label || formData.followType,
            appointment_date: formData.appointmentDate,
            appointment_time: formData.appointmentTime,
            remarks: formData.remarks,
            action_taken: formData.actionTaken,
            location: locationOptions.find(o => o.value === formData.location)?.label || formData.location,
        };
        setHistory(prev => [newEntry, ...prev]);
        toast.success('Follow-up saved successfully!');
    };

    const handleCancel = () => {
        handleNew();
    };

    const handleDelete = () => {
        toast.warning('Delete functionality - confirm before deleting');
    };

    const handleExit = () => {
        window.history.back();
    };

    return (
        <div>
            {/* Section 1: Top Search & Primary Info */}
            <Card style={{ marginBottom: 'var(--spacing-lg)' }}>
                <CardHeader>Search & Primary Info</CardHeader>
                <CardBody>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--spacing-md)' }}>
                        <div className="form-group">
                            <label className="form-label">Ref. No.</label>
                            <div className="input-group">
                                <input
                                    type="text"
                                    name="refNo"
                                    value={formData.refNo}
                                    onChange={handleChange}
                                    placeholder="Enter Ref. No."
                                    className="form-input"
                                />
                                <Button variant="primary" icon={Search} onClick={handleFind}>
                                    Find
                                </Button>
                            </div>
                        </div>

                        <Input
                            label="Visitor Name"
                            name="visitorName"
                            value={formData.visitorName}
                            onChange={handleChange}
                            placeholder="Visitor name"
                            disabled={!prospectFound}
                        />

                        <Select
                            label="Priority"
                            name="priority"
                            value={formData.priority}
                            onChange={handleChange}
                            options={priorityOptions}
                            placeholder="Select Priority"
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--spacing-md)', marginTop: 'var(--spacing-md)' }}>
                        <Input
                            label="Contact Person"
                            name="contactPerson"
                            value={formData.contactPerson}
                            onChange={handleChange}
                            placeholder="Contact person name"
                        />

                        <div style={{ display: 'flex', gap: 'var(--spacing-sm)', alignItems: 'flex-end' }}>
                            <div style={{ flex: 1 }}>
                                <Select
                                    label="Location"
                                    name="location"
                                    value={formData.location}
                                    onChange={handleChange}
                                    options={locationOptions}
                                />
                            </div>
                            <Button variant="secondary" icon={Eye} onClick={handleShowDetails}>
                                Show Details
                            </Button>
                        </div>
                    </div>
                </CardBody>
            </Card>

            {/* Section 2: Follow-Up Details */}
            <Card style={{ marginBottom: 'var(--spacing-lg)' }}>
                <CardHeader>Follow-Up Details</CardHeader>
                <CardBody>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-lg)' }}>
                        {/* Left Column */}
                        <div>
                            <Textarea
                                label="Spl. Remarks"
                                name="splRemarks"
                                value={formData.splRemarks}
                                onChange={handleChange}
                                placeholder="Special remarks..."
                                rows={3}
                            />

                            <Input
                                label="Contact No."
                                name="contactNo"
                                value={formData.contactNo}
                                onChange={handleChange}
                                placeholder="Contact number"
                            />

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
                                <Input
                                    label="Contact Date"
                                    name="contactDate"
                                    type="date"
                                    value={formData.contactDate}
                                    onChange={handleChange}
                                />
                                <Input
                                    label="Contact Time"
                                    name="contactTime"
                                    type="time"
                                    value={formData.contactTime}
                                    onChange={handleChange}
                                />
                            </div>

                            <Select
                                label="Follow Type"
                                name="followType"
                                value={formData.followType}
                                onChange={handleChange}
                                options={followTypeOptions}
                                placeholder="Select follow type"
                            />

                            <Select
                                label="Enquiry Status"
                                name="enquiryStatus"
                                value={formData.enquiryStatus}
                                onChange={handleChange}
                                options={enquiryStatusOptions}
                                placeholder="Select status"
                            />
                        </div>

                        {/* Right Column */}
                        <div>
                            <Select
                                label="Follow-Up by"
                                name="followUpBy"
                                value={formData.followUpBy}
                                onChange={handleChange}
                                options={[{ value: '', label: '--Select Staff--' }, ...staffOptions]}
                                searchable
                            />

                            <Input
                                label="Remarks"
                                name="remarks"
                                value={formData.remarks}
                                onChange={handleChange}
                                placeholder="Enter remarks"
                            />

                            <Input
                                label="Action Taken"
                                name="actionTaken"
                                value={formData.actionTaken}
                                onChange={handleChange}
                                placeholder="Action taken"
                            />

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
                                <Input
                                    label="Appointment Date"
                                    name="appointmentDate"
                                    type="date"
                                    value={formData.appointmentDate}
                                    onChange={handleChange}
                                />
                                <Input
                                    label="App. Time"
                                    name="appointmentTime"
                                    type="time"
                                    value={formData.appointmentTime}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                    </div>
                </CardBody>
            </Card>

            {/* Section 3: Action Controls */}
            <Card style={{ marginBottom: 'var(--spacing-lg)' }}>
                <CardBody>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--spacing-md)' }}>
                        <Checkbox
                            label="Send WhatsApp To SalesMan After Save"
                            name="sendWhatsapp"
                            checked={formData.sendWhatsapp}
                            onChange={handleChange}
                        />

                        <div style={{ display: 'flex', gap: 'var(--spacing-sm)', flexWrap: 'wrap' }}>
                            <Button variant="secondary" icon={Plus} onClick={handleNew}>
                                New
                            </Button>
                            <Button variant="primary" icon={Save} onClick={handleSave}>
                                Save
                            </Button>
                            <Button variant="secondary" icon={X} onClick={handleCancel}>
                                Cancel
                            </Button>
                            <Button variant="danger" icon={Trash2} onClick={handleDelete}>
                                Delete
                            </Button>
                            <Button variant="secondary" icon={LogOut} onClick={handleExit}>
                                Exit
                            </Button>
                        </div>
                    </div>
                </CardBody>
            </Card>

            {/* Section 4: Follow-Up History Table */}
            <Card>
                <CardHeader actions={
                    <Button variant="secondary" icon={FileSpreadsheet} onClick={() => {
                        const exportData = history.map(h => ({
                            'Contacted Date': h.contacted_date, 'Contacted Time': h.contacted_time,
                            'Type': h.follow_type, 'Appt. Date': h.appointment_date, 'Appt. Time': h.appointment_time,
                            'Remarks': h.remarks, 'Action Taken': h.action_taken, 'Location': h.location
                        }));
                        exportToExcel(exportData, 'FollowUp_History', 'History');
                    }}>
                        Export to Excel
                    </Button>
                }>Follow-Up History</CardHeader>
                <CardBody style={{ padding: 0 }}>
                    <DataTable
                        columns={historyColumns}
                        data={history}
                        searchable={false}
                        pagination={true}
                        pageSize={5}
                        emptyMessage="No follow-up history found"
                    />
                </CardBody>
            </Card>
        </div>
    );
}
