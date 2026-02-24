import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Building2, Lock, User, Eye, EyeOff, Shield, AlertCircle } from 'lucide-react';

export default function LoginPage() {
    const { login, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [mounted, setMounted] = useState(false);
    const usernameRef = useRef(null);

    useEffect(() => {
        setMounted(true);
        usernameRef.current?.focus();
    }, []);

    // Redirect if already authenticated
    useEffect(() => {
        if (isAuthenticated) {
            navigate('/', { replace: true });
        }
    }, [isAuthenticated, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!username.trim() || !password.trim()) {
            setError('Please enter both username and password');
            return;
        }

        setIsSubmitting(true);

        // Small delay for UX feel
        await new Promise(resolve => setTimeout(resolve, 600));

        const result = login(username.trim(), password);

        if (result.success) {
            // Navigate will happen via the useEffect above
        } else {
            setError(result.error);
        }
        setIsSubmitting(false);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleSubmit(e);
        }
    };

    return (
        <div className="login-page">


            <div className={`login-container ${mounted ? 'login-visible' : ''}`}>
                {/* Left Panel - Branding */}
                <div className="login-branding">
                    <div className="login-branding-content">
                        <div className="login-branding-icon">
                            <Shield size={48} />
                        </div>
                        <h1 className="login-branding-title">CHANDRAPUR MOTORS<br />& TRACTORS</h1>
                        <p className="login-branding-subtitle">TAFE : 25-26</p>
                        <div className="login-branding-divider"></div>
                    </div>
                    <div className="login-branding-footer">
                        <div className="login-branding-credit">
                            <span>Designed by</span>
                            <strong>Back2Source Software Solutions</strong>
                        </div>
                    </div>
                </div>

                {/* Right Panel - Login Form */}
                <div className="login-form-panel">
                    <div className="login-form-wrapper">
                        <div className="login-form-header">
                            <div className="login-admin-badge">
                                <Lock size={16} />
                                <span>ADMIN ACCESS</span>
                            </div>
                            <h2 className="login-form-title">Welcome Back</h2>
                            <p className="login-form-subtitle">Enter your credentials to access the admin panel</p>
                        </div>

                        <form onSubmit={handleSubmit} className="login-form" autoComplete="off">
                            {error && (
                                <div className="login-error">
                                    <AlertCircle size={16} />
                                    <span>{error}</span>
                                </div>
                            )}

                            <div className="login-field">
                                <label htmlFor="login-username" className="login-label">Username</label>
                                <div className={`login-input-wrapper ${username ? 'has-value' : ''}`}>
                                    <User size={18} className="login-input-icon" />
                                    <input
                                        ref={usernameRef}
                                        id="login-username"
                                        type="text"
                                        className="login-input"
                                        placeholder="Enter your username"
                                        value={username}
                                        onChange={(e) => { setUsername(e.target.value); setError(''); }}
                                        onKeyDown={handleKeyDown}
                                        disabled={isSubmitting}
                                        autoComplete="off"
                                    />
                                </div>
                            </div>

                            <div className="login-field">
                                <label htmlFor="login-password" className="login-label">Password</label>
                                <div className={`login-input-wrapper ${password ? 'has-value' : ''}`}>
                                    <Lock size={18} className="login-input-icon" />
                                    <input
                                        id="login-password"
                                        type={showPassword ? 'text' : 'password'}
                                        className="login-input"
                                        placeholder="Enter your password"
                                        value={password}
                                        onChange={(e) => { setPassword(e.target.value); setError(''); }}
                                        onKeyDown={handleKeyDown}
                                        disabled={isSubmitting}
                                        autoComplete="off"
                                    />
                                    <button
                                        type="button"
                                        className="login-toggle-pw"
                                        onClick={() => setShowPassword(!showPassword)}
                                        tabIndex={-1}
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                className={`login-submit ${isSubmitting ? 'login-submitting' : ''}`}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <>
                                        <div className="login-spinner"></div>
                                        <span>Authenticating...</span>
                                    </>
                                ) : (
                                    <>
                                        <Lock size={18} />
                                        <span>Sign In</span>
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="login-form-footer">
                            <p>Secure admin-only access. Unauthorized access is prohibited.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
