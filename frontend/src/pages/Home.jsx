import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiArrowRight, FiCheck, FiCamera, FiPieChart, FiTarget, FiZap } from 'react-icons/fi';
import './Home.css';

const Home = () => {
    const { isAuthenticated } = useAuth();

    const features = [
        {
            icon: FiCamera,
            title: 'AI Food Scanner',
            description: 'Snap a photo of your meal and get instant nutritional analysis powered by AI'
        },
        {
            icon: FiPieChart,
            title: 'Smart Analytics',
            description: 'Beautiful charts and insights to track your nutrition journey over time'
        },
        {
            icon: FiTarget,
            title: 'Personalized Goals',
            description: 'Auto-calculated daily targets based on your body metrics and goals'
        },
        {
            icon: FiZap,
            title: 'AI Recommendations',
            description: 'Get smart meal suggestions tailored to help you reach your goals'
        }
    ];

    const benefits = [
        'Track calories, protein, carbs, and fats',
        'Beautiful progress dashboard',
        'Build healthy eating habits',
        'Completely free to use',
        'No subscription required',
        'Works on all devices'
    ];

    return (
        <div className="home">
            {/* Hero Section */}
            <section className="hero">
                <div className="hero-bg"></div>
                <div className="hero-content container">
                    <div className="hero-text">
                        <span className="hero-badge">🍎 AI-Powered Nutrition</span>
                        <h1 className="hero-title">
                            Eat Smarter with
                            <span className="text-gradient"> AI Nutrition</span>
                            <br />Tracking
                        </h1>
                        <p className="hero-description">
                            Transform your health journey with intelligent food tracking. 
                            Scan meals, get instant nutrition insights, and achieve your 
                            goals with personalized AI recommendations.
                        </p>
                        <div className="hero-actions">
                            <Link 
                                to={isAuthenticated ? '/dashboard' : '/register'} 
                                className="btn btn-primary btn-lg"
                            >
                                {isAuthenticated ? 'Go to Dashboard' : 'Start Free Today'}
                                <FiArrowRight />
                            </Link>
                            <Link to="/login" className="btn btn-secondary btn-lg">
                                Login to Account
                            </Link>
                        </div>
                        <div className="hero-stats">
                            <div className="stat">
                                <span className="stat-number">100%</span>
                                <span className="stat-label">Free Forever</span>
                            </div>
                            <div className="stat">
                                <span className="stat-number">AI</span>
                                <span className="stat-label">Powered</span>
                            </div>
                            <div className="stat">
                                <span className="stat-number">1000+</span>
                                <span className="stat-label">Foods</span>
                            </div>
                        </div>
                    </div>
                    <div className="hero-visual">
                        <div className="phone-mockup">
                            <div className="phone-screen">
                                <div className="mockup-header">
                                    <span>Today's Progress</span>
                                </div>
                                <div className="mockup-progress">
                                    <div className="progress-ring">
                                        <svg viewBox="0 0 100 100">
                                            <circle cx="50" cy="50" r="45" className="ring-bg" />
                                            <circle cx="50" cy="50" r="45" className="ring-fill" />
                                        </svg>
                                        <div className="ring-content">
                                            <span className="ring-value">1,450</span>
                                            <span className="ring-label">kcal</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="mockup-macros">
                                    <div className="macro-item protein">
                                        <span>Protein</span>
                                        <div className="macro-bar"><div style={{width: '75%'}}></div></div>
                                        <span>75g</span>
                                    </div>
                                    <div className="macro-item carbs">
                                        <span>Carbs</span>
                                        <div className="macro-bar"><div style={{width: '60%'}}></div></div>
                                        <span>180g</span>
                                    </div>
                                    <div className="macro-item fat">
                                        <span>Fat</span>
                                        <div className="macro-bar"><div style={{width: '45%'}}></div></div>
                                        <span>45g</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="features-section">
                <div className="container">
                    <div className="section-header">
                        <h2>Everything You Need to Eat Healthy</h2>
                        <p>Powerful features to help you track, analyze, and improve your nutrition</p>
                    </div>
                    <div className="features-grid">
                        {features.map((feature, index) => (
                            <div key={index} className="feature-card">
                                <div className="feature-icon">
                                    <feature.icon />
                                </div>
                                <h3>{feature.title}</h3>
                                <p>{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Benefits Section */}
            <section className="benefits-section">
                <div className="container">
                    <div className="benefits-content">
                        <div className="benefits-text">
                            <h2>Why SmartAI Nutrition?</h2>
                            <p>
                                We built SmartAI Nutrition to make healthy eating simple, 
                                accessible, and actually enjoyable. No complicated calorie 
                                counting or confusing macros.
                            </p>
                            <ul className="benefits-list">
                                {benefits.map((benefit, index) => (
                                    <li key={index}>
                                        <FiCheck className="check-icon" />
                                        <span>{benefit}</span>
                                    </li>
                                ))}
                            </ul>
                            <Link to="/register" className="btn btn-primary">
                                Get Started Free <FiArrowRight />
                            </Link>
                        </div>
                        <div className="benefits-image">
                            <div className="image-card">
                                <div className="meal-card">
                                    <div className="meal-emoji">🥗</div>
                                    <div className="meal-info">
                                        <span className="meal-name">Chicken Salad</span>
                                        <span className="meal-cal">320 kcal</span>
                                    </div>
                                    <span className="meal-badge">Logged ✓</span>
                                </div>
                                <div className="meal-card">
                                    <div className="meal-emoji">🍳</div>
                                    <div className="meal-info">
                                        <span className="meal-name">Eggs & Toast</span>
                                        <span className="meal-cal">280 kcal</span>
                                    </div>
                                    <span className="meal-badge">Logged ✓</span>
                                </div>
                                <div className="meal-card">
                                    <div className="meal-emoji">🍌</div>
                                    <div className="meal-info">
                                        <span className="meal-name">Banana Smoothie</span>
                                        <span className="meal-cal">180 kcal</span>
                                    </div>
                                    <span className="meal-badge">Logged ✓</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="cta-section">
                <div className="container">
                    <div className="cta-content">
                        <h2>Ready to Transform Your Nutrition?</h2>
                        <p>Join thousands who are eating smarter with AI-powered tracking</p>
                        <Link to="/register" className="btn btn-primary btn-lg">
                            Start Your Journey <FiArrowRight />
                        </Link>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="footer">
                <div className="container">
                    <div className="footer-content">
                        <div className="footer-brand">
                            <span className="logo-icon">🍎</span>
                            <span>SmartAI Nutrition</span>
                        </div>
                        <p>Made with ❤️ for healthier living</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Home;
