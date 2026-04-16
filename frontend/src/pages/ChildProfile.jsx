import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Plus, Activity, AlertTriangle, CheckCircle, Scale, Ruler, Calendar, TrendingUp, Coffee, Salad, Beef, Apple, Utensils } from 'lucide-react';
import { childAPI } from '../services/api';
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const ChildProfile = () => {
    const { id } = useParams();
    const [child, setChild] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isMeasurementModalOpen, setIsMeasurementModalOpen] = useState(false);
    
    const [formData, setFormData] = useState({
        height: '',
        weight: ''
    });

    useEffect(() => {
        fetchChildDetails();
    }, [id]);

    const fetchChildDetails = async () => {
        try {
            const response = await childAPI.getById(id);
            setChild(response.data.child);
        } catch (error) {
            toast.error('Failed to load child profile');
        } finally {
            setLoading(false);
        }
    };

    const handleAddMeasurement = async (e) => {
        e.preventDefault();
        try {
            await childAPI.addMeasurement(id, {
                height: Number(formData.height),
                weight: Number(formData.weight)
            });
            toast.success('Measurement added successfully');
            setIsMeasurementModalOpen(false);
            setFormData({ height: '', weight: '' });
            fetchChildDetails();
        } catch (error) {
            toast.error(error.message || 'Failed to add measurement');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen pt-28 flex justify-center items-start">
                <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!child) return <div className="min-h-screen pt-28 text-center">Child not found</div>;

    // Sort measurements ascending for the charts (oldest to newest)
    const chartData = [...(child.measurements || [])].reverse().map(m => ({
        date: new Date(m.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        height: m.height,
        weight: m.weight,
        bmi: m.bmi
    }));

    const latest = child.measurements?.[0] || {};

    // Derive BMI classification from actual BMI value to handle stale DB records
    const getBmiClassification = (bmi) => {
        if (bmi == null) return 'Healthy Weight';
        if (bmi < 18.5) return 'Underweight';
        if (bmi <= 24.9) return 'Healthy Weight';
        if (bmi <= 29.9) return 'Overweight';
        return 'Obesity';
    };
    const riskLevel = latest.bmi ? getBmiClassification(latest.bmi) : (child.riskLevel || 'Healthy Weight');

    const getRiskColors = (risk) => {
        switch (risk) {
            case 'Healthy Weight': return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
            case 'Underweight': return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
            case 'Overweight': return 'bg-orange-500/10 text-orange-600 border-orange-500/20';
            case 'Obesity': return 'bg-rose-500/10 text-rose-600 border-rose-500/20';
            default: return 'bg-secondary text-secondary-foreground border-border';
        }
    };

    const getMealTypeLabel = (type) => {
        const labels = { breakfast: 'Breakfast', lunch: 'Mid-Day Meal (Lunch)', dinner: 'Dinner', snack: 'Snack' };
        return labels[type] || type;
    };

    const getMealIcon = (type) => {
        switch (type) {
            case 'breakfast': return <Coffee className="h-4 w-4" />;
            case 'lunch': return <Salad className="h-4 w-4 text-emerald-500" />;
            case 'dinner': return <Beef className="h-4 w-4" />;
            case 'snack': return <Apple className="h-4 w-4" />;
            default: return <Utensils className="h-4 w-4" />;
        }
    };

    return (
        <div className="min-h-screen pt-28 pb-20 bg-background text-foreground">
            <div className="container mx-auto px-6 max-w-6xl space-y-8">
                
                {/* Navigation and Header */}
                <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <Button variant="ghost" size="sm" asChild className="w-fit mb-2 text-muted-foreground hover:text-foreground">
                        <Link to="/children">
                            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Students
                        </Link>
                    </Button>
                    
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                        <div className="flex items-center gap-4">
                            <div className="h-16 w-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary font-bold text-3xl uppercase">
                                {child.name.charAt(0)}
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight">{child.name}</h1>
                                <p className="text-muted-foreground flex items-center gap-2 mt-1">
                                    <span>Age: {child.age}</span> • 
                                    <span className="capitalize">{child.gender}</span> • 
                                    <span>Class: {child.schoolClass || 'N/A'}</span>
                                </p>
                            </div>
                        </div>

                        <Dialog open={isMeasurementModalOpen} onOpenChange={setIsMeasurementModalOpen}>
                            <DialogTrigger asChild>
                                <Button className="gap-2">
                                    <Plus className="h-4 w-4" /> Add Measurement
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px]">
                                <DialogHeader>
                                    <DialogTitle>Add New Measurement</DialogTitle>
                                    <DialogDescription>
                                        Record the latest height and weight to track growth.
                                    </DialogDescription>
                                </DialogHeader>
                                <form onSubmit={handleAddMeasurement} className="space-y-4 pt-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Height (cm)</label>
                                            <Input required type="number" step="0.1" value={formData.height} onChange={(e) => setFormData({...formData, height: e.target.value})} placeholder="e.g. 122.5" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Weight (kg)</label>
                                            <Input required type="number" step="0.1" value={formData.weight} onChange={(e) => setFormData({...formData, weight: e.target.value})} placeholder="e.g. 23.0" />
                                        </div>
                                    </div>
                                    <DialogFooter className="pt-4">
                                        <Button type="button" variant="outline" onClick={() => setIsMeasurementModalOpen(false)}>Cancel</Button>
                                        <Button type="submit">Save Measurement</Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                {/* Health Metrics Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in slide-in-from-bottom-6 duration-700">
                    <Card className={`border-2 transition-all ${getRiskColors(riskLevel)}`}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-bold uppercase tracking-wider">Health Status</CardTitle>
                            {riskLevel === 'Healthy Weight' ? <CheckCircle className="h-5 w-5" /> : riskLevel === 'Underweight' ? <AlertTriangle className="h-5 w-5" /> : <Activity className="h-5 w-5" />}
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-black tracking-tight mt-1">{riskLevel}</div>
                            <p className="text-xs mt-2 font-medium opacity-80">
                                Based on BMI of {latest.bmi || '--'}
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Latest Height</CardTitle>
                            <Ruler className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold tracking-tight">{latest.height || '--'} cm</div>
                            <p className="text-xs text-muted-foreground mt-1">Recorded {latest.date ? new Date(latest.date).toLocaleDateString() : 'N/A'}</p>
                        </CardContent>
                    </Card>

                    <Card className="shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Latest Weight</CardTitle>
                            <Scale className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold tracking-tight">{latest.weight || '--'} kg</div>
                            <p className="text-xs text-muted-foreground mt-1">Recorded {latest.date ? new Date(latest.date).toLocaleDateString() : 'N/A'}</p>
                        </CardContent>
                    </Card>
                    
                    <Card className="shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Measurements</CardTitle>
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold tracking-tight">{child.measurements?.length || 0}</div>
                            <p className="text-xs text-muted-foreground mt-1">Total health check-ins</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Growth Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                    {/* Weight Tracking */}
                    <Card className="shadow-sm border">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <TrendingUp className="h-5 w-5 text-primary" />
                                Weight Progression (kg)
                            </CardTitle>
                            <CardDescription>Monitor weight changes over time</CardDescription>
                        </CardHeader>
                        <CardContent className="h-[300px]">
                            {chartData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                                        <XAxis dataKey="date" stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                                        <YAxis stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} domain={['auto', 'auto']} />
                                        <Tooltip 
                                            contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: '8px', color: 'var(--foreground)' }}
                                            itemStyle={{ color: 'var(--foreground)' }}
                                        />
                                        <Line type="monotone" dataKey="weight" stroke="var(--primary)" strokeWidth={3} dot={{ r: 4, fill: 'var(--primary)' }} activeDot={{ r: 6 }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full flex items-center justify-center text-muted-foreground text-sm border-2 border-dashed rounded-lg">
                                    Not enough data points yet.
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Height Tracking */}
                    <Card className="shadow-sm border">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Activity className="h-5 w-5 text-blue-500" />
                                Height Progression (cm)
                            </CardTitle>
                            <CardDescription>Track linear growth against age</CardDescription>
                        </CardHeader>
                        <CardContent className="h-[300px]">
                            {chartData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                                        <XAxis dataKey="date" stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                                        <YAxis stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} domain={['auto', 'auto']} />
                                        <Tooltip 
                                            contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: '8px', color: 'var(--foreground)' }}
                                            itemStyle={{ color: 'var(--foreground)' }}
                                        />
                                        <Line type="monotone" dataKey="height" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: '#3b82f6' }} activeDot={{ r: 6 }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full flex items-center justify-center text-muted-foreground text-sm border-2 border-dashed rounded-lg">
                                    Not enough data points yet.
                                </div>
                            )}
                        </CardContent>
                    </Card>
                    
                    {/* BMI Tracking */}
                    <Card className="shadow-sm border lg:col-span-2">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Activity className="h-5 w-5 text-rose-500" />
                                BMI Ratio
                            </CardTitle>
                            <CardDescription>Consistent BMI tracking helps identify early malnutrition risks</CardDescription>
                        </CardHeader>
                        <CardContent className="h-[250px]">
                            {chartData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                                        <XAxis dataKey="date" stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                                        <YAxis stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} domain={['auto', 'auto']} />
                                        <Tooltip 
                                            contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: '8px', color: 'var(--foreground)' }}
                                            itemStyle={{ color: 'var(--foreground)' }}
                                        />
                                        <Line type="monotone" dataKey="bmi" stroke="#f43f5e" strokeWidth={3} dot={{ r: 4, fill: '#f43f5e' }} activeDot={{ r: 6 }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full flex items-center justify-center text-muted-foreground text-sm border-2 border-dashed rounded-lg">
                                    Not enough data points yet.
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Recent Meals Section */}
                <div className="animate-in fade-in slide-in-from-bottom-10 duration-1000">
                    <Card className="shadow-sm border">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Utensils className="h-5 w-5 text-orange-500" />
                                Recent Mid-Day Meals
                            </CardTitle>
                            <CardDescription>Latest meals recorded for {child.name}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {(!child.recentMeals || child.recentMeals.length === 0) ? (
                                <div className="p-8 text-center border-2 border-dashed rounded-xl bg-muted/20">
                                    <Utensils className="h-8 w-8 text-muted-foreground mx-auto mb-3 opacity-50" />
                                    <p className="font-semibold text-muted-foreground">No meals logged yet.</p>
                                    <p className="text-sm text-muted-foreground/80 mt-1">Meals assigned to this student will appear here.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {child.recentMeals.map((meal, index) => (
                                        <div key={meal._id || index} className="p-4 border rounded-xl hover:bg-muted/10 transition-colors flex flex-col sm:flex-row justify-between gap-4 sm:items-center">
                                            <div className="flex gap-4 items-start sm:items-center">
                                                <div className="h-10 w-10 shrink-0 bg-secondary rounded-full flex items-center justify-center">
                                                    {getMealIcon(meal.mealType)}
                                                </div>
                                                <div>
                                                    <div className="font-semibold">{getMealTypeLabel(meal.mealType)}</div>
                                                    <div className="text-xs text-muted-foreground mt-0.5">
                                                        {new Date(meal.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} at {new Date(meal.date).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                                                    </div>
                                                    <div className="mt-2 flex flex-wrap gap-1">
                                                        {meal.foods?.map((food, fIndex) => (
                                                            <span key={fIndex} className="text-xs bg-muted px-2 py-0.5 rounded-full border">
                                                                {food.name}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-3 bg-secondary/20 p-3 rounded-lg border sm:border-none sm:bg-transparent">
                                                <div className="flex gap-3 text-xs">
                                                    <div className="font-semibold bg-background border px-2 py-1 rounded shadow-sm">{Math.round(meal.totalNutrition?.calories || 0)} <span className="text-[10px] text-muted-foreground uppercase hidden sm:inline">kcal</span></div>
                                                    <div className="font-semibold bg-blue-500/10 text-blue-600 border border-blue-500/20 px-2 py-1 rounded">{Math.round(meal.totalNutrition?.protein || 0)}g <span className="text-[10px] uppercase hidden sm:inline">Pro</span></div>
                                                </div>
                                                
                                                {meal.mealQualityScore && (
                                                    <div className={`text-xs font-bold px-2 py-1 rounded-full border ${
                                                        meal.mealQualityScore >= 8 ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' :
                                                        meal.mealQualityScore >= 5 ? 'bg-amber-500/10 text-amber-600 border-amber-500/20' :
                                                        'bg-rose-500/10 text-rose-600 border-rose-500/20'
                                                    }`}>
                                                        Quality Score: {meal.mealQualityScore}/10
                                                    </div>
                                                )}
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
    );
};

export default ChildProfile;
