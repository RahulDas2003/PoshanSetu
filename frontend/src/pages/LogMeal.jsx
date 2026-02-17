import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiPlus, FiMinus, FiX, FiCheck, FiCamera } from 'react-icons/fi';
import { foodAPI, mealAPI } from '../services/api';
import toast from 'react-hot-toast';
import './LogMeal.css';

const LogMeal = () => {
    const navigate = useNavigate();
    const [mealType, setMealType] = useState('breakfast');
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [selectedFoods, setSelectedFoods] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searching, setSearching] = useState(false);

    // Debounced search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchQuery.trim().length >= 2) {
                handleSearch();
            } else {
                setSearchResults([]);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    const handleSearch = async () => {
        if (searchQuery.trim().length < 2) return;
        
        setSearching(true);
        try {
            const response = await foodAPI.search(searchQuery);
            setSearchResults(response.data.foods || []);
        } catch (error) {
            console.error('Search error:', error);
        } finally {
            setSearching(false);
        }
    };

    const addFood = (food) => {
        // Check if already added
        const exists = selectedFoods.find(f => f.name === food.name);
        if (exists) {
            toast.error('Food already added');
            return;
        }

        setSelectedFoods([...selectedFoods, {
            ...food,
            servings: 1,
            nutrition: food.nutrition
        }]);
        setSearchQuery('');
        setSearchResults([]);
        toast.success(`Added ${food.name}`);
    };

    const removeFood = (index) => {
        setSelectedFoods(selectedFoods.filter((_, i) => i !== index));
    };

    const updateServings = (index, delta) => {
        setSelectedFoods(selectedFoods.map((food, i) => {
            if (i === index) {
                const newServings = Math.max(0.5, Math.min(10, food.servings + delta));
                return { ...food, servings: newServings };
            }
            return food;
        }));
    };

    const getTotalNutrition = () => {
        return selectedFoods.reduce((totals, food) => {
            const multiplier = food.servings;
            return {
                calories: totals.calories + (food.nutrition.calories || 0) * multiplier,
                protein: totals.protein + (food.nutrition.protein || 0) * multiplier,
                carbs: totals.carbs + (food.nutrition.carbs || 0) * multiplier,
                fat: totals.fat + (food.nutrition.fat || 0) * multiplier
            };
        }, { calories: 0, protein: 0, carbs: 0, fat: 0 });
    };

    const handleSubmit = async () => {
        if (selectedFoods.length === 0) {
            toast.error('Please add at least one food item');
            return;
        }

        setLoading(true);
        try {
            await mealAPI.create({
                mealType,
                foods: selectedFoods.map(f => ({
                    name: f.name,
                    servings: f.servings,
                    servingSize: f.servingSize || 100,
                    servingUnit: f.servingUnit || 'g',
                    nutrition: f.nutrition
                })),
                date: new Date().toISOString()
            });
            toast.success('Meal logged successfully! 🎉');
            navigate('/dashboard');
        } catch (error) {
            toast.error(error.message || 'Failed to log meal');
        } finally {
            setLoading(false);
        }
    };

    const totals = getTotalNutrition();
    const mealTypes = [
        { id: 'breakfast', label: 'Breakfast', icon: '🍳' },
        { id: 'lunch', label: 'Lunch', icon: '🥗' },
        { id: 'dinner', label: 'Dinner', icon: '🍽️' },
        { id: 'snack', label: 'Snack', icon: '🍎' }
    ];

    return (
        <div className="log-meal-page">
            <div className="log-meal-container">
                <header className="log-meal-header">
                    <h1>Log Meal</h1>
                    <p>Search and add foods to your meal</p>
                </header>

                {/* Meal Type Selection */}
                <div className="meal-type-selector">
                    {mealTypes.map(type => (
                        <button
                            key={type.id}
                            className={`meal-type-btn ${mealType === type.id ? 'active' : ''}`}
                            onClick={() => setMealType(type.id)}
                        >
                            <span className="meal-type-icon">{type.icon}</span>
                            <span>{type.label}</span>
                        </button>
                    ))}
                </div>

                {/* Search Section */}
                <div className="search-section">
                    <div className="search-box">
                        <FiSearch className="search-icon" />
                        <input
                            type="text"
                            placeholder="Search foods (e.g., 'chicken breast', 'apple')"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="search-input"
                        />
                        {searching && <div className="search-spinner"></div>}
                    </div>

                    {/* Search Results */}
                    {searchResults.length > 0 && (
                        <div className="search-results">
                            {searchResults.map((food, index) => (
                                <div key={index} className="search-result-item" onClick={() => addFood(food)}>
                                    <div className="result-info">
                                        <span className="result-name">{food.name}</span>
                                        {food.brand && <span className="result-brand">{food.brand}</span>}
                                    </div>
                                    <div className="result-nutrition">
                                        <span>{food.nutrition?.calories || 0} kcal</span>
                                        <FiPlus className="add-icon" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Selected Foods */}
                <div className="selected-foods">
                    <h3>Selected Foods ({selectedFoods.length})</h3>
                    
                    {selectedFoods.length === 0 ? (
                        <div className="empty-foods">
                            <p>No foods added yet. Search above to add foods.</p>
                        </div>
                    ) : (
                        <div className="foods-list">
                            {selectedFoods.map((food, index) => (
                                <div key={index} className="food-item">
                                    <div className="food-info">
                                        <span className="food-name">{food.name}</span>
                                        <span className="food-cal">
                                            {Math.round(food.nutrition.calories * food.servings)} kcal
                                        </span>
                                    </div>
                                    <div className="food-controls">
                                        <button className="serving-btn" onClick={() => updateServings(index, -0.5)}>
                                            <FiMinus />
                                        </button>
                                        <span className="serving-count">{food.servings}</span>
                                        <button className="serving-btn" onClick={() => updateServings(index, 0.5)}>
                                            <FiPlus />
                                        </button>
                                        <button className="remove-btn" onClick={() => removeFood(index)}>
                                            <FiX />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Nutrition Summary */}
                {selectedFoods.length > 0 && (
                    <div className="nutrition-summary">
                        <h3>Meal Summary</h3>
                        <div className="summary-grid">
                            <div className="summary-item calories">
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
                    </div>
                )}

                {/* Submit Button */}
                <button 
                    className="btn btn-primary btn-submit"
                    onClick={handleSubmit}
                    disabled={loading || selectedFoods.length === 0}
                >
                    {loading ? (
                        <span className="loading-spinner"></span>
                    ) : (
                        <>
                            <FiCheck /> Log {mealTypes.find(t => t.id === mealType)?.label}
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

export default LogMeal;
