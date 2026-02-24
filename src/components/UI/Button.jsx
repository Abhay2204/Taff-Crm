export function Button({
    children,
    variant = 'primary',
    size = 'md',
    icon: Icon,
    iconPosition = 'left',
    disabled = false,
    type = 'button',
    onClick,
    className = ''
}) {
    const sizeClass = size === 'sm' ? 'btn-sm' : size === 'lg' ? 'btn-lg' : '';

    return (
        <button
            type={type}
            className={`btn btn-${variant} ${sizeClass} ${className}`}
            disabled={disabled}
            onClick={onClick}
        >
            {Icon && iconPosition === 'left' && <Icon />}
            {children}
            {Icon && iconPosition === 'right' && <Icon />}
        </button>
    );
}
