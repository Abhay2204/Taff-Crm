export function Badge({ children, variant = 'secondary' }) {
    return (
        <span className={`badge badge-${variant}`}>
            {children}
        </span>
    );
}

export function StatCard({ icon: Icon, value, label, change, changeType = 'positive', iconColor = 'primary' }) {
    return (
        <div className="stat-card">
            <div className={`stat-icon ${iconColor}`}>
                <Icon />
            </div>
            <div className="stat-content">
                <div className="stat-value">{value}</div>
                <div className="stat-label">{label}</div>
                {change && (
                    <div className={`stat-change ${changeType}`}>
                        {changeType === 'positive' ? '↑' : '↓'} {change}
                    </div>
                )}
            </div>
        </div>
    );
}
