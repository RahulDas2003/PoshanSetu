import { useState, useEffect } from 'react';
import { FiTrendingUp, FiCalendar, FiTarget, FiAward } from 'react-icons/fi';
import { dashboardAPI } from '../services/api';
import toast from 'react-hot-toast';
import './Analytics.css';

const Analytics = () => {
    const [loading, setLoading] = useState(true);
    const [weeklyData, setWeeklyData] = useState(null);
    const [monthlyData, setMonthlyData] = useState(null);
    const [insights, setInsights] = useState([]);
    const [activeTab, setActiveTab] = useState('weekly');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [weekly, monthly, insightsRes] = await Promise.all([
                dashboardAPI.getWeekly(),
                dashboardAPI.getMonthly(),
                dashboardAPI.getInsights()
            ]);
            setWeeklyData(weekly.data);
            setMonthlyData(monthly.data);
            setInsights(insightsRes.data.insights || []);
        } catch (error) {
            console.error('Failed to fetch analytics:', error);
            toast.error('Failed to load analytics');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="analytics-loading">
                <div className="loading-spinner-lg"></div>
                <p>Loading analytics...</p>
            </div>
        );
    }

    const getDayName = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { weekday: 'short' });
    };

    const maxCalories = Math.max(...(weeklyData?.dailyData?.map(d => d.calories) || [1]), 1);

    return (
        <div className="analytics-page">
            <div className="analytics-container">
                <header className="analytics-header">
                    <h1><FiTrendingUp /> Analytics</h1>
                    <p>Track your nutrition progress</p>
                </header>

                {/* Insights Section */}
                {insights.length > 0 && (
                    <div className="insights-section">
                        {insights.map((insight, index) => (
                            <div key={index} className={`insight-card ${insight.type}`}>
                                <span className="insight-title">{insight.title}</span>
                                <p className="insight-message">{insight.message}</p>
                            </div>
                        ))}
                    </div>
                )}

                {/* Stats Overview */}
                <div className="stats-grid">
                    <div className="stat-card">
                        <FiCalendar className="stat-icon" />
                        <div className="stat-content">
                            <span className="stat-value">{weeklyData?.daysLogged || 0}</span>
                            <span className="stat-label">Days Logged</span>
                        </div>
                    </div>
                    <div className="stat-card">
                        <FiTarget className="stat-icon" />
                        <div className="stat-content">
                            <span className="stat-value">{weeklyData?.goalAdherence || 0}%</span>
                            <span className="stat-label">Goal Adherence</span>
                        </div>
                    </div>
                    <div className="stat-card">
                        <FiTrendingUp className="stat-icon" />
                        <div className="stat-content">
                            <span className="stat-value">{weeklyData?.averages?.calories || 0}</span>
                            <span className="stat-label">Avg Calories</span>
                        </div>
                    </div>
                    <div className="stat-card">
                        <FiAward className="stat-icon" />
                        <div className="stat-content">
                            <span className="stat-value">{weeklyData?.totalMeals || 0}</span>
                            <span className="stat-label">Total Meals</span>
                        </div>
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="analytics-tabs">
                    <button 
                        className={`tab-btn ${activeTab === 'weekly' ? 'active' : ''}`}
                        onClick={() => setActiveTab('weekly')}
                    >
                        Weekly
                    </button>
                    <button 
                        className={`tab-btn ${activeTab === 'monthly' ? 'active' : ''}`}
                        onClick={() => setActiveTab('monthly')}
                    >
                        Monthly
                    </button>
                </div>

                {/* Weekly View */}
                {activeTab === 'weekly' && (
                    <div className="chart-section">
                        <div className="chart-card">
                            <h3>Calories This Week</h3>
                            <div className="bar-chart">
                                {weeklyData?.dailyData?.length > 0 ? (
                                    weeklyData.dailyData.map((day, index) => (
                                        <div key={index} className="bar-item">
                                            <div className="bar-container">
                                                <div 
                                                    className="bar" 
                                                    style={{ height: `${(day.calories / maxCalories) * 100}%` }}
                                                >
                                                    <span className="bar-value">{day.calories}</span>
                                                </div>
                                            </div>
                                            <span className="bar-label">{getDayName(day._id)}</span>
                                        </div>
                                    ))
                                ) : (
                                    <div className="no-data">
                                        <p>No data for this week. Start logging meals!</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="macros-summary">
                            <h3>Average Macros</h3>
                            <div className="macro-cards">
                                <div className="macro-card protein">
                                    <span className="macro-value">{weeklyData?.averages?.protein || 0}g</span>
                                    <span className="macro-label">Protein</span>
                                </div>
                                <div className="macro-card carbs">
                                    <span className="macro-value">{weeklyData?.averages?.carbs || 0}g</span>
                                    <span className="macro-label">Carbs</span>
                                </div>
                                <div className="macro-card fat">
                                    <span className="macro-value">{weeklyData?.averages?.fat || 0}g</span>
                                    <span className="macro-label">Fat</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Monthly View */}
                {activeTab === 'monthly' && (
                    <div className="chart-section">
                        <div className="chart-card">
                            <h3>Weight Progress</h3>
                            {monthlyData?.weightLogs?.length > 0 ? (
                                <div className="weight-chart">
                                    <div className="weight-summary">
                                        <div className="weight-current">
                                            <span className="weight-value">{monthlyData.currentWeight || '--'}</span>
                                            <span className="weight-unit">kg</span>
                                        </div>
                                        {monthlyData.weightChange !== null && (
                                            <div className={`weight-change ${monthlyData.weightChange >= 0 ? 'gain' : 'loss'}`}>
                                                {monthlyData.weightChange >= 0 ? '+' : ''}{monthlyData.weightChange.toFixed(1)} kg
                                            </div>
                                        )}
                                    </div>
                                    <div className="weight-history">
                                        {monthlyData.weightLogs.slice(-7).map((log, index) => (
                                            <div key={index} className="weight-entry">
                                                <span className="weight-date">
                                                    {new Date(log.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                                </span>
                                                <span className="weight-value-sm">{log.weight} kg</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="no-data">
                                    <p>No weight data yet. Log your weight to track progress!</p>
                                </div>
                            )}
                        </div>

                        <div className="chart-card">
                            <h3>Weekly Trends</h3>
                            {monthlyData?.weeklyData?.length > 0 ? (
                                <div className="weekly-trends">
                                    {monthlyData.weeklyData.map((week, index) => (
                                        <div key={index} className="trend-item">
                                            <span className="trend-week">Week {week._id}</span>
                                            <div className="trend-bar-container">
                                                <div 
                                                    className="trend-bar"
                                                    style={{ width: `${Math.min(100, (week.avgCalories / 2500) * 100)}%` }}
                                                ></div>
                                            </div>
                                            <span className="trend-value">{Math.round(week.avgCalories)} avg</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="no-data">
                                    <p>Not enough data for monthly trends.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Analytics;
