import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

// Default admin credentials
const ADMIN_CREDENTIALS = {
    username: 'admin',
    password: 'admin@123'
};

export function AuthProvider({ children }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [adminUser, setAdminUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // Check localStorage on mount
    useEffect(() => {
        const storedAuth = localStorage.getItem('crm_auth');
        if (storedAuth) {
            try {
                const authData = JSON.parse(storedAuth);
                if (authData.isAuthenticated && authData.loginTime) {
                    // Session expires after 24 hours
                    const now = Date.now();
                    const loginTime = authData.loginTime;
                    const twentyFourHours = 24 * 60 * 60 * 1000;

                    if (now - loginTime < twentyFourHours) {
                        setIsAuthenticated(true);
                        setAdminUser(authData.user);
                    } else {
                        // Session expired
                        localStorage.removeItem('crm_auth');
                    }
                }
            } catch {
                localStorage.removeItem('crm_auth');
            }
        }
        setIsLoading(false);
    }, []);

    const login = (username, password) => {
        if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
            const user = {
                username: ADMIN_CREDENTIALS.username,
                name: 'Admin Sales',
                role: 'Sales Manager'
            };
            const authData = {
                isAuthenticated: true,
                user,
                loginTime: Date.now()
            };
            localStorage.setItem('crm_auth', JSON.stringify(authData));
            setIsAuthenticated(true);
            setAdminUser(user);
            return { success: true };
        }
        return { success: false, error: 'Invalid username or password' };
    };

    const logout = () => {
        localStorage.removeItem('crm_auth');
        setIsAuthenticated(false);
        setAdminUser(null);
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, adminUser, isLoading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
