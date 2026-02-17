import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiPlus, FiTarget, FiTrendingUp, FiCalendar, FiChevronRight, FiRefreshCw } from 'react-icons/fi';
import { dashboardAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import './Dashboard.css';

const Dashboard = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);

    useEffect(() => {
        fetchDailyData();
    }, []);

    const fetchDailyData = async () => {
        setLoading(true);
        try {
            const response = await dashboardAPI.getDaily();
            setData(response.data);
        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
            toast.error('Failed to load dashboard');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="dashboard-loading">
                <div className="loading-spinner-lg"></div>
                <p>Loading your dashboard...</p>
            </div>
        );
    }

    const consumed = data?.consumed || { calories: 0, protein: 0, carbs: 0, fat: 0 };
    const targets = data?.targets || user?.dailyTargets || { calories: 2000, protein: 150, carbs: 250, fat: 65 };
    const remaining = data?.remaining || { calories: targets.calories, protein: targets.protein, carbs: targets.carbs, fat: targets.fat };
    const progress = data?.progress || { calories: 0, protein: 0, carbs: 0, fat: 0 };
    const streak = data?.streak || user?.streak || { current: 0, longest: 0 };
    const meals = data?.meals || [];

    const calorieProgress = Math.min(100, progress.calories);
    const circumference = 2 * Math.PI * 70;
    const strokeDashoffset = circumference - (calorieProgress / 100) * circumference;

    const getMealTypeLabel = (type) => {
        const labels = { breakfast: 'Breakfast', lunch: 'Lunch', dinner: 'Dinner', snack: 'Snack' };
        return labels[type] || type;
    };

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    };

    return (
        <div className="dashboard">
            <div className="dashboard-container">
                {/* Header */}
                <div className="dashboard-header">
                    <div className="header-content">
                        <div className="greeting">
                            <h1>Hello, {user?.name?.split(' ')[0] || 'there'}! 👋</h1>
                            <p>Track your nutrition journey</p>
                        </div>
                        <button className="refresh-btn" onClick={fetchDailyData}>
                            <FiRefreshCw />
                        </button>
                    </div>
                </div>

                {/* Main Grid */}
                <div className="dashboard-grid">
                    {/* Calorie Progress Card */}
                    <div className="card calorie-card">
                        <div className="card-header">
                            <h3><FiTarget /> Daily Progress</h3>
                            <span className="date">
                                <FiCalendar /> {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                            </span>
                        </div>
                        <div className="calorie-progress">
                            <div className="progress-ring-container">
                                <svg className="progress-ring" viewBox="0 0 160 160">
                                    <defs>
                                        <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                            <stop offset="0%" stopColor="var(--primary-500)" />
                                            <stop offset="100%" stopColor="var(--accent-500)" />
                                        </linearGradient>
                                    </defs>
                                    <circle 
                                        className="ring-bg" 
                                        cx="80" cy="80" r="70" 
                                        fill="none" 
                                        strokeWidth="12" 
                                    />
                                    <circle 
                                        className="ring-progress" 
                                        cx="80" cy="80" r="70" 
                                        fill="none" 
                                        strokeWidth="12"
                                        strokeLinecap="round"
                                        strokeDasharray={circumference}
                                        strokeDashoffset={strokeDashoffset}
                                        stroke="url(#progressGradient)"
                                    />
                                </svg>
                                <div className="ring-center">
                                    <span className="ring-value">{consumed.calories}</span>
                                    <span className="ring-label">of {targets.calories}</span>
                                </div>
                            </div>
                            <div className="calorie-stats">
                                <div className="stat-item">
                                    <span className="stat-label">Consumed</span>
                                    <span className="stat-value">{consumed.calories} kcal</span>
                                </div>
                                <div className="stat-item remaining">
                                    <span className="stat-label">Remaining</span>
                                    <span className="stat-value">{remaining.calories} kcal</span>
                                </div>
                                <div className="stat-item">
                                    <span className="stat-label">Target</span>
                                    <span className="stat-value">{targets.calories} kcal</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Macros Card */}
                    <div className="card macros-card">
                        <div className="card-header">
                            <h3><FiTrendingUp /> Macros</h3>
                        </div>
                        <div className="macros-grid">
                            <div className="macro-item">
                                <div className="macro-header">
                                    <span>Protein</span>
                                    <span>{Math.round(consumed.protein)}g / {targets.protein}g</span>
                                </div>
                                <div className="macro-bar">
                                    <div className="macro-fill protein" style={{ width: `${progress.protein}%` }}></div>
                                </div>
                            </div>
                            <div className="macro-item">
                                <div className="macro-header">
                                    <span>Carbs</span>
                                    <span>{Math.round(consumed.carbs)}g / {targets.carbs}g</span>
                                </div>
                                <div className="macro-bar">
                                    <div className="macro-fill carbs" style={{ width: `${progress.carbs}%` }}></div>
                                </div>
                            </div>
                            <div className="macro-item">
                                <div className="macro-header">
                                    <span>Fat</span>
                                    <span>{Math.round(consumed.fat)}g / {targets.fat}g</span>
                                </div>
                                <div className="macro-bar">
                                    <div className="macro-fill fat" style={{ width: `${progress.fat}%` }}></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Streak Card */}
                    <div className="card streak-card">
                        <span className="streak-icon">🔥</span>
                        <span className="streak-value">{streak.current}</span>
                        <span className="streak-label">Day Streak</span>
                        {streak.longest > 0 && (
                            <span className="streak-best">Best: {streak.longest} days</span>
                        )}
                    </div>

                    {/* Quick Actions */}
                    <div className="card actions-card">
                        <div className="card-header">
                            <h3>Quick Actions</h3>
                        </div>
                        <div className="actions-grid">
                            <Link to="/log-meal" className="action-btn">
                                <FiPlus className="action-icon" style={{ color: 'var(--primary-500)' }} />
                                <span>Log Meal</span>
                            </Link>
                            <Link to="/meals" className="action-btn">
                                <FiCalendar className="action-icon" style={{ color: 'var(--accent-500)' }} />
                                <span>View Meals</span>
                            </Link>
                            <Link to="/analytics" className="action-btn">
                                <FiTrendingUp className="action-icon" style={{ color: 'var(--success)' }} />
                                <span>Analytics</span>
                            </Link>
                            <Link to="/profile" className="action-btn">
                                <FiTarget className="action-icon" style={{ color: 'var(--warning)' }} />
                                <span>Goals</span>
                            </Link>
                        </div>
                    </div>

                    {/* Today's Meals */}
                    <div className="card meals-card">
                        <div className="card-header">
                            <h3>Today's Meals</h3>
                            <Link to="/meals" className="view-all">View All <FiChevronRight /></Link>
                        </div>
                        {meals.length === 0 ? (
                            <div className="no-meals">
                                <p>No meals logged today</p>
                                <Link to="/log-meal" className="btn btn-primary">Log Your First Meal</Link>
                            </div>
                        ) : (
                            <div className="meals-list">
                                {meals.map((meal, index) => (
                                    <div key={meal._id || index} className="meal-item">
                                        <span className="meal-type">{getMealTypeLabel(meal.mealType)}</span>
                                        <div className="meal-details">
                                            <span className="meal-name">
                                                {meal.foods?.length || 0} items
                                            </span>
                                            <span className="meal-time">{formatTime(meal.createdAt)}</span>
                                        </div>
                                        <span className="meal-calories">{meal.totalNutrition?.calories || 0} kcal</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
