export function Card({ children, className = '' }) {
    return (
        <div className={`card ${className}`}>
            {children}
        </div>
    );
}

export function CardHeader({ children, className = '', actions }) {
    return (
        <div className={`card-header ${className}`}>
            <div className="card-title">{children}</div>
            {actions && <div className="card-actions">{actions}</div>}
        </div>
    );
}

export function CardBody({ children, className = '' }) {
    return (
        <div className={`card-body ${className}`}>
            {children}
        </div>
    );
}

export function CardFooter({ children, className = '' }) {
    return (
        <div className={`card-footer ${className}`}>
            {children}
        </div>
    );
}
