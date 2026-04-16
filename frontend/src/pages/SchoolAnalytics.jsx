import { useState, useEffect } from 'react';
import { dashboardAPI } from '../services/api';
import { toast } from "sonner";
import { Users, Activity, AlertTriangle, TrendingDown, BookOpen } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

const SchoolAnalytics = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSchoolStats();
    }, []);

    const fetchSchoolStats = async () => {
        try {
            const response = await dashboardAPI.getSchoolStats();
            setStats(response.data);
        } catch (error) {
            console.error('Failed to load school analytics:', error);
            toast.error('Could not load school metrics');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen pt-28 flex justify-center items-start">
                <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!stats) return <div className="min-h-screen pt-28 text-center">Dashboard unavailable</div>;

    const total = stats.totalStudents || 1;
    const healthyPct = Math.round((stats.riskStats.HealthyWeight / total) * 100) || 0;
    const underweightPct = Math.round((stats.riskStats.Underweight / total) * 100) || 0;
    const overweightPct = Math.round((stats.riskStats.Overweight / total) * 100) || 0;
    const obesityPct = Math.round((stats.riskStats.Obesity / total) * 100) || 0;

    return (
        <div className="min-h-screen pt-28 pb-20 bg-background text-foreground">
            <div className="container mx-auto px-6 max-w-6xl space-y-8">
                
                {/* Header */}
                <div className="flex flex-col gap-1 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <h1 className="text-3xl font-bold tracking-tight mb-1 flex items-center gap-3">
                        <BookOpen className="h-8 w-8 text-primary" />
                        School Monitoring
                    </h1>
                    <p className="text-muted-foreground">Aggregate view of student BMI status and meal intake trends.</p>
                </div>

                {/* Top Metrics Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 animate-in fade-in slide-in-from-bottom-6 duration-700">
                    <Card className="shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Monitored</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold tracking-tight">{stats.totalStudents}</div>
                            <p className="text-xs text-muted-foreground mt-1">Students tracked</p>
                        </CardContent>
                    </Card>

                    <Card className="shadow-sm border-emerald-500/20 bg-emerald-500/5">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-emerald-600 dark:text-emerald-400">Healthy Weight</CardTitle>
                            <Activity className="h-4 w-4 text-emerald-600 shrink-0" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">{stats.riskStats.HealthyWeight}</div>
                            <p className="text-xs text-emerald-600/80 mt-1 dark:text-emerald-400/80">{healthyPct}% of total</p>
                        </CardContent>
                    </Card>

                    <Card className="shadow-sm border-amber-500/20 bg-amber-500/5">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-amber-600 dark:text-amber-400">Underweight</CardTitle>
                            <TrendingDown className="h-4 w-4 text-amber-600 shrink-0" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold tracking-tight text-amber-600 dark:text-amber-400">{stats.riskStats.Underweight}</div>
                            <p className="text-xs text-amber-600/80 mt-1 dark:text-amber-400/80">{underweightPct}% of total</p>
                        </CardContent>
                    </Card>
                    
                    <Card className="shadow-sm border-orange-500/20 bg-orange-500/5">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-orange-600 dark:text-orange-400">Overweight</CardTitle>
                            <AlertTriangle className="h-4 w-4 text-orange-600 shrink-0" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold tracking-tight text-orange-600 dark:text-orange-400">{stats.riskStats.Overweight}</div>
                            <p className="text-xs text-orange-600/80 mt-1 dark:text-orange-400/80">{overweightPct}% of total</p>
                        </CardContent>
                    </Card>

                    <Card className="shadow-sm border-rose-500/20 bg-rose-500/5">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-rose-600 dark:text-rose-400">Obesity</CardTitle>
                            <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold tracking-tight text-rose-600 dark:text-rose-400">{stats.riskStats.Obesity}</div>
                            <p className="text-xs text-rose-600/80 mt-1 dark:text-rose-400/80">{obesityPct}% of total</p>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                    {/* Nutritional Alerts Column */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card className="shadow-sm border flex flex-col h-full">
                            <CardHeader className="pb-3 border-b bg-muted/20">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <AlertTriangle className="h-5 w-5 text-amber-500" />
                                    Active Deficiency Alerts
                                </CardTitle>
                                <CardDescription>System-generated warnings based on mid-day meal logs</CardDescription>
                            </CardHeader>
                            <CardContent className="p-6 flex-1 flex flex-col gap-3">
                                {stats.alerts.length === 0 ? (
                                    <div className="flex-1 flex flex-col items-center justify-center text-center opacity-60 bg-muted/20 rounded-xl border border-dashed py-12">
                                        <Activity className="h-10 w-10 mb-3 text-emerald-500" />
                                        <p className="font-medium">No severe deficiencies detected.</p>
                                    </div>
                                ) : (
                                    stats.alerts.map((alert, idx) => (
                                        <div 
                                            key={idx} 
                                            className={`p-4 rounded-xl border flex gap-3
                                                ${alert.type === 'warning' ? 'bg-amber-500/10 border-amber-500/20' : 
                                                  alert.type === 'danger' ? 'bg-rose-500/10 border-rose-500/20' : 
                                                  'bg-blue-500/10 border-blue-500/20'}`}
                                        >
                                            {alert.type === 'warning' ? <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5" /> : 
                                             <Activity className="h-5 w-5 text-blue-500 mt-0.5" />}
                                            <div>
                                                <h4 className={`font-bold text-sm ${alert.type === 'warning' ? 'text-amber-600 dark:text-amber-400' : 'text-blue-600'}`}>
                                                    {alert.title}
                                                </h4>
                                                <p className="text-sm mt-1 text-foreground/80 font-medium">
                                                    {alert.message}
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </CardContent>
                        </Card>
                    </div>
                    
                    {/* Meal Quality Overview Column */}
                    <div className="space-y-6">
                        <Card className="shadow-sm border">
                            <CardHeader className="pb-4">
                                <CardTitle className="text-lg">Average School Meal Intake</CardTitle>
                                <CardDescription>Past 7 days aggregated</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-2">
                                    <div className="flex justify-between items-end text-sm">
                                        <span className="font-semibold">Calories</span>
                                        <span className="font-bold">{stats.averages.calories || 0} kcal</span>
                                    </div>
                                    <Progress value={Math.min(100, ((stats.averages.calories || 0) / 400) * 100)} className="h-2" />
                                </div>
                                
                                <div className="space-y-2">
                                    <div className="flex justify-between items-end text-sm">
                                        <span className="font-semibold text-rose-500">Protein</span>
                                        <span className="font-bold text-rose-500">{stats.averages.protein || 0}g</span>
                                    </div>
                                    <Progress value={Math.min(100, ((stats.averages.protein || 0) / 15) * 100)} className="h-2 bg-muted/40 [&>div]:bg-rose-500" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                    
                </div>
            </div>
        </div>
    );
};

export default SchoolAnalytics;
