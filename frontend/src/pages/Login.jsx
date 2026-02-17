import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiMail, FiLock, FiEye, FiEyeOff, FiArrowRight } from 'react-icons/fi';
import './Auth.css';

const Login = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        
        const result = await login(formData.email, formData.password);
        
        setLoading(false);
        if (result.success) {
            navigate('/dashboard');
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-bg"></div>
            <div className="auth-container">
                <div className="auth-card animate-slide-up">
                    <div className="auth-header">
                        <Link to="/" className="auth-logo">
                            <span className="logo-icon">🍎</span>
                        </Link>
                        <h1>Welcome Back!</h1>
                        <p>Log in to continue your nutrition journey</p>
                    </div>

                    <form onSubmit={handleSubmit} className="auth-form">
                        <div className="input-group">
                            <label className="input-label">Email Address</label>
                            <div className="input-wrapper">
                                <FiMail className="input-icon" />
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="you@example.com"
                                    className="input with-icon"
                                    required
                                />
                            </div>
                        </div>

                        <div className="input-group">
                            <label className="input-label">Password</label>
                            <div className="input-wrapper">
                                <FiLock className="input-icon" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Enter your password"
                                    className="input with-icon"
                                    required
                                />
                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <FiEyeOff /> : <FiEye />}
                                </button>
                            </div>
                        </div>

                        <button 
                            type="submit" 
                            className="btn btn-primary btn-full"
                            disabled={loading}
                        >
                            {loading ? (
                                <span className="loading-spinner"></span>
                            ) : (
                                <>
                                    Log In <FiArrowRight />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="auth-footer">
                        <p>
                            Don't have an account?{' '}
                            <Link to="/register" className="auth-link">Sign up free</Link>
                        </p>
                    </div>
                </div>

                <div className="auth-features">
                    <h2>Track Your Nutrition with AI</h2>
                    <ul>
                        <li>📸 Scan food photos for instant nutrition</li>
                        <li>📊 Beautiful analytics dashboard</li>
                        <li>🎯 Personalized daily goals</li>
                        <li>🤖 AI-powered meal suggestions</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default Login;
