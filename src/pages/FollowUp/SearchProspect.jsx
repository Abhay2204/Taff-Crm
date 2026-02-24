import { useState } from 'react';
import { Search as SearchIcon, Filter, X, FileSpreadsheet } from 'lucide-react';
import { Card, CardHeader, CardBody, Button, Input, Select, DataTable, Badge } from '../../components/UI';
import { exportToExcel } from '../../utils/exportExcel';

const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'New', label: 'New' },
    { value: 'Contacted', label: 'Contacted' },
    { value: 'Follow Up', label: 'Follow Up' },
    { value: 'Qualified', label: 'Qualified' },
    { value: 'Converted', label: 'Converted' },
    { value: 'Lost', label: 'Lost' },
];

const sourceOptions = [
    { value: '', label: 'All Sources' },
    { value: 'Website', label: 'Website' },
    { value: 'Referral', label: 'Referral' },
    { value: 'Walk-in', label: 'Walk-in' },
    { value: 'Phone', label: 'Phone' },
    { value: 'Email', label: 'Email' },
    { value: 'Social', label: 'Social Media' },
];

// Sample data
const prospectsData = [
    { id: 1, refNo: 'PRO-001', name: 'John Smith', mobile: '9876543210', email: 'john@email.com', source: 'Website', status: 'New', city: 'Mumbai' },
    { id: 2, refNo: 'PRO-002', name: 'Sarah Johnson', mobile: '9876543211', email: 'sarah@email.com', source: 'Referral', status: 'Contacted', city: 'Delhi' },
    { id: 3, refNo: 'PRO-003', name: 'Mike Chen', mobile: '9876543212', email: 'mike@email.com', source: 'Walk-in', status: 'Follow Up', city: 'Bangalore' },
    { id: 4, refNo: 'PRO-004', name: 'Emily Davis', mobile: '9876543213', email: 'emily@email.com', source: 'Phone', status: 'Qualified', city: 'Chennai' },
    { id: 5, refNo: 'PRO-005', name: 'Robert Wilson', mobile: '9876543214', email: 'robert@email.com', source: 'Email', status: 'New', city: 'Pune' },
];

const columns = [
    { key: 'refNo', label: 'Ref No.' },
    { key: 'name', label: 'Name' },
    { key: 'mobile', label: 'Mobile' },
    { key: 'email', label: 'Email' },
    { key: 'city', label: 'City' },
    { key: 'source', label: 'Source' },
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
                'Lost': 'danger'
            };
            return <Badge variant={variants[value] || 'secondary'}>{value}</Badge>;
        }
    },
];

export default function SearchProspect() {
    const [searchParams, setSearchParams] = useState({
        name: '',
        mobile: '',
        email: '',
        refNo: '',
        city: '',
        source: '',
        status: '',
        fromDate: '',
        toDate: ''
    });

    const [results, setResults] = useState([]);
    const [hasSearched, setHasSearched] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setSearchParams(prev => ({ ...prev, [name]: value }));
    };

    const handleSearch = (e) => {
        e.preventDefault();
        // Simulate search
        setResults(prospectsData);
        setHasSearched(true);
    };

    const handleReset = () => {
        setSearchParams({
            name: '',
            mobile: '',
            email: '',
            refNo: '',
            city: '',
            source: '',
            status: '',
            fromDate: '',
            toDate: ''
        });
        setResults([]);
        setHasSearched(false);
    };

    return (
        <div>
            {/* Search Form */}
            <Card style={{ marginBottom: 'var(--spacing-lg)' }}>
                <CardHeader>
                    <Filter size={18} style={{ marginRight: 'var(--spacing-sm)' }} />
                    Search Criteria
                </CardHeader>
                <CardBody>
                    <form onSubmit={handleSearch}>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                            gap: 'var(--spacing-md)'
                        }}>
                            <Input
                                label="Prospect Name"
                                name="name"
                                value={searchParams.name}
                                onChange={handleChange}
                                placeholder="Enter name"
                            />
                            <Input
                                label="Mobile Number"
                                name="mobile"
                                value={searchParams.mobile}
                                onChange={handleChange}
                                placeholder="Enter mobile"
                            />
                            <Input
                                label="Email"
                                name="email"
                                value={searchParams.email}
                                onChange={handleChange}
                                placeholder="Enter email"
                            />
                            <Input
                                label="Reference No."
                                name="refNo"
                                value={searchParams.refNo}
                                onChange={handleChange}
                                placeholder="Enter ref no."
                            />
                            <Input
                                label="City"
                                name="city"
                                value={searchParams.city}
                                onChange={handleChange}
                                placeholder="Enter city"
                            />
                            <Select
                                label="Source"
                                name="source"
                                value={searchParams.source}
                                onChange={handleChange}
                                options={sourceOptions}
                            />
                            <Select
                                label="Status"
                                name="status"
                                value={searchParams.status}
                                onChange={handleChange}
                                options={statusOptions}
                            />
                            <Input
                                label="From Date"
                                name="fromDate"
                                type="date"
                                value={searchParams.fromDate}
                                onChange={handleChange}
                            />
                            <Input
                                label="To Date"
                                name="toDate"
                                type="date"
                                value={searchParams.toDate}
                                onChange={handleChange}
                            />
                        </div>

                        <div style={{
                            display: 'flex',
                            justifyContent: 'flex-end',
                            gap: 'var(--spacing-sm)',
                            marginTop: 'var(--spacing-lg)'
                        }}>
                            <Button variant="secondary" icon={X} onClick={handleReset} type="button">
                                Reset
                            </Button>
                            <Button variant="primary" icon={SearchIcon} type="submit">
                                Search
                            </Button>
                        </div>
                    </form>
                </CardBody>
            </Card>

            {/* Results */}
            {hasSearched && (
                <Card>
                    <CardHeader actions={
                        results.length > 0 && <Button variant="secondary" icon={FileSpreadsheet} onClick={() => {
                            const exportData = results.map(r => ({
                                'Ref No': r.refNo, 'Name': r.name, 'Mobile': r.mobile,
                                'Email': r.email, 'City': r.city, 'Source': r.source, 'Status': r.status
                            }));
                            exportToExcel(exportData, 'Search_Results', 'Prospects');
                        }}>Export to Excel</Button>
                    }>
                        Search Results ({results.length} found)
                    </CardHeader>
                    <CardBody style={{ padding: 0 }}>
                        <DataTable
                            columns={columns}
                            data={results}
                            searchable={false}
                            pagination={true}
                            pageSize={10}
                            emptyMessage="No prospects found matching your criteria"
                        />
                    </CardBody>
                </Card>
            )}
        </div>
    );
}
