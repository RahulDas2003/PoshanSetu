import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Target, TrendingUp, Calendar, ChevronRight, RefreshCw, Flame, Activity, Zap, HeartPulse, Info } from 'lucide-react';
import { dashboardAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { PieChart, Pie, Cell, LineChart, Line, ResponsiveContainer, Tooltip, XAxis } from 'recharts';

const Dashboard = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);
    const [weeklyData, setWeeklyData] = useState(null);
    const [insights, setInsights] = useState([]);

    useEffect(() => {
        fetchAllData();
    }, []);

    const fetchAllData = async () => {
        setLoading(true);
        try {
            const [dailyRes, weeklyRes, insightsRes] = await Promise.all([
                dashboardAPI.getDaily(),
                dashboardAPI.getWeekly(),
                dashboardAPI.getInsights()
            ]);
            setData(dailyRes.data);
            setWeeklyData(weeklyRes.data);
            setInsights(insightsRes.data.insights || []);
        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
            toast.error('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen pt-24 pb-12 flex flex-col items-center justify-center container mx-auto px-6">
                <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4"></div>
                <p className="text-sm font-medium text-muted-foreground">Loading dashboard metrics...</p>
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

    // Health Score Calculation
    const calcHealthScore = () => {
        const calRatio = consumed.calories / targets.calories;
        const calScore = calRatio > 1.2 ? 50 : calRatio < 0.5 ? 50 : 100 - Math.abs(1 - calRatio) * 100;
        
        const proteinScore = Math.min(100, (consumed.protein / targets.protein) * 100);
        
        let score = Math.round((calScore * 0.4) + (proteinScore * 0.4) + (streak.current > 0 ? 20 : 10));
        return Math.max(0, Math.min(100, score));
    };
    const healthScore = calcHealthScore();

    // Chart formatting
    const weeklyChartData = weeklyData?.dailyData?.map(d => ({
        name: new Date(d._id).toLocaleDateString('en-US', { weekday: 'short' }),
        calories: d.calories
    })) || [];

    const getMealTypeLabel = (type) => {
        const labels = { breakfast: 'Breakfast', lunch: 'Lunch', dinner: 'Dinner', snack: 'Snack' };
        return labels[type] || type;
    };

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    };

    // Macro Radial Chart Component
    const MacroRing = ({ label, consumed, target, progress, colorHex, trackColorHex }) => {
        const data = [
            { name: 'Consumed', value: Math.min(consumed, target) },
            { name: 'Remaining', value: Math.max(0, target - consumed) }
        ];
        
        // If over target, we just show full ring
        if (consumed > target) {
            data[0].value = target;
            data[1].value = 0;
        }

        return (
            <div className="flex flex-col items-center justify-center group">
                <div className="relative w-28 h-28 transform transition-transform duration-300 group-hover:scale-110">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                innerRadius={35}
                                outerRadius={45}
                                stroke="none"
                                dataKey="value"
                                startAngle={90}
                                endAngle={-270}
                                cornerRadius={10}
                            >
                                <Cell fill={colorHex} />
                                <Cell fill={trackColorHex} />
                            </Pie>
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-xl font-bold leading-none">{Math.round(progress)}%</span>
                    </div>
                </div>
                <div className="text-center mt-2">
                    <p className="text-sm font-semibold">{label}</p>
                    <p className="text-xs text-muted-foreground">{Math.round(consumed)}g / {target}g</p>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen pt-28 pb-20 bg-background text-foreground">
            <div className="container mx-auto px-6 max-w-7xl space-y-8">
                
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight mb-1">Overview</h1>
                        <p className="text-muted-foreground">Track your nutrition journey and daily goals.</p>
                    </div>
                    <Button 
                        variant="outline" 
                        size="sm"
                        onClick={fetchAllData}
                        className="self-start sm:self-auto gap-2 hover:bg-secondary/80 transition-all duration-200"
                    >
                        <RefreshCw className="h-4 w-4" />
                        Refresh
                    </Button>
                </div>

                {/* Top Metrics Row - 4 Cols */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in slide-in-from-bottom-6 duration-700">
                    <Card className="hover:shadow-lg hover:scale-[1.02] transition-all duration-200 cursor-default">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Calories Consumed</CardTitle>
                            <Zap className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold tracking-tight">{Math.round(consumed.calories)}</div>
                            <p className="text-xs text-muted-foreground mt-1 font-medium">
                                Goal: {targets.calories} kcal
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="hover:shadow-lg hover:scale-[1.02] transition-all duration-200 cursor-default">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Remaining Calories</CardTitle>
                            <Target className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className={`text-2xl font-bold tracking-tight ${remaining.calories < 0 ? 'text-destructive' : ''}`}>
                                {Math.round(remaining.calories)}
                            </div>
                            <Progress value={calorieProgress} className="h-2 mt-3" />
                        </CardContent>
                    </Card>

                    <Card className="hover:shadow-lg hover:scale-[1.02] transition-all duration-200 cursor-default">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Day Streak</CardTitle>
                            <Flame className={`h-4 w-4 ${streak.current > 0 ? 'text-orange-500 fill-orange-500/20' : 'text-muted-foreground'}`} />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold tracking-tight">{streak.current} Days</div>
                            <p className="text-xs text-muted-foreground mt-1 font-medium">
                                {streak.longest > 0 ? `Best streak: ${streak.longest} days` : 'Start your streak today!'}
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="hover:shadow-lg hover:scale-[1.02] transition-all duration-200 cursor-default bg-primary text-primary-foreground border-primary">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 text-primary-foreground/90">
                            <CardTitle className="text-sm font-medium">Health Score</CardTitle>
                            <HeartPulse className="h-4 w-4" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold tracking-tight">{healthScore} / 100</div>
                            <p className="text-xs text-primary-foreground/80 mt-1 font-medium flex items-center gap-1">
                                {healthScore > 80 ? 'Excellent progress today!' : healthScore > 60 ? 'Good, keep going.' : 'Needs improvement.'}
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                    
                    {/* Left & Center Column - Macros & Charts */}
                    <div className="lg:col-span-2 space-y-6 flex flex-col">
                        
                        {/* Circular Macros Chart Card */}
                        <Card className="shadow-sm border">
                            <CardHeader className="border-b bg-muted/20">
                                <CardTitle className="flex items-center gap-2">
                                    <Activity className="h-5 w-5 text-primary" />
                                    Daily Macros
                                </CardTitle>
                                <CardDescription>Nutrition breakdown according to your goals.</CardDescription>
                            </CardHeader>
                            <CardContent className="p-8">
                                <div className="flex flex-wrap justify-between items-center gap-6">
                                    <MacroRing 
                                        label="Protein" 
                                        consumed={consumed.protein} 
                                        target={targets.protein} 
                                        progress={progress.protein} 
                                        colorHex="#f43f5e" 
                                        trackColorHex="var(--secondary)" 
                                    />
                                    <MacroRing 
                                        label="Carbs" 
                                        consumed={consumed.carbs} 
                                        target={targets.carbs} 
                                        progress={progress.carbs} 
                                        colorHex="#3b82f6" 
                                        trackColorHex="var(--secondary)" 
                                    />
                                    <MacroRing 
                                        label="Fat" 
                                        consumed={consumed.fat} 
                                        target={targets.fat} 
                                        progress={progress.fat} 
                                        colorHex="#f59e0b" 
                                        trackColorHex="var(--secondary)" 
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Middle Row - Insights & Mini Chart */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
                            {/* Health Insights */}
                            <Card className="shadow-sm border flex flex-col">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <Info className="h-4 w-4 text-muted-foreground" />
                                        Today's Insights
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="flex-1">
                                    <div className="space-y-3">
                                        {healthScore > 80 && (
                                            <div className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 p-3 rounded-lg text-sm font-medium border border-emerald-500/20">
                                                Great macro balance maintained!
                                            </div>
                                        )}
                                        {consumed.protein >= targets.protein * 0.8 && (
                                            <div className="bg-blue-500/10 text-blue-600 dark:text-blue-400 p-3 rounded-lg text-sm font-medium border border-blue-500/20">
                                                Good protein intake today.
                                            </div>
                                        )}
                                        {consumed.protein < targets.protein * 0.5 && meals.length > 0 && (
                                            <div className="bg-rose-500/10 text-rose-600 dark:text-rose-400 p-3 rounded-lg text-sm font-medium border border-rose-500/20">
                                                Protein intake is low. Consider adding eggs or paneer.
                                            </div>
                                        )}
                                        {meals.length === 0 && (
                                            <div className="text-muted-foreground text-sm flex items-center justify-center p-4 border border-dashed rounded-lg h-full">
                                                Insights will appear here once you log meals.
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Mini Weekly Calorie Chart */}
                            <Card className="shadow-sm border flex flex-col">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                                        Past 7 Days
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-0 flex-1 min-h-[150px]">
                                    {weeklyChartData.length > 0 ? (
                                        <ResponsiveContainer width="100%" height="100%">
                                            <LineChart data={weeklyChartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                                                <Tooltip 
                                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                                    cursor={{ stroke: 'var(--border)' }}
                                                />
                                                <Line 
                                                    type="monotone" 
                                                    dataKey="calories" 
                                                    stroke="var(--primary)" 
                                                    strokeWidth={3} 
                                                    dot={{ r: 4, fill: 'var(--primary)', strokeWidth: 0 }} 
                                                    activeDot={{ r: 6, strokeWidth: 0 }}
                                                />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-sm text-muted-foreground p-4">
                                            Not enough weekly data.
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* Right Column - Actions & Timeline */}
                    <div className="space-y-6 flex flex-col">
                        
                        {/* Quick Actions Card */}
                        <Card className="shadow-sm">
                            <CardContent className="p-6 grid grid-cols-2 gap-3">
                                <Button variant="outline" className="h-[4.5rem] flex-col gap-1.5 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-200" asChild>
                                    <Link to="/log-meal">
                                        <Plus className="h-5 w-5" />
                                        <span className="text-xs font-semibold">Log Meal</span>
                                    </Link>
                                </Button>
                                <Button variant="outline" className="h-[4.5rem] flex-col gap-1.5 hover:bg-secondary transition-all duration-200" asChild>
                                    <Link to="/ai-assistant">
                                        <Zap className="h-5 w-5 text-orange-500" />
                                        <span className="text-xs font-semibold">Ask AI</span>
                                    </Link>
                                </Button>
                                <Button variant="outline" className="h-[4.5rem] flex-col gap-1.5 hover:bg-secondary transition-all duration-200" asChild>
                                    <Link to="/analytics">
                                        <TrendingUp className="h-5 w-5 text-green-500" />
                                        <span className="text-xs font-semibold">Analytics</span>
                                    </Link>
                                </Button>
                                <Button variant="outline" className="h-[4.5rem] flex-col gap-1.5 hover:bg-secondary transition-all duration-200" asChild>
                                    <Link to="/profile">
                                        <Target className="h-5 w-5 text-rose-500" />
                                        <span className="text-xs font-semibold">Goals</span>
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>

                        <Card className="flex-1 shadow-sm flex flex-col overflow-hidden border">
                            <CardHeader className="flex flex-row items-center justify-between pb-3 bg-muted/10 border-b">
                                <div>
                                    <CardTitle className="text-lg">Today's Log</CardTitle>
                                </div>
                                <Button variant="ghost" size="sm" className="hidden sm:flex gap-1 h-8 text-xs" asChild>
                                    <Link to="/meals">
                                        View All <ChevronRight className="h-3 w-3" />
                                    </Link>
                                </Button>
                            </CardHeader>
                            <CardContent className="p-0 flex-1 max-h-[400px] overflow-y-auto scrollbar-hide">
                                {meals.length === 0 ? (
                                    <div className="p-8 flex flex-col items-center justify-center text-center space-y-4">
                                        <div className="bg-primary/5 p-4 rounded-full">
                                            <Calendar className="h-8 w-8 text-primary/50" />
                                        </div>
                                        <div className="space-y-2">
                                            <p className="font-bold text-lg">Start by logging your breakfast.</p>
                                            <div className="text-sm text-muted-foreground text-left bg-muted/30 p-4 rounded-lg border">
                                                <p className="font-semibold mb-2">A balanced meal should contain:</p>
                                                <ul className="list-disc pl-5 space-y-1">
                                                    <li>Protein for muscle repair</li>
                                                    <li>Complex carbs for energy</li>
                                                    <li>Healthy fats for satiety</li>
                                                </ul>
                                            </div>
                                        </div>
                                        <Button asChild className="w-full mt-2 rounded-xl">
                                            <Link to="/log-meal">Log Meal Now</Link>
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-border">
                                        {meals.map((meal, index) => (
                                            <div key={meal._id || index} className="p-5 hover:bg-muted/10 transition-colors">
                                                <div className="flex justify-between items-start">
                                                    <div className="flex gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center shrink-0">
                                                            {getMealTypeLabel(meal.mealType).charAt(0)}
                                                        </div>
                                                        <div>
                                                            <div className="font-semibold">{getMealTypeLabel(meal.mealType)}</div>
                                                            <div className="text-xs text-muted-foreground font-medium mt-0.5">
                                                                {formatTime(meal.createdAt)} • {meal.foods?.length || 0} items
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="font-bold text-sm bg-background border px-2.5 py-1 rounded-md shadow-sm">
                                                        {Math.round(meal.totalNutrition?.calories || 0)} <span className="text-muted-foreground/70 text-[10px] uppercase">kcal</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;

