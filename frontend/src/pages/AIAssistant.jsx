import { useState, useRef, useEffect } from 'react';
import { FiSend, FiMessageCircle, FiCpu, FiZap, FiRefreshCw, FiSearch } from 'react-icons/fi';
import { aiAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import './AIAssistant.css';

const AIAssistant = () => {
    const { user } = useAuth();
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [dailyTip, setDailyTip] = useState('');
    const [recommendations, setRecommendations] = useState('');
    const [activeTab, setActiveTab] = useState('chat');
    const [foodDescription, setFoodDescription] = useState('');
    const [foodAnalysis, setFoodAnalysis] = useState(null);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        fetchDailyTip();
        setMessages([{
            role: 'assistant',
            content: `Hey ${user?.name?.split(' ')[0] || 'there'}! 👋 I'm your AI nutrition assistant. Ask me anything about nutrition, meal planning, or healthy eating!`
        }]);
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const fetchDailyTip = async () => {
        try {
            const response = await aiAPI.getDailyTip();
            setDailyTip(response.data.tip);
        } catch (error) {
            setDailyTip('Stay hydrated! Aim for 8 glasses of water daily. 💧');
        }
    };

    const fetchRecommendations = async (mealType) => {
        setLoading(true);
        try {
            const response = await aiAPI.getRecommendations(mealType);
            setRecommendations(response.data.recommendations);
        } catch (error) {
            toast.error('Failed to get recommendations');
        } finally {
            setLoading(false);
        }
    };

    const sendMessage = async () => {
        if (!input.trim() || loading) return;

        const userMessage = { role: 'user', content: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setLoading(true);

        try {
            const response = await aiAPI.chat(input);
            const assistantMessage = { role: 'assistant', content: response.data.response };
            setMessages(prev => [...prev, assistantMessage]);
        } catch (error) {
            toast.error('Failed to get response');
            setMessages(prev => [...prev, { 
                role: 'assistant', 
                content: "Sorry, I couldn't process that. Please try again." 
            }]);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const analyzeFood = async () => {
        if (!foodDescription.trim()) {
            toast.error('Please describe your food');
            return;
        }
        
        setLoading(true);
        setFoodAnalysis(null);
        
        try {
            const response = await aiAPI.analyzeImage(foodDescription);
            setFoodAnalysis(response.data.analysis);
            toast.success('Food analyzed! 🍽️');
        } catch (error) {
            toast.error('Failed to analyze food');
        } finally {
            setLoading(false);
        }
    };

    const clearAnalysis = () => {
        setFoodDescription('');
        setFoodAnalysis(null);
    };

    const quickQuestions = [
        "What should I eat for lunch?",
        "How much protein do I need?",
        "Tips for weight loss",
        "Healthy snack ideas"
    ];

    const exampleMeals = [
        "2 eggs, 2 toast with butter, and orange juice",
        "Chicken salad with mixed greens and olive oil dressing",
        "Grilled salmon with rice and steamed vegetables",
        "Protein shake with banana and peanut butter"
    ];

    return (
        <div className="ai-page">
            <div className="ai-container">
                <header className="ai-header">
                    <h1><FiCpu /> AI Assistant</h1>
                    <p>Your personal nutrition guide powered by AI</p>
                </header>

                {/* Daily Tip */}
                {dailyTip && (
                    <div className="daily-tip">
                        <div className="tip-content">
                            <span className="tip-label">Daily Tip</span>
                            <p>{dailyTip}</p>
                        </div>
                        <button className="refresh-tip" onClick={fetchDailyTip}>
                            <FiRefreshCw />
                        </button>
                    </div>
                )}

                {/* Tabs */}
                <div className="ai-tabs">
                    <button 
                        className={`tab-btn ${activeTab === 'chat' ? 'active' : ''}`}
                        onClick={() => setActiveTab('chat')}
                    >
                        <FiMessageCircle /> Chat
                    </button>
                    <button 
                        className={`tab-btn ${activeTab === 'analyze' ? 'active' : ''}`}
                        onClick={() => setActiveTab('analyze')}
                    >
                        <FiSearch /> Analyze Food
                    </button>
                    <button 
                        className={`tab-btn ${activeTab === 'recommend' ? 'active' : ''}`}
                        onClick={() => setActiveTab('recommend')}
                    >
                        <FiZap /> Meal Ideas
                    </button>
                </div>

                {/* Chat Tab */}
                {activeTab === 'chat' && (
                    <div className="chat-section">
                        <div className="messages-container">
                            {messages.map((msg, index) => (
                                <div key={index} className={`message ${msg.role}`}>
                                    <div className="message-content">
                                        {msg.content}
                                    </div>
                                </div>
                            ))}
                            {loading && (
                                <div className="message assistant">
                                    <div className="message-content typing">
                                        <span className="dot"></span>
                                        <span className="dot"></span>
                                        <span className="dot"></span>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        <div className="quick-questions">
                            {quickQuestions.map((q, i) => (
                                <button 
                                    key={i} 
                                    className="quick-btn"
                                    onClick={() => { setInput(q); }}
                                >
                                    {q}
                                </button>
                            ))}
                        </div>

                        <div className="chat-input-wrapper">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Ask me anything about nutrition..."
                                disabled={loading}
                                className="chat-input"
                            />
                            <button 
                                className="send-btn"
                                onClick={sendMessage}
                                disabled={loading || !input.trim()}
                            >
                                <FiSend />
                            </button>
                        </div>
                    </div>
                )}

                {/* Analyze Food Tab */}
                {activeTab === 'analyze' && (
                    <div className="analyze-section">
                        <p className="analyze-intro">📝 Describe your meal and I'll estimate its nutritional content!</p>
                        
                        {!foodAnalysis ? (
                            <>
                                <div className="food-input-container">
                                    <textarea
                                        value={foodDescription}
                                        onChange={(e) => setFoodDescription(e.target.value)}
                                        placeholder="Example: 2 scrambled eggs, 2 slices of whole wheat toast with butter, and a glass of orange juice"
                                        className="food-textarea"
                                        rows={4}
                                    />
                                </div>

                                <div className="example-meals">
                                    <span>Try an example:</span>
                                    <div className="example-buttons">
                                        {exampleMeals.map((meal, i) => (
                                            <button 
                                                key={i}
                                                className="example-btn"
                                                onClick={() => setFoodDescription(meal)}
                                            >
                                                {meal.substring(0, 30)}...
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <button 
                                    className="btn btn-primary analyze-btn"
                                    onClick={analyzeFood}
                                    disabled={loading || !foodDescription.trim()}
                                >
                                    {loading ? (
                                        <><span className="spinner"></span> Analyzing...</>
                                    ) : (
                                        <><FiSearch /> Analyze Food</>
                                    )}
                                </button>
                            </>
                        ) : (
                            <div className="analysis-results">
                                <h3>🍽️ Analysis Results</h3>
                                
                                {foodAnalysis.foods && foodAnalysis.foods.length > 0 && (
                                    <div className="foods-detected">
                                        <h4>Foods Detected:</h4>
                                        {foodAnalysis.foods.map((food, idx) => (
                                            <div key={idx} className="food-item-result">
                                                <span className="food-name">{food.name}</span>
                                                <span className="food-portion">{food.portion}</span>
                                                <span className="food-cals">{food.calories} kcal</span>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <div className="nutrition-totals">
                                    <div className="total-item">
                                        <span className="total-value">{foodAnalysis.totalCalories || 0}</span>
                                        <span className="total-label">Calories</span>
                                    </div>
                                    <div className="total-item protein">
                                        <span className="total-value">{foodAnalysis.totalProtein || 0}g</span>
                                        <span className="total-label">Protein</span>
                                    </div>
                                    <div className="total-item carbs">
                                        <span className="total-value">{foodAnalysis.totalCarbs || 0}g</span>
                                        <span className="total-label">Carbs</span>
                                    </div>
                                    <div className="total-item fat">
                                        <span className="total-value">{foodAnalysis.totalFat || 0}g</span>
                                        <span className="total-label">Fat</span>
                                    </div>
                                </div>

                                {foodAnalysis.healthRating && (
                                    <div className="health-rating">
                                        <span>Health Rating: </span>
                                        <strong>{foodAnalysis.healthRating}/10</strong>
                                    </div>
                                )}

                                {foodAnalysis.suggestions && (
                                    <div className="suggestions">
                                        <p>💡 {foodAnalysis.suggestions}</p>
                                    </div>
                                )}

                                <button className="btn btn-secondary" onClick={clearAnalysis}>
                                    Analyze Another Meal
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* Recommendations Tab */}
                {activeTab === 'recommend' && (
                    <div className="recommend-section">
                        <p className="recommend-intro">Get personalized meal ideas based on your remaining calories and goals!</p>
                        
                        <div className="meal-type-buttons">
                            {['breakfast', 'lunch', 'dinner', 'snack'].map(type => (
                                <button 
                                    key={type}
                                    className="meal-type-btn"
                                    onClick={() => fetchRecommendations(type)}
                                    disabled={loading}
                                >
                                    {type === 'breakfast' && '🍳'}
                                    {type === 'lunch' && '🥗'}
                                    {type === 'dinner' && '🍽️'}
                                    {type === 'snack' && '🍎'}
                                    <span>{type.charAt(0).toUpperCase() + type.slice(1)}</span>
                                </button>
                            ))}
                        </div>

                        {loading ? (
                            <div className="loading-recommendations">
                                <div className="loading-spinner"></div>
                                <p>Generating personalized recommendations...</p>
                            </div>
                        ) : recommendations ? (
                            <div className="recommendations-content">
                                <pre>{recommendations}</pre>
                            </div>
                        ) : (
                            <div className="no-recommendations">
                                <p>Select a meal type above to get AI-powered recommendations!</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AIAssistant;
