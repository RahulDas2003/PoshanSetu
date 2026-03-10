import { useState, useEffect } from 'react';
import { TrendingUp, Calendar, Target, Award, Info, AlertTriangle, CheckCircle2, Activity, PieChart as PieChartIcon, BarChart2 } from 'lucide-react';
import { dashboardAPI } from '../services/api';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, 
    BarChart, Bar, PieChart, Pie, Cell, Legend 
} from 'recharts';

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
            
            // Generate extra insights (e.g. Malnutrition Risk Detection) based on data
            const fetchedInsights = insightsRes.data.insights || [];
            
            if (weekly.data?.averages?.protein < 50 && weekly.data?.daysLogged > 3) {
                fetchedInsights.push({
                    type: 'warning',
                    title: 'Malnutrition Risk: Low Protein',
                    message: 'Your average protein intake is critically low. Consider adding more lean meats, eggs, or legumes to prevent muscle loss.'
                });
            }
            if (weekly.data?.averages?.calories < 1200 && weekly.data?.daysLogged > 3) {
                fetchedInsights.push({
                    type: 'warning',
                    title: 'Caloric Deficit Alert',
                    message: 'You are consistently eating under 1200 calories. This may lead to malnutrition. Please ensure you are meeting your basal metabolic rate.'
                });
            }

            setInsights(fetchedInsights);
        } catch (error) {
            console.error('Failed to fetch analytics:', error);
            toast.error('Failed to load analytics');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen pt-24 pb-12 flex flex-col items-center justify-center container mx-auto px-6">
                <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4"></div>
                <p className="text-xl font-medium text-muted-foreground">Loading analytics...</p>
            </div>
        );
    }

    const getDayName = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { weekday: 'short' });
    };

    // Format Data for Recharts
    const chartData = (weeklyData?.dailyData || []).map(day => ({
        name: getDayName(day._id),
        calories: Math.round(day.calories),
        protein: Math.round(day.protein),
        carbs: Math.round(day.carbs),
        fat: Math.round(day.fat)
    }));

    // Data for Macro Balance Pie Chart
    const avgMacros = weeklyData?.averages || { protein: 0, carbs: 0, fat: 0 };
    const macroPieData = [
        { name: 'Protein', value: avgMacros.protein, color: '#f43f5e' }, // rose-500
        { name: 'Carbs', value: avgMacros.carbs, color: '#3b82f6' },   // blue-500
        { name: 'Fat', value: avgMacros.fat, color: '#f59e0b' }        // amber-500
    ].filter(m => m.value > 0);

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-card border shadow-lg rounded-lg p-3 text-sm">
                    <p className="font-bold border-b pb-1 mb-2">{label}</p>
                    {payload.map((entry, index) => (
                        <div key={index} className="flex items-center gap-2 mb-1">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></div>
                            <span className="font-medium text-muted-foreground">{entry.name}:</span>
                            <span className="font-bold">{entry.value}{entry.name === 'Calories' ? ' kcal' : 'g'}</span>
                        </div>
                    ))}
                </div>
            );
        }
        return null;
    };

    return (
        <div className="min-h-screen pt-28 pb-20 bg-background text-foreground">
            <div className="container mx-auto px-6 max-w-5xl space-y-8">
                
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3 mb-1">
                            <div className="bg-primary/10 text-primary p-2 rounded-lg">
                                <TrendingUp className="h-6 w-6" />
                            </div>
                            Analytics
                        </h1>
                        <p className="text-muted-foreground ml-1">Visualize your nutrition progress and risks</p>
                    </div>
                </div>

                {/* Insights Section */}
                {insights.length > 0 && (
                    <div className="grid gap-4 animate-slide-up delay-100">
                        {insights.map((insight, index) => {
                            const isSuccess = insight.type === 'success';
                            const isWarning = insight.type === 'warning';
                            const bgColor = isSuccess ? 'bg-emerald-500/10 dark:bg-emerald-500/20' : isWarning ? 'bg-amber-500/10 dark:bg-amber-500/20' : 'bg-blue-500/10 dark:bg-blue-500/20';
                            const textColor = isSuccess ? 'text-emerald-700 dark:text-emerald-400' : isWarning ? 'text-amber-700 dark:text-amber-400' : 'text-blue-700 dark:text-blue-400';
                            const borderColor = isSuccess ? 'border-emerald-200 dark:border-emerald-800' : isWarning ? 'border-amber-200 dark:border-amber-800' : 'border-blue-200 dark:border-blue-800';
                            const Icon = isSuccess ? CheckCircle2 : isWarning ? AlertTriangle : Info;
                            
                            return (
                                <Card key={index} className={`border shadow-none ${bgColor} ${borderColor} translate-y-0 transition-transform hover:-translate-y-1`}>
                                    <div className="p-4 flex items-start gap-4">
                                        <div className={`${textColor} shrink-0 mt-0.5`}>
                                            <Icon className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <h4 className={`text-sm font-bold mb-0.5 ${textColor}`}>{insight.title}</h4>
                                            <p className="text-sm font-medium opacity-90 text-foreground">{insight.message}</p>
                                        </div>
                                    </div>
                                </Card>
                            );
                        })}
                    </div>
                )}

                {/* Stats Overview */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-in fade-in slide-in-from-bottom-8 duration-700">
                    <Card className="shadow-sm hover:shadow-md transition-shadow">
                        <CardContent className="p-6 text-center flex flex-col items-center justify-center">
                            <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center mb-3">
                                <Calendar className="h-5 w-5 text-muted-foreground" />
                            </div>
                            <div className="text-3xl font-bold tracking-tight mb-1">{weeklyData?.daysLogged || 0}</div>
                            <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Days Logged</div>
                        </CardContent>
                    </Card>
                    
                    <Card className="shadow-sm hover:shadow-md transition-shadow">
                        <CardContent className="p-6 text-center flex flex-col items-center justify-center">
                            <div className="w-10 h-10 bg-emerald-500/10 rounded-full flex items-center justify-center mb-3">
                                <Target className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <div className="text-3xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400 mb-1">{weeklyData?.goalAdherence || 0}%</div>
                            <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Adherence</div>
                        </CardContent>
                    </Card>

                    <Card className="shadow-sm hover:shadow-md transition-shadow">
                        <CardContent className="p-6 text-center flex flex-col items-center justify-center">
                            <div className="w-10 h-10 bg-blue-500/10 rounded-full flex items-center justify-center mb-3">
                                <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div className="text-3xl font-bold tracking-tight text-blue-600 dark:text-blue-400 mb-1">{Math.round(weeklyData?.averages?.calories || 0)}</div>
                            <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Avg Cals</div>
                        </CardContent>
                    </Card>

                    <Card className="shadow-sm hover:shadow-md transition-shadow">
                        <CardContent className="p-6 text-center flex flex-col items-center justify-center">
                            <div className="w-10 h-10 bg-purple-500/10 rounded-full flex items-center justify-center mb-3">
                                <Award className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                            </div>
                            <div className="text-3xl font-bold tracking-tight text-purple-600 dark:text-purple-400 mb-1">{weeklyData?.totalMeals || 0}</div>
                            <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Total Meals</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Tab Navigation */}
                <div className="flex p-1 bg-secondary rounded-full w-fit mx-auto lg:mx-0 animate-in fade-in slide-in-from-bottom-12 duration-1000">
                    <Button 
                        variant={activeTab === 'weekly' ? 'default' : 'ghost'}
                        className={`rounded-full px-6 font-semibold h-9 ${activeTab !== 'weekly' && 'text-muted-foreground hover:text-foreground'}`}
                        onClick={() => setActiveTab('weekly')}
                    >
                        Weekly
                    </Button>
                    <Button 
                        variant={activeTab === 'monthly' ? 'default' : 'ghost'}
                        className={`rounded-full px-6 font-semibold h-9 ${activeTab !== 'monthly' && 'text-muted-foreground hover:text-foreground'}`}
                        onClick={() => setActiveTab('monthly')}
                    >
                        Monthly
                    </Button>
                </div>

                {/* Weekly View */}
                {activeTab === 'weekly' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        
                        {/* Weekly Calories Line Chart */}
                        <Card className="shadow-sm border overflow-hidden">
                            <CardHeader className="bg-muted/30 border-b pb-4">
                                <div className="flex items-center gap-2">
                                    <div className="bg-background p-1.5 rounded-md shadow-sm border text-muted-foreground">
                                        <Activity className="h-4 w-4" />
                                    </div>
                                    <CardTitle>Weekly Calorie Trend</CardTitle>
                                </div>
                                <CardDescription>Your daily caloric intake over the last 7 days.</CardDescription>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="h-[300px] w-full">
                                    {chartData.length > 0 ? (
                                        <ResponsiveContainer width="100%" height="100%">
                                            <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                                                <XAxis 
                                                    dataKey="name" 
                                                    axisLine={false} 
                                                    tickLine={false} 
                                                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                                                    dy={10}
                                                />
                                                <YAxis 
                                                    axisLine={false} 
                                                    tickLine={false} 
                                                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                                                    dx={-10}
                                                />
                                                <RechartsTooltip content={<CustomTooltip />} />
                                                <Line 
                                                    type="monotone" 
                                                    dataKey="calories" 
                                                    name="Calories"
                                                    stroke="hsl(var(--primary))" 
                                                    strokeWidth={3}
                                                    dot={{ r: 4, fill: 'hsl(var(--primary))', strokeWidth: 2, stroke: 'hsl(var(--background))' }}
                                                    activeDot={{ r: 6, fill: 'hsl(var(--primary))' }}
                                                />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    ) : (
                                        <div className="h-full flex items-center justify-center text-muted-foreground border-2 border-dashed rounded-xl">
                                            No data available for this week
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Protein Bar Chart */}
                            <Card className="shadow-sm border">
                                <CardHeader className="bg-muted/30 border-b pb-4">
                                    <div className="flex items-center gap-2">
                                        <div className="bg-background p-1.5 rounded-md shadow-sm border text-muted-foreground">
                                            <BarChart2 className="h-4 w-4" />
                                        </div>
                                        <CardTitle>Protein Intake Trend</CardTitle>
                                    </div>
                                    <CardDescription>Daily protein consumption (g).</CardDescription>
                                </CardHeader>
                                <CardContent className="p-6">
                                    <div className="h-[250px] w-full">
                                        {chartData.length > 0 ? (
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} dy={10} />
                                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} dx={-10} />
                                                    <RechartsTooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted))' }} />
                                                    <Bar dataKey="protein" name="Protein" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        ) : (
                                            <div className="h-full flex items-center justify-center text-muted-foreground border-2 border-dashed rounded-xl">
                                                No data available
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Macro Balance Pie Chart */}
                            <Card className="shadow-sm border flex flex-col">
                                <CardHeader className="bg-muted/30 border-b pb-4">
                                    <div className="flex items-center gap-2">
                                        <div className="bg-background p-1.5 rounded-md shadow-sm border text-muted-foreground">
                                            <PieChartIcon className="h-4 w-4" />
                                        </div>
                                        <CardTitle>Average Macro Balance</CardTitle>
                                    </div>
                                    <CardDescription>Distribution of macros this week.</CardDescription>
                                </CardHeader>
                                <CardContent className="p-6 flex-1 flex flex-col justify-center items-center">
                                    {macroPieData.length > 0 ? (
                                        <div className="h-[200px] w-full relative">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <PieChart>
                                                    <Pie
                                                        data={macroPieData}
                                                        cx="50%"
                                                        cy="50%"
                                                        innerRadius={60}
                                                        outerRadius={80}
                                                        paddingAngle={5}
                                                        dataKey="value"
                                                        stroke="none"
                                                    >
                                                        {macroPieData.map((entry, index) => (
                                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                                        ))}
                                                    </Pie>
                                                    <RechartsTooltip 
                                                        formatter={(value, name) => [`${Math.round(value)}g`, name]}
                                                        contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', backgroundColor: 'hsl(var(--card))' }}
                                                    />
                                                </PieChart>
                                            </ResponsiveContainer>
                                            {/* Center Text */}
                                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                                <span className="text-2xl font-bold">{Math.round(avgMacros.protein + avgMacros.carbs + avgMacros.fat)}g</span>
                                                <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Total Macros</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="h-[200px] w-full flex items-center justify-center text-muted-foreground border-2 border-dashed rounded-xl">
                                            No macro data available
                                        </div>
                                    )}

                                    {/* Custom Legend */}
                                    <div className="grid grid-cols-3 gap-2 w-full mt-6">
                                        <div className="bg-card p-3 rounded-xl border flex flex-col items-center justify-center shadow-sm">
                                            <div className="flex items-center gap-2 mb-1">
                                                <div className="w-2 h-2 rounded-full bg-rose-500"></div>
                                                <span className="font-semibold text-xs text-muted-foreground uppercase tracking-wider">Pro</span>
                                            </div>
                                            <div className="text-sm font-bold text-rose-600 dark:text-rose-400">{Math.round(avgMacros.protein)}g</div>
                                        </div>
                                        <div className="bg-card p-3 rounded-xl border flex flex-col items-center justify-center shadow-sm">
                                            <div className="flex items-center gap-2 mb-1">
                                                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                                <span className="font-semibold text-xs text-muted-foreground uppercase tracking-wider">Carb</span>
                                            </div>
                                            <div className="text-sm font-bold text-blue-600 dark:text-blue-400">{Math.round(avgMacros.carbs)}g</div>
                                        </div>
                                        <div className="bg-card p-3 rounded-xl border flex flex-col items-center justify-center shadow-sm">
                                            <div className="flex items-center gap-2 mb-1">
                                                <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                                                <span className="font-semibold text-xs text-muted-foreground uppercase tracking-wider">Fat</span>
                                            </div>
                                            <div className="text-sm font-bold text-amber-600 dark:text-amber-400">{Math.round(avgMacros.fat)}g</div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                )}

                {/* Monthly View */}
                {activeTab === 'monthly' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* Weight Progress */}
                        <Card className="shadow-sm border">
                            <CardHeader className="bg-muted/30 border-b">
                                <div className="flex items-center gap-2">
                                    <div className="bg-background p-1.5 rounded-md shadow-sm border text-muted-foreground">
                                        <Target className="h-4 w-4" />
                                    </div>
                                    <CardTitle>Weight Progress</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="p-6">
                                {monthlyData?.weightLogs?.length > 0 ? (
                                    <div>
                                        <div className="flex items-end gap-4 mb-8">
                                            <div>
                                                <div className="text-5xl font-bold tracking-tight leading-none">
                                                    {monthlyData.currentWeight || '--'}
                                                </div>
                                                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mt-2">Current (kg)</div>
                                            </div>
                                            
                                            {monthlyData.weightChange !== null && (
                                                <div className={`px-3 py-1 rounded-md text-sm font-bold mb-1 border ${monthlyData.weightChange >= 0 ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20' : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20'}`}>
                                                    {monthlyData.weightChange >= 0 ? '+' : ''}{monthlyData.weightChange.toFixed(1)} kg
                                                </div>
                                            )}
                                        </div>
                                        
                                        <div className="space-y-2">
                                            {monthlyData.weightLogs.slice(-5).reverse().map((log, index) => (
                                                <div key={index} className="flex justify-between items-center p-3 bg-secondary/50 rounded-lg border text-sm">
                                                    <span className="font-medium text-muted-foreground">
                                                        {new Date(log.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                    </span>
                                                    <span className="font-bold">{log.weight} kg</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-12 border-2 border-dashed rounded-xl my-4 opacity-70">
                                        <Target className="h-10 w-10 mx-auto text-muted-foreground mb-3 opacity-50" />
                                        <p className="font-semibold">No weight data yet.</p>
                                        <p className="text-xs text-muted-foreground mt-1">Log your weight in Profile to track progress.</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Weekly Trends Component */}
                        <Card className="shadow-sm border">
                            <CardHeader className="bg-muted/30 border-b">
                                <div className="flex items-center gap-2">
                                    <div className="bg-background p-1.5 rounded-md shadow-sm border text-muted-foreground">
                                        <TrendingUp className="h-4 w-4" />
                                    </div>
                                    <CardTitle>Weekly Average Trends</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="p-6">
                                {monthlyData?.weeklyData?.length > 0 ? (
                                    <div className="space-y-5">
                                        {monthlyData.weeklyData.map((week, index) => (
                                            <div key={index}>
                                                <div className="flex justify-between font-semibold text-sm mb-1.5">
                                                    <span className="text-muted-foreground">Week {week._id}</span>
                                                    <span>{Math.round(week.avgCalories)} <span className="text-xs text-muted-foreground opacity-80">kcal/day</span></span>
                                                </div>
                                                <div className="w-full h-3 bg-secondary rounded-full overflow-hidden border">
                                                    <div 
                                                        className="h-full bg-primary rounded-full transition-all duration-1000 ease-out"
                                                        style={{ width: `${Math.min(100, (week.avgCalories / 2500) * 100)}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12 border-2 border-dashed rounded-xl my-4 opacity-70">
                                        <TrendingUp className="h-10 w-10 mx-auto text-muted-foreground mb-3 opacity-50" />
                                        <p className="font-semibold">Not enough data.</p>
                                        <p className="text-xs text-muted-foreground mt-1">Keep logging your meals regularly.</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Analytics;
