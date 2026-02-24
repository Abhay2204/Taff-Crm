export function Input({
    label,
    type = 'text',
    name,
    value,
    onChange,
    placeholder,
    required = false,
    error,
    hint,
    disabled = false,
    className = ''
}) {
    return (
        <div className={`form-group ${className}`}>
            {label && (
                <label htmlFor={name} className={`form-label ${required ? 'required' : ''}`}>
                    {label}
                </label>
            )}
            <input
                type={type}
                id={name}
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                disabled={disabled}
                className={`form-input ${error ? 'error' : ''}`}
            />
            {error && <div className="form-error">{error}</div>}
            {hint && !error && <div className="form-hint">{hint}</div>}
        </div>
    );
}

export function Textarea({
    label,
    name,
    value,
    onChange,
    placeholder,
    required = false,
    error,
    hint,
    disabled = false,
    rows = 4,
    className = ''
}) {
    return (
        <div className={`form-group ${className}`}>
            {label && (
                <label htmlFor={name} className={`form-label ${required ? 'required' : ''}`}>
                    {label}
                </label>
            )}
            <textarea
                id={name}
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                disabled={disabled}
                rows={rows}
                className={`form-textarea ${error ? 'error' : ''}`}
            />
            {error && <div className="form-error">{error}</div>}
            {hint && !error && <div className="form-hint">{hint}</div>}
        </div>
    );
}
