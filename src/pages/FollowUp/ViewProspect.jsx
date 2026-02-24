import { useState } from 'react';
import { Eye, Edit, Trash2, Phone, Plus, FileSpreadsheet } from 'lucide-react';
import { Card, CardHeader, CardBody, Button, DataTable, Badge, Select } from '../../components/UI';
import { useNavigate } from 'react-router-dom';
import { exportToExcel } from '../../utils/exportExcel';

const talukaFilterOptions = [
    { value: '', label: 'All Talukas' },
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

// Sample data
const prospectsData = [
    { id: 1, refNo: 'PRO-001', name: 'John Smith', mobile: '9876543210', taluka: 'Chandrapur', status: 'New', createdAt: '2026-02-02' },
    { id: 2, refNo: 'PRO-002', name: 'Sarah Johnson', mobile: '9876543211', taluka: 'Mul', status: 'Contacted', createdAt: '2026-02-01' },
    { id: 3, refNo: 'PRO-003', name: 'Mike Chen', mobile: '9876543212', taluka: 'Bramhapuri', status: 'Follow Up', createdAt: '2026-02-01' },
    { id: 4, refNo: 'PRO-004', name: 'Emily Davis', mobile: '9876543213', taluka: 'Warora', status: 'Qualified', createdAt: '2026-01-31' },
    { id: 5, refNo: 'PRO-005', name: 'Robert Wilson', mobile: '9876543214', taluka: 'Chandrapur', status: 'New', createdAt: '2026-01-31' },
    { id: 6, refNo: 'PRO-006', name: 'Lisa Brown', mobile: '9876543215', taluka: 'Mul', status: 'Converted', createdAt: '2026-01-30' },
    { id: 7, refNo: 'PRO-007', name: 'James Taylor', mobile: '9876543216', taluka: 'Bramhapuri', status: 'Lost', createdAt: '2026-01-30' },
    { id: 8, refNo: 'PRO-008', name: 'Maria Garcia', mobile: '9876543217', taluka: 'Chimur', status: 'New', createdAt: '2026-01-29' },
    { id: 9, refNo: 'PRO-009', name: 'David Lee', mobile: '9876543218', taluka: 'Chandrapur', status: 'Contacted', createdAt: '2026-01-29' },
    { id: 10, refNo: 'PRO-010', name: 'Anna White', mobile: '9876543219', taluka: 'Warora', status: 'Follow Up', createdAt: '2026-01-28' },
];

export default function ViewProspect() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('all');
    const [talukaFilter, setTalukaFilter] = useState('');

    const columns = [
        { key: 'refNo', label: 'Ref No.', width: '100px' },
        { key: 'name', label: 'Name' },
        { key: 'mobile', label: 'Mobile' },
        { key: 'taluka', label: 'Taluka' },
        {
            key: 'status',
            label: 'Status',
            render: (value) => {
                const variants = {
                    'New': 'info',
                    'Contacted': 'warning',
                    'Follow Up': 'warning',
                    'Qualified': 'success',
                    'Converted': 'success',
                    'Delivered': 'success',
                    'Lost': 'danger'
                };
                return <Badge variant={variants[value] || 'secondary'}>{value}</Badge>;
            }
        },
        { key: 'createdAt', label: 'Created', width: '100px' },
        {
            key: 'actions',
            label: 'Actions',
            sortable: false,
            render: (_, row) => (
                <div className="table-actions">
                    <Button variant="ghost" size="sm" title="View">
                        <Eye size={16} />
                    </Button>
                    <Button variant="ghost" size="sm" title="Edit">
                        <Edit size={16} />
                    </Button>
                    <Button variant="ghost" size="sm" title="Call">
                        <Phone size={16} />
                    </Button>
                </div>
            )
        }
    ];

    const tabs = [
        { key: 'all', label: 'All Prospects', count: prospectsData.length },
        { key: 'new', label: 'New', count: prospectsData.filter(p => p.status === 'New').length },
        { key: 'follow-up', label: 'Follow Up', count: prospectsData.filter(p => p.status === 'Follow Up').length },
        { key: 'qualified', label: 'Qualified', count: prospectsData.filter(p => p.status === 'Qualified').length },
        { key: 'converted', label: 'Converted', count: prospectsData.filter(p => p.status === 'Converted').length },
    ];

    // Apply tab + taluka filter
    let filteredData = activeTab === 'all'
        ? prospectsData
        : prospectsData.filter(p => {
            if (activeTab === 'new') return p.status === 'New';
            if (activeTab === 'follow-up') return p.status === 'Follow Up' || p.status === 'Contacted';
            if (activeTab === 'qualified') return p.status === 'Qualified';
            if (activeTab === 'converted') return p.status === 'Converted';
            return true;
        });

    if (talukaFilter) {
        filteredData = filteredData.filter(p => p.taluka === talukaFilter);
    }

    const handleExport = () => {
        const exportData = filteredData.map(p => ({
            'Ref No': p.refNo,
            'Name': p.name,
            'Mobile': p.mobile,
            'Taluka': p.taluka,
            'Status': p.status,
            'Created Date': p.createdAt
        }));
        exportToExcel(exportData, 'Prospects', 'Prospects');
    };

    return (
        <div>
            <div className="page-header">
                <div className="filter-tabs">
                    {tabs.map(tab => (
                        <button
                            key={tab.key}
                            className={`filter-tab ${activeTab === tab.key ? 'active' : ''}`}
                            onClick={() => setActiveTab(tab.key)}
                        >
                            {tab.label} ({tab.count})
                        </button>
                    ))}
                </div>
                <div style={{ display: 'flex', gap: 'var(--spacing-sm)', alignItems: 'center' }}>
                    <div style={{ minWidth: '160px' }}>
                        <Select
                            name="talukaFilter"
                            value={talukaFilter}
                            onChange={(e) => setTalukaFilter(e.target.value)}
                            options={talukaFilterOptions}
                            placeholder="Filter by Taluka"
                        />
                    </div>
                    <Button
                        variant="secondary"
                        icon={FileSpreadsheet}
                        onClick={handleExport}
                    >
                        Export to Excel
                    </Button>
                    <Button
                        variant="primary"
                        icon={Plus}
                        onClick={() => navigate('/follow-up/prospect')}
                    >
                        New Prospect
                    </Button>
                </div>
            </div>

            <Card>
                <CardBody style={{ padding: 0 }}>
                    <DataTable
                        columns={columns}
                        data={filteredData}
                        searchable={true}
                        searchPlaceholder="Search by name, mobile..."
                        pagination={true}
                        pageSize={10}
                    />
                </CardBody>
            </Card>
        </div>
    );
}
