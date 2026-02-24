import { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';

const ToastContext = createContext(null);

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
}

const icons = {
    success: CheckCircle,
    error: AlertCircle,
    warning: AlertTriangle,
    info: Info
};

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((message, type = 'info', title = '') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type, title }]);

        setTimeout(() => {
            setToasts(prev => prev.filter(toast => toast.id !== id));
        }, 5000);
    }, []);

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    }, []);

    const toast = {
        success: (message, title = 'Success') => addToast(message, 'success', title),
        error: (message, title = 'Error') => addToast(message, 'error', title),
        warning: (message, title = 'Warning') => addToast(message, 'warning', title),
        info: (message, title = 'Info') => addToast(message, 'info', title)
    };

    return (
        <ToastContext.Provider value={toast}>
            {children}
            <div className="toast-container">
                {toasts.map(t => {
                    const Icon = icons[t.type];
                    return (
                        <div key={t.id} className={`toast ${t.type}`}>
                            <Icon className="toast-icon" />
                            <div className="toast-content">
                                {t.title && <div className="toast-title">{t.title}</div>}
                                <div className="toast-message">{t.message}</div>
                            </div>
                            <button
                                className="toast-close"
                                onClick={() => removeToast(t.id)}
                            >
                                <X size={16} />
                            </button>
                        </div>
                    );
                })}
            </div>
        </ToastContext.Provider>
    );
}
