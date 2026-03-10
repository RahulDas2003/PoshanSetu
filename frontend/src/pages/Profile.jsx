import { useState, useEffect } from 'react';
import { User, Target, Activity, Save, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
        { value: 'lose', label: 'Lose Weight', color: 'bg-blue-500' },
        { value: 'maintain', label: 'Maintain', color: 'bg-emerald-500' },
        { value: 'gain', label: 'Gain Muscle', color: 'bg-rose-500' }
    ];

    return (
        <div className="min-h-screen pt-28 pb-20 bg-background text-foreground">
            <div className="container mx-auto px-6 max-w-4xl space-y-8">
                
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3 mb-1">
                            <div className="bg-primary/10 text-primary p-2 rounded-lg">
                                <User className="h-6 w-6" />
                            </div>
                            Profile
                        </h1>
                        <p className="text-muted-foreground ml-1">Manage your personal settings</p>
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="flex p-1 bg-secondary rounded-full w-fit mx-auto lg:mx-0 animate-in fade-in slide-in-from-bottom-6 duration-700">
                    <Button 
                        variant={activeTab === 'profile' ? 'default' : 'ghost'}
                        className={`rounded-full px-8 font-semibold gap-2 ${activeTab !== 'profile' && 'text-muted-foreground hover:text-foreground'}`}
                        onClick={() => setActiveTab('profile')}
                    >
                        <User className="h-4 w-4" /> Info
                    </Button>
                    <Button 
                        variant={activeTab === 'targets' ? 'default' : 'ghost'}
                        className={`rounded-full px-8 font-semibold gap-2 ${activeTab !== 'targets' && 'text-muted-foreground hover:text-foreground'}`}
                        onClick={() => setActiveTab('targets')}
                    >
                        <Target className="h-4 w-4" /> Targets
                    </Button>
                </div>

                {/* Profile Tab */}
                {activeTab === 'profile' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
                        {/* Personal Info Grid */}
                        <Card className="shadow-sm border">
                            <CardHeader className="bg-muted/30 border-b">
                                <div className="flex items-center gap-2">
                                    <div className="bg-background p-1.5 rounded-md shadow-sm border text-muted-foreground">
                                        <User className="h-4 w-4" />
                                    </div>
                                    <CardTitle>Personal Info</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2 md:col-span-2">
                                        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-1">Full Name</label>
                                        <Input
                                            type="text"
                                            name="name"
                                            value={profile.name}
                                            onChange={handleProfileChange}
                                            placeholder="Your full name"
                                            className="h-12 bg-secondary/50 rounded-xl"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-1">Age</label>
                                        <Input
                                            type="number"
                                            name="age"
                                            value={profile.age}
                                            onChange={handleProfileChange}
                                            placeholder="25"
                                            className="h-12 bg-secondary/50 rounded-xl"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-1">Gender</label>
                                        <select 
                                            name="gender" 
                                            value={profile.gender} 
                                            onChange={handleProfileChange}
                                            className="w-full h-12 bg-secondary/50 border border-input rounded-xl px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring transition-colors"
                                        >
                                            <option value="male">Male</option>
                                            <option value="female">Female</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-1">Height (cm)</label>
                                        <Input
                                            type="number"
                                            name="height"
                                            value={profile.height}
                                            onChange={handleProfileChange}
                                            placeholder="170"
                                            className="h-12 bg-secondary/50 rounded-xl"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-1">Weight (kg)</label>
                                        <Input
                                            type="number"
                                            name="weight"
                                            value={profile.weight}
                                            onChange={handleProfileChange}
                                            placeholder="70"
                                            className="h-12 bg-secondary/50 rounded-xl"
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Goal Cards */}
                        <Card className="shadow-sm border">
                            <CardHeader className="bg-muted/30 border-b">
                                <div className="flex items-center gap-2">
                                    <div className="bg-background p-1.5 rounded-md shadow-sm border text-muted-foreground">
                                        <Target className="h-4 w-4" />
                                    </div>
                                    <CardTitle>Main Goal</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    {goals.map(goal => (
                                        <label 
                                            key={goal.value}
                                            className={`relative flex flex-col items-center justify-center p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300 ${profile.goal === goal.value ? `border-primary bg-primary/5 shadow-sm` : `border-transparent bg-secondary/50 text-muted-foreground hover:border-border`}`}
                                        >
                                            <input
                                                type="radio"
                                                name="goal"
                                                value={goal.value}
                                                checked={profile.goal === goal.value}
                                                onChange={handleProfileChange}
                                                className="sr-only"
                                            />
                                            <span className="text-4xl mb-3 block transform transition-transform group-hover:scale-110">{goal.emoji}</span>
                                            <span className="font-semibold">{goal.label}</span>
                                        </label>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Activity Level List */}
                        <Card className="shadow-sm border">
                            <CardHeader className="bg-muted/30 border-b">
                                <div className="flex items-center gap-2">
                                    <div className="bg-background p-1.5 rounded-md shadow-sm border text-muted-foreground">
                                        <Activity className="h-4 w-4" />
                                    </div>
                                    <CardTitle>Activity Level</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="space-y-3">
                                    {activityLevels.map(level => (
                                        <label 
                                            key={level.value}
                                            className={`flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${profile.activityLevel === level.value ? 'border-primary bg-primary/5' : 'border-transparent bg-secondary/30 hover:bg-secondary/60 hover:border-border'}`}
                                        >
                                            <input
                                                type="radio"
                                                name="activityLevel"
                                                value={level.value}
                                                checked={profile.activityLevel === level.value}
                                                onChange={handleProfileChange}
                                                className="w-5 h-5 accent-primary border-slate-300 focus:ring-primary"
                                            />
                                            <div className="ml-4">
                                                <div className={`font-semibold ${profile.activityLevel === level.value ? 'text-foreground' : 'text-muted-foreground'}`}>{level.label}</div>
                                                <div className="text-sm text-muted-foreground">{level.desc}</div>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Save Button */}
                        <div className="flex justify-end pt-2 pb-6">
                            <Button 
                                size="lg"
                                className="rounded-full px-8 gap-2 shadow-md w-full sm:w-auto"
                                onClick={saveProfile} 
                                disabled={loading}
                            >
                                {loading ? (
                                    <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin"></div>
                                ) : (
                                    <><Save className="h-4 w-4" /> Save Profile</>
                                )}
                            </Button>
                        </div>
                    </div>
                )}

                {/* Targets Tab */}
                {activeTab === 'targets' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
                        <Card className="shadow-sm border">
                            <CardHeader className="bg-muted/30 border-b flex flex-row items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="bg-background p-1.5 rounded-md shadow-sm border text-muted-foreground">
                                        <Target className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <CardTitle className="mb-1">Daily Nutrition Targets</CardTitle>
                                        <CardDescription>Set goals manually or calculate them automatically</CardDescription>
                                    </div>
                                </div>
                                <Button 
                                    variant="outline"
                                    size="sm"
                                    className="rounded-full gap-2 whitespace-nowrap"
                                    onClick={calculateTargets}
                                    disabled={calculating}
                                >
                                    {calculating ? (
                                        <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                                    ) : (
                                        <><RefreshCw className="h-3 w-3" /> Auto-Calc</>
                                    )}
                                </Button>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="bg-secondary/40 p-5 rounded-2xl border">
                                        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-3">Calories</label>
                                        <div className="flex items-end">
                                            <Input
                                                type="number"
                                                name="calories"
                                                value={targets.calories}
                                                onChange={handleTargetChange}
                                                className="bg-transparent border-0 text-4xl font-black text-foreground outline-none w-32 px-0 h-auto focus-visible:ring-0 shadow-none -ml-1 text-left"
                                            />
                                            <span className="text-sm font-semibold text-muted-foreground mb-1">kcal</span>
                                        </div>
                                    </div>
                                    
                                    <div className="bg-emerald-500/5 dark:bg-emerald-500/10 p-5 rounded-2xl border border-emerald-500/20">
                                        <label className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block mb-3">Protein</label>
                                        <div className="flex items-end">
                                            <Input
                                                type="number"
                                                name="protein"
                                                value={targets.protein}
                                                onChange={handleTargetChange}
                                                className="bg-transparent border-0 text-4xl font-black text-emerald-600 dark:text-emerald-400 outline-none w-32 px-0 h-auto focus-visible:ring-0 shadow-none -ml-1 text-left"
                                            />
                                            <span className="text-sm font-semibold text-emerald-600/60 dark:text-emerald-400/60 mb-1">g</span>
                                        </div>
                                    </div>

                                    <div className="bg-blue-500/5 dark:bg-blue-500/10 p-5 rounded-2xl border border-blue-500/20">
                                        <label className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 block mb-3">Carbs</label>
                                        <div className="flex items-end">
                                            <Input
                                                type="number"
                                                name="carbs"
                                                value={targets.carbs}
                                                onChange={handleTargetChange}
                                                className="bg-transparent border-0 text-4xl font-black text-blue-600 dark:text-blue-400 outline-none w-32 px-0 h-auto focus-visible:ring-0 shadow-none -ml-1 text-left"
                                            />
                                            <span className="text-sm font-semibold text-blue-600/60 dark:text-blue-400/60 mb-1">g</span>
                                        </div>
                                    </div>

                                    <div className="bg-amber-500/5 dark:bg-amber-500/10 p-5 rounded-2xl border border-amber-500/20">
                                        <label className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 block mb-3">Fat</label>
                                        <div className="flex items-end">
                                            <Input
                                                type="number"
                                                name="fat"
                                                value={targets.fat}
                                                onChange={handleTargetChange}
                                                className="bg-transparent border-0 text-4xl font-black text-amber-600 dark:text-amber-400 outline-none w-32 px-0 h-auto focus-visible:ring-0 shadow-none -ml-1 text-left"
                                            />
                                            <span className="text-sm font-semibold text-amber-600/60 dark:text-amber-400/60 mb-1">g</span>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="flex justify-end pt-2 pb-6">
                            <Button 
                                size="lg"
                                className="rounded-full px-8 gap-2 shadow-md w-full sm:w-auto"
                                onClick={saveTargets} 
                                disabled={loading}
                            >
                                {loading ? (
                                    <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin"></div>
                                ) : (
                                    <><Save className="h-4 w-4" /> Save Targets</>
                                )}
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Profile;
