import { useState } from 'react';
import { Plus, Edit, Trash2, Search, FileSpreadsheet, Tractor, Save, X } from 'lucide-react';
import { Card, CardHeader, CardBody, Button, Input, Select, DataTable, Badge } from '../../components/UI';
import { useToast } from '../../context/ToastContext';
import { exportToExcel } from '../../utils/exportExcel';

const CATEGORY_OPTIONS = [
    { value: '', label: 'Select Category' },
    { value: 'Tractor', label: 'Tractor' },
    { value: 'Implement', label: 'Implement' },
    { value: 'Harvester', label: 'Harvester' },
    { value: 'Other', label: 'Other' },
];

const BRAND_OPTIONS = [
    { value: '', label: 'Select Brand' },
    { value: 'TAFE', label: 'TAFE' },
    { value: 'Massey Ferguson', label: 'Massey Ferguson' },
    { value: 'Eicher', label: 'Eicher' },
    { value: 'Mahindra', label: 'Mahindra' },
    { value: 'John Deere', label: 'John Deere' },
    { value: 'Swaraj', label: 'Swaraj' },
];

const FUEL_OPTIONS = [
    { value: '', label: 'Select Fuel' },
    { value: 'Diesel', label: 'Diesel' },
    { value: 'Electric', label: 'Electric' },
];

const STATUS_OPTIONS = [
    { value: 'Active', label: 'Active' },
    { value: 'Discontinued', label: 'Discontinued' },
];

// Seed data
const SEED_VEHICLES = [
    { id: 'v1', category: 'Tractor', brand: 'TAFE', model: 'TAFE 45 DI', hp: '45', engineCC: '2270', fuel: 'Diesel', exShowroom: '680000', warranty: '5 years / 2000 hrs', status: 'Active', remarks: 'Best seller – lightweight' },
    { id: 'v2', category: 'Tractor', brand: 'TAFE', model: 'TAFE 55 DI', hp: '55', engineCC: '2766', fuel: 'Diesel', exShowroom: '785000', warranty: '5 years / 2000 hrs', status: 'Active', remarks: 'Popular for medium farms' },
    { id: 'v3', category: 'Tractor', brand: 'TAFE', model: 'TAFE 9000 DI', hp: '90', engineCC: '4400', fuel: 'Diesel', exShowroom: '1250000', warranty: '5 years / 2000 hrs', status: 'Active', remarks: 'Heavy-duty, large acreage' },
    { id: 'v4', category: 'Tractor', brand: 'TAFE', model: 'TAFE 7502', hp: '75', engineCC: '3300', fuel: 'Diesel', exShowroom: '950000', warranty: '5 years / 2000 hrs', status: 'Active', remarks: '' },
    { id: 'v5', category: 'Tractor', brand: 'Massey Ferguson', model: 'Massey Ferguson 1035', hp: '35', engineCC: '1800', fuel: 'Diesel', exShowroom: '560000', warranty: '5 years', status: 'Active', remarks: 'Entry-level, widely used' },
    { id: 'v6', category: 'Tractor', brand: 'Massey Ferguson', model: 'Massey Ferguson 8055', hp: '55', engineCC: '2730', fuel: 'Diesel', exShowroom: '790000', warranty: '5 years', status: 'Active', remarks: 'Good resale value' },
    { id: 'v7', category: 'Tractor', brand: 'Eicher', model: 'Eicher 380', hp: '38', engineCC: '2100', fuel: 'Diesel', exShowroom: '590000', warranty: '4 years', status: 'Discontinued', remarks: 'Phased out' },
];

const EMPTY_FORM = {
    category: 'Tractor', brand: 'TAFE', model: '', hp: '', engineCC: '',
    fuel: 'Diesel', exShowroom: '', warranty: '', status: 'Active', remarks: '',
};

export default function VehicleMaster() {
    const toast = useToast();
    const [vehicles, setVehicles] = useState(SEED_VEHICLES);
    const [showForm, setShowForm] = useState(false);
    const [editId, setEditId] = useState(null);
    const [form, setForm] = useState(EMPTY_FORM);
    const [errors, setErrors] = useState({});
    const [search, setSearch] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(p => ({ ...p, [name]: value }));
        if (errors[name]) setErrors(p => ({ ...p, [name]: '' }));
    };

    const validate = () => {
        const e = {};
        if (!form.brand) e.brand = 'Required';
        if (!form.model) e.model = 'Required';
        if (!form.category) e.category = 'Required';
        if (!form.hp) e.hp = 'Required';
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSave = () => {
        if (!validate()) { toast.error('Please fix the errors'); return; }
        if (editId) {
            setVehicles(p => p.map(v => v.id === editId ? { ...v, ...form } : v));
            toast.success('Vehicle updated successfully!');
        } else {
            setVehicles(p => [{ ...form, id: `v${Date.now()}` }, ...p]);
            toast.success('Vehicle added successfully!');
        }
        setShowForm(false); setEditId(null); setForm(EMPTY_FORM); setErrors({});
    };

    const handleEdit = (v) => {
        setForm({ ...v }); setEditId(v.id); setShowForm(true);
    };

    const handleDelete = (id) => {
        if (!confirm('Delete this vehicle record?')) return;
        setVehicles(p => p.filter(v => v.id !== id));
        toast.success('Vehicle deleted.');
    };

    const handleExport = () => {
        exportToExcel(
            vehicles.map(v => ({
                Category: v.category, Brand: v.brand, Model: v.model,
                'HP': v.hp, 'Engine CC': v.engineCC, Fuel: v.fuel,
                'Ex-Showroom (₹)': v.exShowroom, Warranty: v.warranty,
                Status: v.status, Remarks: v.remarks,
            })),
            'Vehicle_Master', 'Vehicles'
        );
    };

    const filtered = vehicles.filter(v =>
        !search || [v.model, v.brand, v.category, v.hp].join(' ').toLowerCase().includes(search.toLowerCase())
    );

    const activeCount = vehicles.filter(v => v.status === 'Active').length;

    const columns = [
        {
            key: 'model', label: 'Model', render: (v, row) => (
                <div>
                    <div style={{ fontWeight: 600 }}>{v}</div>
                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>{row.brand}</div>
                </div>
            )
        },
        { key: 'category', label: 'Category', render: v => <Badge variant="info">{v}</Badge> },
        { key: 'hp', label: 'HP', render: v => v ? `${v} HP` : '—' },
        { key: 'engineCC', label: 'Engine CC', render: v => v ? `${v} cc` : '—' },
        { key: 'fuel', label: 'Fuel', render: v => v || '—' },
        {
            key: 'exShowroom', label: 'Ex-Showroom',
            render: v => v ? <span style={{ fontWeight: 600, color: 'var(--color-primary)' }}>₹{parseInt(v).toLocaleString('en-IN')}</span> : '—'
        },
        { key: 'warranty', label: 'Warranty', render: v => v || '—' },
        { key: 'status', label: 'Status', render: v => <Badge variant={v === 'Active' ? 'success' : 'secondary'}>{v}</Badge> },
        {
            key: 'actions', label: 'Actions', sortable: false, render: (_, row) => (
                <div style={{ display: 'flex', gap: 'var(--spacing-xs)' }}>
                    <Button variant="ghost" icon={Edit} onClick={() => handleEdit(row)}>Edit</Button>
                    <Button variant="ghost" icon={Trash2} onClick={() => handleDelete(row.id)}>Del</Button>
                </div>
            )
        },
    ];

    return (
        <div>
            <div className="page-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                    <Tractor size={20} style={{ color: 'var(--color-primary)' }} />
                    <span style={{ fontWeight: 600, fontSize: 'var(--font-size-lg)' }}>
                        Vehicle Master &nbsp;
                        <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 400, color: 'var(--color-text-muted)' }}>
                            ({activeCount} active of {vehicles.length})
                        </span>
                    </span>
                </div>
                <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
                    <Button variant="secondary" icon={FileSpreadsheet} onClick={handleExport}>Export</Button>
                    <Button variant="primary" icon={Plus} onClick={() => { setForm(EMPTY_FORM); setEditId(null); setErrors({}); setShowForm(true); }}>
                        Add Vehicle
                    </Button>
                </div>
            </div>

            {/* Add / Edit form */}
            {showForm && (
                <Card style={{ marginBottom: 'var(--spacing-lg)' }}>
                    <CardHeader actions={
                        <Button variant="ghost" icon={X} onClick={() => { setShowForm(false); setEditId(null); setErrors({}); }}>Cancel</Button>
                    }>
                        {editId ? 'Edit Vehicle' : 'Add New Vehicle'}
                    </CardHeader>
                    <CardBody>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--spacing-md)' }}>
                            <Select label="Category *" name="category" value={form.category} onChange={handleChange} options={CATEGORY_OPTIONS} error={errors.category} />
                            <Select label="Brand *" name="brand" value={form.brand} onChange={handleChange} options={BRAND_OPTIONS} error={errors.brand} />
                            <Input label="Model Name *" name="model" value={form.model} onChange={handleChange} placeholder="e.g. TAFE 45 DI" error={errors.model} />
                            <Input label="Horse Power (HP) *" name="hp" type="number" value={form.hp} onChange={handleChange} placeholder="e.g. 45" error={errors.hp} />
                            <Input label="Engine CC" name="engineCC" type="number" value={form.engineCC} onChange={handleChange} placeholder="e.g. 2270" />
                            <Select label="Fuel Type" name="fuel" value={form.fuel} onChange={handleChange} options={FUEL_OPTIONS} />
                            <Input label="Ex-Showroom Price (₹)" name="exShowroom" type="number" value={form.exShowroom} onChange={handleChange} placeholder="e.g. 680000" />
                            <Input label="Warranty" name="warranty" value={form.warranty} onChange={handleChange} placeholder="e.g. 5 years / 2000 hrs" />
                            <Select label="Status" name="status" value={form.status} onChange={handleChange} options={STATUS_OPTIONS} />
                        </div>
                        <div style={{ marginTop: 'var(--spacing-md)' }}>
                            <Input label="Remarks" name="remarks" value={form.remarks} onChange={handleChange} placeholder="Optional remarks..." />
                        </div>
                        <div style={{ marginTop: 'var(--spacing-md)', display: 'flex', gap: 'var(--spacing-sm)', justifyContent: 'flex-end' }}>
                            <Button variant="secondary" icon={X} onClick={() => { setShowForm(false); setEditId(null); }}>Cancel</Button>
                            <Button variant="primary" icon={Save} onClick={handleSave}>
                                {editId ? 'Update Vehicle' : 'Save Vehicle'}
                            </Button>
                        </div>
                    </CardBody>
                </Card>
            )}

            {/* Search */}
            <div style={{ marginBottom: 'var(--spacing-md)' }}>
                <Input
                    placeholder="Search by model, brand, category, HP..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
            </div>

            {/* Stats strip */}
            <div style={{ display: 'flex', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-md)', flexWrap: 'wrap' }}>
                {['Tractor', 'Implement', 'Harvester', 'Other'].map(cat => {
                    const count = vehicles.filter(v => v.category === cat && v.status === 'Active').length;
                    if (!count) return null;
                    return (
                        <div key={cat} style={{ padding: 'var(--spacing-sm) var(--spacing-md)', borderRadius: 'var(--radius-lg)', background: 'var(--color-primary-light)', fontSize: 'var(--font-size-sm)', fontWeight: 600, color: 'var(--color-primary)' }}>
                            🚜 {count} {cat}{count !== 1 ? 's' : ''}
                        </div>
                    );
                })}
            </div>

            <Card>
                <CardBody style={{ padding: 0 }}>
                    <DataTable
                        columns={columns}
                        data={filtered}
                        searchable={false}
                        pagination
                        pageSize={10}
                    />
                </CardBody>
            </Card>
        </div>
    );
}
