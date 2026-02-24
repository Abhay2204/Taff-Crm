export function Checkbox({
    label,
    name,
    checked,
    onChange,
    disabled = false,
    className = ''
}) {
    return (
        <label className={`form-check ${className}`}>
            <input
                type="checkbox"
                name={name}
                checked={checked}
                onChange={onChange}
                disabled={disabled}
                className="form-check-input"
            />
            <span className="form-check-label">{label}</span>
        </label>
    );
}

export function Radio({
    label,
    name,
    value,
    checked,
    onChange,
    disabled = false,
    className = ''
}) {
    return (
        <label className={`form-check ${className}`}>
            <input
                type="radio"
                name={name}
                value={value}
                checked={checked}
                onChange={onChange}
                disabled={disabled}
                className="form-check-input"
            />
            <span className="form-check-label">{label}</span>
        </label>
    );
}

export function CheckboxGroup({ label, children, className = '' }) {
    return (
        <div className={`form-group ${className}`}>
            {label && <label className="form-label">{label}</label>}
            <div className="form-check-group">
                {children}
            </div>
        </div>
    );
}

export function RadioGroup({ label, children, className = '' }) {
    return (
        <div className={`form-group ${className}`}>
            {label && <label className="form-label">{label}</label>}
            <div className="form-check-group">
                {children}
            </div>
        </div>
    );
}
