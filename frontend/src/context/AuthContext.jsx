import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        try {
            const saved = localStorage.getItem('user');
            return saved ? JSON.parse(saved) : null;
        } catch {
            return null;
        }
    });
    const [loading, setLoading] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(() => {
        return !!(localStorage.getItem('token') && localStorage.getItem('user'));
    });

    // Check for existing auth on mount
    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('token');
            const savedUser = localStorage.getItem('user');
            
            if (token && savedUser) {
                try {
                    // Verify token is still valid
                    const response = await authAPI.getMe();
                    setUser(response.data.user);
                    setIsAuthenticated(true);
                } catch (error) {
                    // Token invalid, clear storage
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    setUser(null);
                    setIsAuthenticated(false);
                }
            }
        };

        checkAuth();
    }, []);

    // Register
    const register = async (name, email, password) => {
        try {
            const response = await authAPI.register({ name, email, password });
            const { user: userData, token } = response.data;
            
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(userData));
            
            setUser(userData);
            setIsAuthenticated(true);
            toast.success(response.message || 'Welcome to PoshanSetu! 🍎');
            
            return { success: true };
        } catch (error) {
            toast.error(error.message || 'Registration failed');
            return { success: false, error: error.message };
        }
    };

    // Login
    const login = async (email, password) => {
        try {
            const response = await authAPI.login({ email, password });
            const { user: userData, token } = response.data;
            
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(userData));
            
            setUser(userData);
            setIsAuthenticated(true);
            toast.success(response.message || 'Welcome back! 👋');
            
            return { success: true };
        } catch (error) {
            toast.error(error.message || 'Login failed');
            return { success: false, error: error.message };
        }
    };

    // Logout
    const logout = async () => {
        try {
            await authAPI.logout();
        } catch (error) {
            // Continue with local logout even if API fails
        }
        
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        setIsAuthenticated(false);
        toast.success('Logged out successfully');
    };

    // Update user
    const updateUser = async (data) => {
        try {
            const response = await authAPI.updateProfile(data);
            const updatedUser = response.data.user;
            
            localStorage.setItem('user', JSON.stringify(updatedUser));
            setUser(updatedUser);
            toast.success('Profile updated! ✨');
            
            return { success: true };
        } catch (error) {
            toast.error(error.message || 'Update failed');
            return { success: false, error: error.message };
        }
    };

    const value = {
        user,
        loading,
        isAuthenticated,
        register,
        login,
        logout,
        updateUser
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
