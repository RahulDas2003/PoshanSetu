import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Plus, Trash2, ChevronLeft, ChevronRight, Utensils, Coffee, Salad, Beef, Apple, Target } from 'lucide-react';
import { mealAPI } from '../services/api';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from '../context/AuthContext';

const Meals = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [meals, setMeals] = useState([]);
    const [totals, setTotals] = useState({ calories: 0, protein: 0, carbs: 0, fat: 0 });
    const [selectedDate, setSelectedDate] = useState(new Date());

    // Goals (Fallback if user.goals is not set)
    const goals = user?.goals || { calories: 2000, protein: 150, carbs: 250, fat: 70 };

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
        const icons = { 
            breakfast: <Coffee className="h-5 w-5" />, 
            lunch: <Salad className="h-5 w-5" />, 
            dinner: <Beef className="h-5 w-5" />, 
            snack: <Apple className="h-5 w-5" /> 
        };
        return icons[type] || <Utensils className="h-5 w-5" />;
    };

    const getMealTypeLabel = (type) => {
        const labels = { breakfast: 'Breakfast', lunch: 'Lunch', dinner: 'Dinner', snack: 'Snack' };
        return labels[type] || type;
    };

    const getProgressColor = (current, goal, baseColor) => {
        if (current > goal + (goal * 0.1)) return 'bg-destructive'; // Over
        return baseColor;
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
        <div className="min-h-screen pt-28 pb-20 bg-background text-foreground">
            <div className="container mx-auto px-6 max-w-5xl space-y-8">
                
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3 mb-1">
                            <div className="bg-primary/10 text-primary p-2 rounded-lg">
                                <Calendar className="h-6 w-6" />
                            </div>
                            Meal History
                        </h1>
                        <p className="text-muted-foreground ml-1">Review your daily intake in detail</p>
                    </div>
                    <Link to="/log-meal">
                        <Button className="rounded-full gap-2 shadow-sm font-semibold px-6 hover:scale-[1.02] transition-transform">
                            <Plus className="h-4 w-4" /> Log Meal
                        </Button>
                    </Link>
                </div>

                {/* Date Navigation */}
                <div className="flex items-center justify-between bg-card p-3 rounded-2xl border shadow-sm animate-in fade-in slide-in-from-bottom-6 duration-700 max-w-xl mx-auto">
                    <Button 
                        variant="ghost" 
                        size="icon"
                        className="rounded-full h-10 w-10 hover:bg-secondary transition-colors"
                        onClick={() => changeDate(-1)}
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </Button>
                    <div className="text-center px-4">
                        <div className="text-xl font-bold tracking-tight">{formatDate(selectedDate)}</div>
                        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-0.5">
                            {selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                    </div>
                    <Button 
                        variant="ghost" 
                        size="icon"
                        className={`rounded-full h-10 w-10 transition-colors ${isToday() ? 'opacity-50' : 'hover:bg-secondary'}`}
                        onClick={() => changeDate(1)}
                        disabled={isToday()}
                    >
                        <ChevronRight className="h-5 w-5" />
                    </Button>
                </div>

                {/* Daily Summary Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-in fade-in slide-in-from-bottom-8 duration-700">
                    <Card className="shadow-sm hover:shadow-md transition-all hover:scale-[1.02]">
                        <CardContent className="p-5 text-center flex flex-col justify-center h-full relative overflow-hidden">
                            <div className="flex items-center justify-between mb-2 opacity-60">
                                <Target className="h-4 w-4" />
                                <span className="text-[10px] font-bold uppercase tracking-wider">Calories</span>
                            </div>
                            <div className="flex items-end justify-center gap-1 mb-3">
                                <div className="text-3xl font-bold tracking-tight">{Math.round(totals.calories)}</div>
                                <div className="text-sm font-medium text-muted-foreground mb-1">/ {goals.calories}</div>
                            </div>
                            <div className="w-full bg-secondary/60 rounded-full h-2 mb-1">
                                <div 
                                    className={`h-2 rounded-full transition-all duration-1000 ${getProgressColor(totals.calories, goals.calories, 'bg-primary')}`}
                                    style={{ width: `${Math.min(100, (totals.calories / goals.calories) * 100)}%` }}
                                />
                            </div>
                            <div className="text-xs font-semibold text-muted-foreground text-right">
                                {Math.round((totals.calories / goals.calories) * 100)}%
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="shadow-sm hover:shadow-md transition-all hover:scale-[1.02] border-b-4 border-b-rose-500/50">
                        <CardContent className="p-5 text-center flex flex-col justify-center h-full relative overflow-hidden">
                            <div className="flex items-center justify-between mb-2 opacity-60 text-rose-600 dark:text-rose-400">
                                <Target className="h-4 w-4" />
                                <span className="text-[10px] font-bold uppercase tracking-wider">Protein</span>
                            </div>
                            <div className="flex items-end justify-center gap-1 mb-3">
                                <div className="text-3xl font-bold tracking-tight text-rose-600 dark:text-rose-400">{Math.round(totals.protein)}</div>
                                <div className="text-sm font-medium text-rose-600/60 dark:text-rose-400/60 mb-1">/ {goals.protein}g</div>
                            </div>
                            <div className="w-full bg-rose-500/10 rounded-full h-2 mb-1">
                                <div 
                                    className={`h-2 rounded-full transition-all duration-1000 ${getProgressColor(totals.protein, goals.protein, 'bg-rose-500')}`}
                                    style={{ width: `${Math.min(100, (totals.protein / goals.protein) * 100)}%` }}
                                />
                            </div>
                            <div className="text-xs font-semibold text-rose-600/60 dark:text-rose-400/60 text-right">
                                {Math.round((totals.protein / goals.protein) * 100)}%
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="shadow-sm hover:shadow-md transition-all hover:scale-[1.02] border-b-4 border-b-blue-500/50">
                        <CardContent className="p-5 text-center flex flex-col justify-center h-full relative overflow-hidden">
                            <div className="flex items-center justify-between mb-2 opacity-60 text-blue-600 dark:text-blue-400">
                                <Target className="h-4 w-4" />
                                <span className="text-[10px] font-bold uppercase tracking-wider">Carbs</span>
                            </div>
                            <div className="flex items-end justify-center gap-1 mb-3">
                                <div className="text-3xl font-bold tracking-tight text-blue-600 dark:text-blue-400">{Math.round(totals.carbs)}</div>
                                <div className="text-sm font-medium text-blue-600/60 dark:text-blue-400/60 mb-1">/ {goals.carbs}g</div>
                            </div>
                            <div className="w-full bg-blue-500/10 rounded-full h-2 mb-1">
                                <div 
                                    className={`h-2 rounded-full transition-all duration-1000 ${getProgressColor(totals.carbs, goals.carbs, 'bg-blue-500')}`}
                                    style={{ width: `${Math.min(100, (totals.carbs / goals.carbs) * 100)}%` }}
                                />
                            </div>
                            <div className="text-xs font-semibold text-blue-600/60 dark:text-blue-400/60 text-right">
                                {Math.round((totals.carbs / goals.carbs) * 100)}%
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="shadow-sm hover:shadow-md transition-all hover:scale-[1.02] border-b-4 border-b-amber-500/50">
                        <CardContent className="p-5 text-center flex flex-col justify-center h-full relative overflow-hidden">
                            <div className="flex items-center justify-between mb-2 opacity-60 text-amber-600 dark:text-amber-400">
                                <Target className="h-4 w-4" />
                                <span className="text-[10px] font-bold uppercase tracking-wider">Fat</span>
                            </div>
                            <div className="flex items-end justify-center gap-1 mb-3">
                                <div className="text-3xl font-bold tracking-tight text-amber-600 dark:text-amber-400">{Math.round(totals.fat)}</div>
                                <div className="text-sm font-medium text-amber-600/60 dark:text-amber-400/60 mb-1">/ {goals.fat}g</div>
                            </div>
                            <div className="w-full bg-amber-500/10 rounded-full h-2 mb-1">
                                <div 
                                    className={`h-2 rounded-full transition-all duration-1000 ${getProgressColor(totals.fat, goals.fat, 'bg-amber-500')}`}
                                    style={{ width: `${Math.min(100, (totals.fat / goals.fat) * 100)}%` }}
                                />
                            </div>
                            <div className="text-xs font-semibold text-amber-600/60 dark:text-amber-400/60 text-right">
                                {Math.round((totals.fat / goals.fat) * 100)}%
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Meals List */}
                <div className="animate-in fade-in slide-in-from-bottom-12 duration-1000">
                    {loading ? (
                        <div className="flex justify-center py-20">
                            <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                        </div>
                    ) : meals.length === 0 ? (
                        <Card className="text-center py-16 border-dashed shadow-sm">
                            <CardContent className="flex flex-col items-center justify-center space-y-4">
                                <div className="bg-secondary p-4 rounded-full mb-2">
                                    <Utensils className="h-8 w-8 text-muted-foreground opacity-50" />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-xl font-bold tracking-tight">No meals logged</h3>
                                    <p className="text-sm text-muted-foreground max-w-sm mx-auto">Looks like you haven't tracked anything for this day yet.</p>
                                </div>
                                <Link to="/log-meal" className="mt-4 block hover:scale-[1.02] transition-transform">
                                    <Button className="rounded-full shadow-md">
                                        <Plus className="mr-2 h-4 w-4" /> Log Your First Meal
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="space-y-6">
                            {Object.entries(mealGroups).map(([type, typeMeals]) => (
                                typeMeals.length > 0 && (
                                    <div key={type} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                        <h3 className="text-lg font-bold capitalize mb-4 flex items-center gap-2">
                                            {getMealTypeIcon(type)}
                                            {getMealTypeLabel(type)}
                                        </h3>
                                        <div className="space-y-4">
                                            {typeMeals.map(meal => (
                                                <Card key={meal._id} className="shadow-sm overflow-hidden hover:shadow-md transition-shadow group">
                                                    <CardContent className="p-0">
                                                        <div className="p-5 flex flex-col md:flex-row gap-5 items-start md:items-center justify-between">
                                                            <div className="flex-1 w-full">
                                                                <div className="flex flex-col gap-3">
                                                                    {meal.foods?.map((food, idx) => (
                                                                        <div key={idx} className="flex justify-between items-center text-sm">
                                                                            <div className="flex items-center gap-3">
                                                                                <div className="w-2 h-2 rounded-full bg-primary/60 shadow-sm"></div>
                                                                                <span className="font-semibold text-foreground text-base tracking-tight">{food.name}</span>
                                                                                <span className="text-xs font-bold text-muted-foreground bg-secondary px-2 py-0.5 rounded-md">×{food.servings}</span>
                                                                            </div>
                                                                            <div className="flex items-center gap-4 text-xs font-medium text-muted-foreground">
                                                                                <span className="hidden sm:inline-block"><span className="text-foreground">{Math.round((food.nutrition?.protein || 0) * food.servings)}g</span> P</span>
                                                                                <span className="hidden sm:inline-block"><span className="text-foreground">{Math.round((food.nutrition?.carbs || 0) * food.servings)}g</span> C</span>
                                                                                <span className="hidden sm:inline-block"><span className="text-foreground">{Math.round((food.nutrition?.fat || 0) * food.servings)}g</span> F</span>
                                                                                <span className="text-foreground font-semibold bg-secondary px-2 py-1 rounded-md">{Math.round((food.nutrition?.calories || 0) * food.servings)} kcal</span>
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                            
                                                            <div className="flex items-center gap-4 md:pl-6 md:border-l w-full md:w-auto pt-4 md:pt-0 border-t md:border-t-0 border-border/50">
                                                                <div className="flex flex-col items-center justify-center flex-1 px-4">
                                                                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Meal Total</div>
                                                                    <div className="font-bold text-xl tracking-tight text-primary flex items-end gap-1">
                                                                        {meal.totalNutrition?.calories || 0} <span className="text-sm font-medium opacity-70 mb-[2px]">kcal</span>
                                                                    </div>
                                                                </div>
                                                                <Button 
                                                                    variant="outline" 
                                                                    size="icon"
                                                                    className="h-10 w-10 text-muted-foreground hover:text-destructive hover:bg-destructive/10 border-destructive/20 hover:border-destructive shadow-sm md:opacity-0 md:-translate-x-2 md:group-hover:translate-x-0 md:group-hover:opacity-100 transition-all rounded-full shrink-0"
                                                                    onClick={() => deleteMeal(meal._id)}
                                                                    title="Delete Meal"
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            ))}
                                        </div>
                                    </div>
                                )
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Meals;
