import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, Check } from 'lucide-react';

export function Select({
    label,
    name,
    value,
    onChange,
    options = [],
    placeholder = 'Select an option',
    required = false,
    searchable = false,
    error,
    disabled = false,
    className = ''
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const selectRef = useRef(null);

    const selectedOption = options.find(opt => opt.value === value);

    const filteredOptions = searchable
        ? options.filter(opt =>
            opt.label.toLowerCase().includes(searchQuery.toLowerCase())
        )
        : options;

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (selectRef.current && !selectRef.current.contains(event.target)) {
                setIsOpen(false);
                setSearchQuery('');
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (optionValue) => {
        onChange({ target: { name, value: optionValue } });
        setIsOpen(false);
        setSearchQuery('');
    };

    return (
        <div className={`form-group ${className}`} ref={selectRef}>
            {label && (
                <label className={`form-label ${required ? 'required' : ''}`}>
                    {label}
                </label>
            )}
            <div style={{ position: 'relative' }}>
                <button
                    type="button"
                    className={`form-input ${error ? 'error' : ''}`}
                    onClick={() => !disabled && setIsOpen(!isOpen)}
                    disabled={disabled}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: disabled ? 'not-allowed' : 'pointer',
                        textAlign: 'left'
                    }}
                >
                    <span style={{ color: selectedOption ? 'var(--color-text-primary)' : 'var(--color-text-muted)' }}>
                        {selectedOption ? selectedOption.label : placeholder}
                    </span>
                    <ChevronDown size={16} style={{
                        transition: 'transform 0.2s',
                        transform: isOpen ? 'rotate(180deg)' : 'rotate(0)'
                    }} />
                </button>

                {isOpen && (
                    <div style={{
                        position: 'absolute',
                        top: 'calc(100% + 4px)',
                        left: 0,
                        right: 0,
                        background: 'var(--color-card)',
                        border: '1px solid var(--color-border)',
                        borderRadius: 'var(--radius-md)',
                        boxShadow: 'var(--shadow-lg)',
                        zIndex: 100,
                        maxHeight: '240px',
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column'
                    }}>
                        {searchable && (
                            <div style={{ padding: 'var(--spacing-sm)', borderBottom: '1px solid var(--color-border)' }}>
                                <div style={{ position: 'relative' }}>
                                    <Search size={16} style={{
                                        position: 'absolute',
                                        left: '10px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        color: 'var(--color-text-muted)'
                                    }} />
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Search..."
                                        className="form-input"
                                        style={{ paddingLeft: '32px' }}
                                        autoFocus
                                    />
                                </div>
                            </div>
                        )}
                        <div style={{ overflow: 'auto', flex: 1 }}>
                            {filteredOptions.length === 0 ? (
                                <div style={{
                                    padding: 'var(--spacing-md)',
                                    textAlign: 'center',
                                    color: 'var(--color-text-muted)',
                                    fontSize: 'var(--font-size-sm)'
                                }}>
                                    No options found
                                </div>
                            ) : (
                                filteredOptions.map(option => (
                                    <button
                                        key={option.value}
                                        type="button"
                                        onClick={() => handleSelect(option.value)}
                                        style={{
                                            width: '100%',
                                            padding: 'var(--spacing-sm) var(--spacing-md)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            background: option.value === value ? 'var(--color-primary-light)' : 'transparent',
                                            border: 'none',
                                            cursor: 'pointer',
                                            fontSize: 'var(--font-size-sm)',
                                            color: option.value === value ? 'var(--color-primary)' : 'var(--color-text-primary)',
                                            textAlign: 'left'
                                        }}
                                        onMouseEnter={(e) => {
                                            if (option.value !== value) {
                                                e.target.style.background = 'var(--color-background)';
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            if (option.value !== value) {
                                                e.target.style.background = 'transparent';
                                            }
                                        }}
                                    >
                                        <span>{option.label}</span>
                                        {option.value === value && <Check size={16} />}
                                    </button>
                                ))
                            )}
                        </div>
                    </div>
                )}
            </div>
            {error && <div className="form-error">{error}</div>}
        </div>
    );
}
