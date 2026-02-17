import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { 
    FiHome, 
    FiPlusCircle, 
    FiPieChart, 
    FiUser, 
    FiLogOut,
    FiSun,
    FiMoon,
    FiMenu,
    FiX,
    FiCpu
} from 'react-icons/fi';
import { GiMeal } from 'react-icons/gi';
import { useState } from 'react';
import './Navbar.css';

const Navbar = () => {
    const { user, isAuthenticated, logout } = useAuth();
    const { theme, toggleTheme, isDark } = useTheme();
    const location = useLocation();
    const navigate = useNavigate();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/');
        setMobileMenuOpen(false);
    };

    const navLinks = [
        { path: '/dashboard', label: 'Dashboard', icon: FiHome },
        { path: '/log-meal', label: 'Log Meal', icon: FiPlusCircle },
        { path: '/meals', label: 'My Meals', icon: GiMeal },
        { path: '/analytics', label: 'Analytics', icon: FiPieChart },
        { path: '/ai-assistant', label: 'AI', icon: FiCpu },
        { path: '/profile', label: 'Profile', icon: FiUser },
    ];

    const isActive = (path) => location.pathname === path;

    return (
        <nav className="navbar">
            <div className="navbar-container">
                {/* Logo */}
                <Link to={isAuthenticated ? '/dashboard' : '/'} className="navbar-logo">
                    <span className="logo-icon">🍎</span>
                    <span className="logo-text">SmartAI <span className="text-gradient">Nutrition</span></span>
                </Link>

                {/* Desktop Navigation */}
                {isAuthenticated && (
                    <div className="navbar-links">
                        {navLinks.map(({ path, label, icon: Icon }) => (
                            <Link
                                key={path}
                                to={path}
                                className={`nav-link ${isActive(path) ? 'active' : ''}`}
                            >
                                <Icon className="nav-icon" />
                                <span>{label}</span>
                            </Link>
                        ))}
                    </div>
                )}

                {/* Right Side */}
                <div className="navbar-right">
                    {/* Theme Toggle */}
                    <button 
                        className="theme-toggle" 
                        onClick={toggleTheme}
                        aria-label="Toggle theme"
                    >
                        {isDark ? <FiSun /> : <FiMoon />}
                    </button>

                    {isAuthenticated ? (
                        <>
                            <div className="user-info">
                                <span className="user-greeting">Hi, {user?.name?.split(' ')[0]}</span>
                            </div>
                            <button className="btn-logout" onClick={handleLogout}>
                                <FiLogOut />
                                <span>Logout</span>
                            </button>
                        </>
                    ) : (
                        <div className="auth-buttons">
                            <Link to="/login" className="btn btn-ghost">Login</Link>
                            <Link to="/register" className="btn btn-primary">Get Started</Link>
                        </div>
                    )}

                    {/* Mobile Menu Toggle */}
                    <button 
                        className="mobile-menu-toggle"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                        {mobileMenuOpen ? <FiX /> : <FiMenu />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <div className="mobile-menu">
                    {isAuthenticated ? (
                        <>
                            {navLinks.map(({ path, label, icon: Icon }) => (
                                <Link
                                    key={path}
                                    to={path}
                                    className={`mobile-nav-link ${isActive(path) ? 'active' : ''}`}
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    <Icon />
                                    <span>{label}</span>
                                </Link>
                            ))}
                            <button className="mobile-nav-link logout" onClick={handleLogout}>
                                <FiLogOut />
                                <span>Logout</span>
                            </button>
                        </>
                    ) : (
                        <>
                            <Link 
                                to="/login" 
                                className="mobile-nav-link"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Login
                            </Link>
                            <Link 
                                to="/register" 
                                className="mobile-nav-link"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Get Started
                            </Link>
                        </>
                    )}
                </div>
            )}
        </nav>
    );
};

export default Navbar;
