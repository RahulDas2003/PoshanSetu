import { useState, useEffect } from 'react';
import { FiUser, FiTarget, FiActivity, FiSave, FiRefreshCw } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';
import './Profile.css';

const Profile = () => {
    const { user, updateUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [calculating, setCalculating] = useState(false);
    const [activeTab, setActiveTab] = useState('profile');
    
    const [profile, setProfile] = useState({
        name: '',
        age: '',
        gender: 'male',
        height: '',
        weight: '',
        activityLevel: 'moderate',
        goal: 'maintain'
    });

    const [targets, setTargets] = useState({
        calories: 2000,
        protein: 150,
        carbs: 250,
        fat: 65
    });

    useEffect(() => {
        if (user) {
            setProfile({
                name: user.name || '',
                age: user.profile?.age || '',
                gender: user.profile?.gender || 'male',
                height: user.profile?.height || '',
                weight: user.profile?.weight || '',
                activityLevel: user.profile?.activityLevel || 'moderate',
                goal: user.profile?.goal || 'maintain'
            });
            setTargets({
                calories: user.dailyTargets?.calories || 2000,
                protein: user.dailyTargets?.protein || 150,
                carbs: user.dailyTargets?.carbs || 250,
                fat: user.dailyTargets?.fat || 65
            });
        }
    }, [user]);

    const handleProfileChange = (e) => {
        const { name, value } = e.target;
        setProfile(prev => ({ ...prev, [name]: value }));
    };

    const handleTargetChange = (e) => {
        const { name, value } = e.target;
        setTargets(prev => ({ ...prev, [name]: parseInt(value) || 0 }));
    };

    const saveProfile = async () => {
        setLoading(true);
        try {
            const response = await authAPI.updateProfile({
                name: profile.name,
                profile: {
                    age: parseInt(profile.age) || 0,
                    gender: profile.gender,
                    height: parseInt(profile.height) || 0,
                    weight: parseInt(profile.weight) || 0,
                    activityLevel: profile.activityLevel,
                    goal: profile.goal
                }
            });
            updateUser(response.data.user);
            toast.success('Profile updated successfully! 🎉');
        } catch (error) {
            toast.error(error.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const saveTargets = async () => {
        setLoading(true);
        try {
            const response = await authAPI.updateTargets(targets);
            updateUser({ ...user, dailyTargets: response.data.dailyTargets });
            toast.success('Targets updated successfully! 🎯');
        } catch (error) {
            toast.error(error.message || 'Failed to update targets');
        } finally {
            setLoading(false);
        }
    };

    const calculateTargets = async () => {
        if (!profile.age || !profile.height || !profile.weight) {
            toast.error('Please fill in age, height, and weight first');
            return;
        }
        
        setCalculating(true);
        try {
            // First save profile, then calculate
            await authAPI.updateProfile({
                profile: {
                    age: parseInt(profile.age),
                    gender: profile.gender,
                    height: parseInt(profile.height),
                    weight: parseInt(profile.weight),
                    activityLevel: profile.activityLevel,
                    goal: profile.goal
                }
            });
            
            const response = await authAPI.calculateTargets();
            const newTargets = response.data.dailyTargets;
            setTargets(newTargets);
            updateUser({ ...user, dailyTargets: newTargets });
            toast.success('Targets calculated based on your profile! 🧮');
        } catch (error) {
            toast.error(error.message || 'Failed to calculate targets');
        } finally {
            setCalculating(false);
        }
    };

    const activityLevels = [
        { value: 'sedentary', label: 'Sedentary', desc: 'Little or no exercise' },
        { value: 'light', label: 'Light', desc: 'Exercise 1-3 days/week' },
        { value: 'moderate', label: 'Moderate', desc: 'Exercise 3-5 days/week' },
        { value: 'active', label: 'Active', desc: 'Exercise 6-7 days/week' },
        { value: 'veryActive', label: 'Very Active', desc: 'Hard exercise daily' }
    ];

    const goals = [
        { value: 'lose', label: 'Lose Weight', emoji: '📉' },
        { value: 'maintain', label: 'Maintain Weight', emoji: '⚖️' },
        { value: 'gain', label: 'Gain Weight', emoji: '📈' }
    ];

    return (
        <div className="profile-page">
            <div className="profile-container">
                <header className="profile-header">
                    <h1>Settings</h1>
                    <p>Manage your profile and nutrition targets</p>
                </header>

                {/* Tab Navigation */}
                <div className="profile-tabs">
                    <button 
                        className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
                        onClick={() => setActiveTab('profile')}
                    >
                        <FiUser /> Profile
                    </button>
                    <button 
                        className={`tab-btn ${activeTab === 'targets' ? 'active' : ''}`}
                        onClick={() => setActiveTab('targets')}
                    >
                        <FiTarget /> Targets
                    </button>
                </div>

                {/* Profile Tab */}
                {activeTab === 'profile' && (
                    <div className="profile-section">
                        <div className="form-card">
                            <h3><FiUser /> Personal Info</h3>
                            <div className="form-grid">
                                <div className="form-group full-width">
                                    <label>Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={profile.name}
                                        onChange={handleProfileChange}
                                        placeholder="Your name"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Age</label>
                                    <input
                                        type="number"
                                        name="age"
                                        value={profile.age}
                                        onChange={handleProfileChange}
                                        placeholder="25"
                                        min="10"
                                        max="120"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Gender</label>
                                    <select name="gender" value={profile.gender} onChange={handleProfileChange}>
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Height (cm)</label>
                                    <input
                                        type="number"
                                        name="height"
                                        value={profile.height}
                                        onChange={handleProfileChange}
                                        placeholder="170"
                                        min="100"
                                        max="250"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Weight (kg)</label>
                                    <input
                                        type="number"
                                        name="weight"
                                        value={profile.weight}
                                        onChange={handleProfileChange}
                                        placeholder="70"
                                        min="30"
                                        max="300"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="form-card">
                            <h3><FiActivity /> Activity Level</h3>
                            <div className="activity-grid">
                                {activityLevels.map(level => (
                                    <label 
                                        key={level.value}
                                        className={`activity-option ${profile.activityLevel === level.value ? 'active' : ''}`}
                                    >
                                        <input
                                            type="radio"
                                            name="activityLevel"
                                            value={level.value}
                                            checked={profile.activityLevel === level.value}
                                            onChange={handleProfileChange}
                                        />
                                        <span className="activity-label">{level.label}</span>
                                        <span className="activity-desc">{level.desc}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="form-card">
                            <h3><FiTarget /> Goal</h3>
                            <div className="goal-grid">
                                {goals.map(goal => (
                                    <label 
                                        key={goal.value}
                                        className={`goal-option ${profile.goal === goal.value ? 'active' : ''}`}
                                    >
                                        <input
                                            type="radio"
                                            name="goal"
                                            value={goal.value}
                                            checked={profile.goal === goal.value}
                                            onChange={handleProfileChange}
                                        />
                                        <span className="goal-emoji">{goal.emoji}</span>
                                        <span className="goal-label">{goal.label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <button className="btn btn-primary btn-save" onClick={saveProfile} disabled={loading}>
                            {loading ? <span className="spinner"></span> : <><FiSave /> Save Profile</>}
                        </button>
                    </div>
                )}

                {/* Targets Tab */}
                {activeTab === 'targets' && (
                    <div className="targets-section">
                        <div className="form-card">
                            <div className="card-header-with-action">
                                <h3><FiTarget /> Daily Nutrition Targets</h3>
                                <button 
                                    className="btn btn-secondary btn-sm"
                                    onClick={calculateTargets}
                                    disabled={calculating}
                                >
                                    {calculating ? <span className="spinner"></span> : <><FiRefreshCw /> Auto-Calculate</>}
                                </button>
                            </div>
                            <p className="help-text">Set your daily nutrition goals or auto-calculate based on your profile.</p>
                            
                            <div className="targets-grid">
                                <div className="target-card calories">
                                    <label>Calories</label>
                                    <div className="target-input-wrapper">
                                        <input
                                            type="number"
                                            name="calories"
                                            value={targets.calories}
                                            onChange={handleTargetChange}
                                            min="1000"
                                            max="5000"
                                        />
                                        <span className="unit">kcal</span>
                                    </div>
                                </div>
                                <div className="target-card protein">
                                    <label>Protein</label>
                                    <div className="target-input-wrapper">
                                        <input
                                            type="number"
                                            name="protein"
                                            value={targets.protein}
                                            onChange={handleTargetChange}
                                            min="50"
                                            max="400"
                                        />
                                        <span className="unit">g</span>
                                    </div>
                                </div>
                                <div className="target-card carbs">
                                    <label>Carbs</label>
                                    <div className="target-input-wrapper">
                                        <input
                                            type="number"
                                            name="carbs"
                                            value={targets.carbs}
                                            onChange={handleTargetChange}
                                            min="50"
                                            max="600"
                                        />
                                        <span className="unit">g</span>
                                    </div>
                                </div>
                                <div className="target-card fat">
                                    <label>Fat</label>
                                    <div className="target-input-wrapper">
                                        <input
                                            type="number"
                                            name="fat"
                                            value={targets.fat}
                                            onChange={handleTargetChange}
                                            min="20"
                                            max="200"
                                        />
                                        <span className="unit">g</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <button className="btn btn-primary btn-save" onClick={saveTargets} disabled={loading}>
                            {loading ? <span className="spinner"></span> : <><FiSave /> Save Targets</>}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Profile;
