import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiCalendar, FiPlus, FiTrash2, FiEdit, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { mealAPI } from '../services/api';
import toast from 'react-hot-toast';
import './Meals.css';

const Meals = () => {
    const [loading, setLoading] = useState(true);
    const [meals, setMeals] = useState([]);
    const [totals, setTotals] = useState({ calories: 0, protein: 0, carbs: 0, fat: 0 });
    const [selectedDate, setSelectedDate] = useState(new Date());

    useEffect(() => {
        fetchMeals();
    }, [selectedDate]);

    const fetchMeals = async () => {
        setLoading(true);
        try {
            const dateStr = selectedDate.toISOString().split('T')[0];
            const response = await mealAPI.getByDate(dateStr);
            setMeals(response.data.meals || []);
            setTotals(response.data.totals || { calories: 0, protein: 0, carbs: 0, fat: 0 });
        } catch (error) {
            console.error('Failed to fetch meals:', error);
        } finally {
            setLoading(false);
        }
    };

    const deleteMeal = async (mealId) => {
        if (!confirm('Are you sure you want to delete this meal?')) return;
        
        try {
            await mealAPI.delete(mealId);
            toast.success('Meal deleted');
            fetchMeals();
        } catch (error) {
            toast.error('Failed to delete meal');
        }
    };

    const changeDate = (days) => {
        const newDate = new Date(selectedDate);
        newDate.setDate(newDate.getDate() + days);
        setSelectedDate(newDate);
    };

    const isToday = () => {
        const today = new Date();
        return selectedDate.toDateString() === today.toDateString();
    };

    const formatDate = (date) => {
        if (isToday()) return 'Today';
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        if (selectedDate.toDateString() === yesterday.toDateString()) return 'Yesterday';
        return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    };

    const getMealTypeIcon = (type) => {
        const icons = { breakfast: '🍳', lunch: '🥗', dinner: '🍽️', snack: '🍎' };
        return icons[type] || '🍴';
    };

    const getMealTypeLabel = (type) => {
        const labels = { breakfast: 'Breakfast', lunch: 'Lunch', dinner: 'Dinner', snack: 'Snack' };
        return labels[type] || type;
    };

    const groupMealsByType = () => {
        const groups = { breakfast: [], lunch: [], dinner: [], snack: [] };
        meals.forEach(meal => {
            if (groups[meal.mealType]) {
                groups[meal.mealType].push(meal);
            }
        });
        return groups;
    };

    const mealGroups = groupMealsByType();

    return (
        <div className="meals-page">
            <div className="meals-container">
                <header className="meals-header">
                    <h1><FiCalendar /> Meal History</h1>
                    <Link to="/log-meal" className="btn btn-primary">
                        <FiPlus /> Log Meal
                    </Link>
                </header>

                {/* Date Navigation */}
                <div className="date-nav">
                    <button className="nav-btn" onClick={() => changeDate(-1)}>
                        <FiChevronLeft />
                    </button>
                    <div className="date-display">
                        <span className="date-main">{formatDate(selectedDate)}</span>
                        <span className="date-full">
                            {selectedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                        </span>
                    </div>
                    <button 
                        className="nav-btn" 
                        onClick={() => changeDate(1)}
                        disabled={isToday()}
                    >
                        <FiChevronRight />
                    </button>
                </div>

                {/* Daily Summary */}
                <div className="daily-summary">
                    <div className="summary-item">
                        <span className="summary-value">{Math.round(totals.calories)}</span>
                        <span className="summary-label">Calories</span>
                    </div>
                    <div className="summary-item protein">
                        <span className="summary-value">{Math.round(totals.protein)}g</span>
                        <span className="summary-label">Protein</span>
                    </div>
                    <div className="summary-item carbs">
                        <span className="summary-value">{Math.round(totals.carbs)}g</span>
                        <span className="summary-label">Carbs</span>
                    </div>
                    <div className="summary-item fat">
                        <span className="summary-value">{Math.round(totals.fat)}g</span>
                        <span className="summary-label">Fat</span>
                    </div>
                </div>

                {/* Meals List */}
                {loading ? (
                    <div className="meals-loading">
                        <div className="loading-spinner"></div>
                    </div>
                ) : meals.length === 0 ? (
                    <div className="no-meals">
                        <p>No meals logged for this day</p>
                        <Link to="/log-meal" className="btn btn-primary">
                            <FiPlus /> Log Your First Meal
                        </Link>
                    </div>
                ) : (
                    <div className="meal-groups">
                        {Object.entries(mealGroups).map(([type, typeMeals]) => (
                            typeMeals.length > 0 && (
                                <div key={type} className="meal-group">
                                    <h3 className="group-title">
                                        <span className="group-icon">{getMealTypeIcon(type)}</span>
                                        {getMealTypeLabel(type)}
                                        <span className="group-count">{typeMeals.length}</span>
                                    </h3>
                                    <div className="group-meals">
                                        {typeMeals.map(meal => (
                                            <div key={meal._id} className="meal-card">
                                                <div className="meal-foods">
                                                    {meal.foods?.map((food, idx) => (
                                                        <div key={idx} className="food-row">
                                                            <span className="food-name">{food.name}</span>
                                                            <span className="food-servings">×{food.servings}</span>
                                                            <span className="food-cals">
                                                                {Math.round((food.nutrition?.calories || 0) * food.servings)} kcal
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                                <div className="meal-footer">
                                                    <span className="meal-total">
                                                        {meal.totalNutrition?.calories || 0} kcal total
                                                    </span>
                                                    <div className="meal-actions">
                                                        <button 
                                                            className="action-btn delete"
                                                            onClick={() => deleteMeal(meal._id)}
                                                        >
                                                            <FiTrash2 />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Meals;
