import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './components/ThemeProvider';
import Navbar from './components/layout/Navbar';
import ProtectedRoute from './components/common/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import LogMeal from './pages/LogMeal';
import Meals from './pages/Meals';
import Analytics from './pages/Analytics';
import Profile from './pages/Profile';
import AIAssistant from './pages/AIAssistant';
import Children from './pages/Children';
import ChildProfile from './pages/ChildProfile';
import SchoolAnalytics from './pages/SchoolAnalytics';
import './App.css';

// Route that redirects authenticated users away from auth pages
const PublicRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();
    if (loading) return null;
    return isAuthenticated ? <Navigate to="/dashboard" replace /> : children;
};

function AppContent() {
    return (
        <div className="app">
            <Navbar />
            <main className="main-content">
                <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
                    <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
                    
                    {/* Protected Routes */}
                    <Route element={<ProtectedRoute />}>
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/log-meal" element={<LogMeal />} />
                        <Route path="/meals" element={<Meals />} />
                        <Route path="/analytics" element={<Analytics />} />
                        <Route path="/profile" element={<Profile />} />
                        <Route path="/ai-assistant" element={<AIAssistant />} />
                        
                        {/* Kid tracking routes */}
                        <Route path="/children" element={<Children />} />
                        <Route path="/children/:id" element={<ChildProfile />} />
                        <Route path="/school-analytics" element={<SchoolAnalytics />} />
                    </Route>
                    
                    {/* Catch all */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </main>
            
            {/* Toast notifications */}
            <Toaster position="top-right" richColors closeButton />
        </div>
    );
}

function App() {
    return (
        <ThemeProvider>
            <AuthProvider>
                <Router>
                    <AppContent />
                </Router>
            </AuthProvider>
        </ThemeProvider>
    );
}

export default App;
