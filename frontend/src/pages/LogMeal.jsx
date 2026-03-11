import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Minus, X, Check, Camera, Coffee, Salad, Beef, Apple, Sparkles, Upload, UserRound } from 'lucide-react';
import { foodAPI, mealAPI, aiAPI, childAPI } from '../services/api';
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

const COMMON_SUGGESTIONS = [
    { name: 'Chicken Breast', nutrition: { calories: 165, protein: 31, carbs: 0, fat: 3.6 } },
    { name: 'Boiled Egg', nutrition: { calories: 78, protein: 6, carbs: 0.6, fat: 5.3 } },
    { name: 'Paneer', nutrition: { calories: 265, protein: 18, carbs: 1.2, fat: 20 } },
    { name: 'Apple', nutrition: { calories: 95, protein: 0.5, carbs: 25, fat: 0.3 } },
    { name: 'Brown Rice', nutrition: { calories: 216, protein: 5, carbs: 45, fat: 1.8 } },
    { name: 'Oats', nutrition: { calories: 389, protein: 16.9, carbs: 66.3, fat: 6.9 } }
];

const LogMeal = () => {
    const navigate = useNavigate();
    const [mealType, setMealType] = useState('breakfast');
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [selectedFoods, setSelectedFoods] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searching, setSearching] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    
    // Child Selection State
    const [children, setChildren] = useState([]);
    const [selectedChildId, setSelectedChildId] = useState('');

    // AI Photo State
    const [isScanning, setIsScanning] = useState(false);
    const fileInputRef = useRef(null);
    const searchRef = useRef(null);

    // Debounced search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchQuery.trim().length >= 2) {
                handleSearch();
            } else {
                setSearchResults(COMMON_SUGGESTIONS.filter(s => 
                    s.name.toLowerCase().includes(searchQuery.toLowerCase())
                ));
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Fetch children for assignment
    useEffect(() => {
        const fetchChildren = async () => {
            try {
                const res = await childAPI.getAll();
                setChildren(res.data.children || []);
            } catch (error) {
                console.error("Failed to fetch children for meal logging", error);
            }
        };
        fetchChildren();
    }, []);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSearch = async () => {
        setSearching(true);
        try {
            const response = await foodAPI.search(searchQuery);
            if (response.data.foods && response.data.foods.length > 0) {
                setSearchResults(response.data.foods);
            } else {
                // Fallback to fuzzy common suggestions if API returns empty
                setSearchResults(COMMON_SUGGESTIONS.filter(s => 
                    s.name.toLowerCase().includes(searchQuery.toLowerCase())
                ));
            }
        } catch (error) {
            console.error('Search error:', error);
            setSearchResults(COMMON_SUGGESTIONS.filter(s => 
                s.name.toLowerCase().includes(searchQuery.toLowerCase())
            ));
        } finally {
            setSearching(false);
        }
    };

    const addFood = (food) => {
        setSelectedFoods(prevFoods => {
            const exists = prevFoods.find(f => f.name === food.name);
            if (exists) {
                toast.error(`${food.name} already on plate`);
                return prevFoods;
            }
            
            toast.success(`${food.name} added to plate`);
            return [...prevFoods, {
                ...food,
                servings: 1,
                nutrition: food.nutrition
            }];
        });
        setSearchQuery('');
        setShowDropdown(false);
    };

    const removeFood = (index) => {
        setSelectedFoods(selectedFoods.filter((_, i) => i !== index));
    };

    const updateServings = (index, delta) => {
        setSelectedFoods(selectedFoods.map((food, i) => {
            if (i === index) {
                const newServings = Math.max(0.25, Math.min(10, food.servings + delta));
                return { ...food, servings: newServings };
            }
            return food;
        }));
    };

    const handlePhotoScan = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsScanning(true);
        
        try {
            const formData = new FormData();
            formData.append('image', file);
            
            const response = await aiAPI.analyzeImage(formData);
            
            setIsScanning(false);
            
            if (response.data?.analysis?.foods && response.data.analysis.foods.length > 0) {
                toast.success("Food detected successfully!", {
                    icon: <Sparkles className="h-4 w-4 text-primary" />
                });
                
                response.data.analysis.foods.forEach(food => {
                    const detectedFood = {
                        name: food.name,
                        nutrition: {
                            calories: food.calories || 0,
                            protein: food.protein || 0,
                            carbs: food.carbs || 0,
                            fat: food.fat || 0
                        },
                        servingSize: 1,
                        servingUnit: food.portion || 'serving',
                        servings: 1
                    };
                    addFood(detectedFood);
                });
            } else {
                toast.error(response.data?.analysis?.suggestions || "Could not detect specific foods. Please try another image.");
            }
        } catch (error) {
            console.error('Photo scan error:', error);
            setIsScanning(false);
            toast.error(error.message || 'Failed to analyze image. Please try again.');
        } finally {
            // Reset input
            e.target.value = null;
        }
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
                date: new Date().toISOString(),
                childId: selectedChildId || undefined
            });
            toast.success('Meal logged successfully!');
            navigate('/dashboard');
        } catch (error) {
            toast.error(error.message || 'Failed to log meal');
        } finally {
            setLoading(false);
        }
    };

    const totals = getTotalNutrition();
    const mealTypes = [
        { id: 'breakfast', label: 'Breakfast', icon: Coffee },
        { id: 'lunch', label: 'Lunch', icon: Salad },
        { id: 'dinner', label: 'Dinner', icon: Beef },
        { id: 'snack', label: 'Snack', icon: Apple }
    ];

    return (
        <div className="min-h-screen pt-28 pb-20 bg-background text-foreground">
            <div className="container mx-auto px-6 max-w-5xl space-y-8">
                
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3 mb-1">
                            <div className="bg-primary/10 text-primary p-2 rounded-lg">
                                <Plus className="h-6 w-6" />
                            </div>
                            Log a Meal
                        </h1>
                        <p className="text-muted-foreground ml-1">Search or scan foods you've eaten</p>
                    </div>
                    
                    <div>
                        <input 
                            type="file" 
                            accept="image/*" 
                            className="hidden" 
                            ref={fileInputRef} 
                            onChange={handlePhotoScan} 
                        />
                        <Button 
                            variant="secondary" 
                            className="gap-2 shadow-sm rounded-full bg-secondary/80 hover:bg-secondary font-medium transition-all hover:scale-[1.02]"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isScanning}
                        >
                            {isScanning ? (
                                <div className="h-4 w-4 border-2 border-foreground/30 border-t-foreground rounded-full animate-spin"></div>
                            ) : (
                                <Camera className="h-4 w-4" />
                            )}
                            {isScanning ? 'Analyzing Image...' : 'AI Photo Scan'}
                        </Button>
                    </div>
                </div>

                {/* AI Scanning Overlay Effect (Subtle) */}
                {isScanning && (
                    <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 flex items-center gap-4 animate-pulse">
                        <div className="bg-primary/20 p-2 rounded-full">
                            <Sparkles className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <p className="font-semibold text-primary">AI is analyzing your food photo...</p>
                            <p className="text-sm text-muted-foreground">Extracting ingredients and nutritional values.</p>
                        </div>
                    </div>
                )}

                {/* Meal Type Selection */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 animate-in fade-in slide-in-from-bottom-6 duration-700">
                    {mealTypes.map(({ id, label, icon: Icon }) => (
                        <Card 
                            key={id}
                            className={`cursor-pointer transition-all hover:border-primary/50 hover:shadow-md hover:scale-[1.02] ${mealType === id ? 'border-primary ring-1 ring-primary bg-primary/5' : ''}`}
                            onClick={() => setMealType(id)}
                        >
                            <CardContent className="p-6 flex flex-col items-center justify-center gap-3">
                                <Icon className={`h-8 w-8 transition-colors ${mealType === id ? 'text-primary' : 'text-muted-foreground'}`} />
                                <span className={`font-semibold ${mealType === id ? 'text-foreground' : 'text-muted-foreground'}`}>{label}</span>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Child Assignment (Optional) */}
                {children.length > 0 && (
                    <div className="animate-in fade-in slide-in-from-bottom-7 duration-1000 mb-6 flex items-center gap-3">
                        <label className="text-sm font-semibold flex items-center gap-2">
                            <UserRound className="h-4 w-4 text-muted-foreground" />
                            Assign to Student (Optional):
                        </label>
                        <select 
                            value={selectedChildId}
                            onChange={(e) => setSelectedChildId(e.target.value)}
                            className="h-10 px-3 rounded-md border border-input bg-background/50 text-sm focus:ring-1 focus:ring-primary w-64"
                        >
                            <option value="">-- Personal Meal --</option>
                            {children.map(child => (
                                <option key={child._id} value={child._id}>{child.name}</option>
                            ))}
                        </select>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                    
                    {/* Left Column: Search */}
                    <div className="space-y-6">
                        <Card className="h-full flex flex-col shadow-sm relative overflow-visible border-border/50">
                            <CardHeader className="pb-4">
                                <CardTitle>Find Food</CardTitle>
                                <CardDescription>Search database or use common suggestions.</CardDescription>
                            </CardHeader>
                            <CardContent className="flex-1 flex flex-col" ref={searchRef}>
                                <div className="relative mb-2">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                    <Input
                                        type="text"
                                        placeholder="e.g. 'Chicken breast', 'Apple'"
                                        value={searchQuery}
                                        onFocus={() => setShowDropdown(true)}
                                        onChange={(e) => {
                                            setSearchQuery(e.target.value);
                                            setShowDropdown(true);
                                        }}
                                        className="pl-10 pr-10 py-6 text-base rounded-xl shadow-sm focus-visible:ring-primary/30"
                                    />
                                    {searching && (
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                                    )}
                                </div>

                                {/* Fuzzy Search Dropdown */}
                                {showDropdown && (
                                    <div className="absolute top-[138px] left-6 right-6 z-50 bg-popover text-popover-foreground border rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                                        <ScrollArea className="max-h-[300px]">
                                            {searchResults.length > 0 ? (
                                                <div className="p-2 space-y-1">
                                                    <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                                        {searchQuery.length < 2 ? 'Suggestions' : 'Search Results'}
                                                    </div>
                                                    {searchResults.map((food, index) => (
                                                        <div 
                                                            key={index} 
                                                            className="flex items-center justify-between p-3 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer group"
                                                            onClick={() => addFood(food)}
                                                        >
                                                            <div className="flex-1 min-w-0 pr-4">
                                                                <div className="font-semibold text-sm truncate">{food.name}</div>
                                                                <div className="text-xs text-muted-foreground mt-0.5 truncate">
                                                                    {food.nutrition.protein}g P • {food.nutrition.carbs}g C • {food.nutrition.fat}g F
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-3 shrink-0">
                                                                <div className="font-medium bg-primary/10 text-primary px-2 py-0.5 rounded text-xs">
                                                                    {food.nutrition?.calories || 0} kcal
                                                                </div>
                                                                <Plus className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="p-4 text-center text-sm text-muted-foreground">
                                                    No foods found matching "{searchQuery}"
                                                </div>
                                            )}
                                        </ScrollArea>
                                    </div>
                                )}
                                
                                {/* Placeholder Content when dropdown is closed */}
                                {!showDropdown && selectedFoods.length === 0 && (
                                    <div className="flex-1 flex flex-col items-center justify-center py-12 text-center opacity-60">
                                        <div className="bg-secondary p-4 rounded-full mb-4">
                                            <Search className="h-8 w-8 text-muted-foreground" />
                                        </div>
                                        <p className="font-medium mb-1">Search for a food above</p>
                                        <p className="text-sm text-muted-foreground">Or tap 'AI Photo Scan' to detect a meal</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column: Selected Foods & Summary */}
                    <div className="space-y-6">
                        <Card className="h-full flex flex-col shadow-sm border-border/50">
                            <CardHeader className="flex flex-row items-center justify-between pb-4">
                                <div>
                                    <CardTitle>Your Plate</CardTitle>
                                    <CardDescription>Adjust servings before logging.</CardDescription>
                                </div>
                                <div className="bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-sm font-semibold shadow-sm">
                                    {selectedFoods.length} items
                                </div>
                            </CardHeader>
                            <CardContent className="flex-1 flex flex-col pt-0">
                                {selectedFoods.length === 0 ? (
                                    <div className="flex-1 flex flex-col items-center justify-center py-12 text-center opacity-70 border-2 border-dashed rounded-xl my-4 bg-muted/20">
                                        <div className="bg-background border p-4 rounded-full mb-4 shadow-sm">
                                            <Coffee className="h-8 w-8 text-muted-foreground" />
                                        </div>
                                        <p className="font-semibold">Plate is empty</p>
                                        <p className="text-sm text-muted-foreground mt-1">Foods you add will appear here</p>
                                    </div>
                                ) : (
                                    <ScrollArea className="flex-1 h-[300px] pr-4 mb-4">
                                        <div className="space-y-3">
                                            {selectedFoods.map((food, index) => (
                                                <div key={index} className="bg-card border rounded-lg p-4 shadow-sm flex flex-col gap-3 group animate-in slide-in-from-right-2 duration-300">
                                                    <div className="flex justify-between items-start gap-2">
                                                        <span className="font-semibold text-sm leading-tight line-clamp-2 pr-6 relative">
                                                            {food.name}
                                                            {food.name.includes('Curry') && (
                                                                <Sparkles className="h-3 w-3 text-primary absolute -right-1 top-0 opacity-70" />
                                                            )}
                                                        </span>
                                                        <Button 
                                                            variant="ghost" 
                                                            size="icon" 
                                                            className="h-6 w-6 text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                                            onClick={() => removeFood(index)}
                                                        >
                                                            <X className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                    <div className="flex items-center justify-between mt-auto">
                                                        <div className="flex items-center gap-1 bg-secondary/50 rounded-md p-1 border">
                                                            <Button variant="ghost" size="icon" className="h-6 w-6 rounded-sm hover:bg-background shadow-sm" onClick={() => updateServings(index, -0.25)}>
                                                                <Minus className="h-3 w-3" />
                                                            </Button>
                                                            <span className="w-10 text-center font-bold text-sm">{food.servings} x</span>
                                                            <Button variant="ghost" size="icon" className="h-6 w-6 rounded-sm hover:bg-background shadow-sm" onClick={() => updateServings(index, 0.25)}>
                                                                <Plus className="h-3 w-3" />
                                                            </Button>
                                                        </div>
                                                        <div className="flex gap-3 text-xs text-muted-foreground">
                                                            <span><span className="font-semibold text-foreground">{Math.round(food.nutrition.protein * food.servings)}g</span> P</span>
                                                            <span><span className="font-semibold text-foreground">{Math.round(food.nutrition.carbs * food.servings)}g</span> C</span>
                                                            <span><span className="font-semibold text-foreground">{Math.round(food.nutrition.fat * food.servings)}g</span> F</span>
                                                            <div className="font-bold text-primary ml-2 bg-primary/10 px-2 py-0.5 rounded">
                                                                {Math.round(food.nutrition.calories * food.servings)} kcal
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </ScrollArea>
                                )}
                            </CardContent>
                            
                            {/* Summary Bottom Area */}
                            <div className="p-6 pt-0 mt-auto border-t bg-card rounded-b-xl">
                                <div className="grid grid-cols-4 gap-2 pt-6 mb-6">
                                    <div className="bg-secondary/70 p-2.5 rounded-lg text-center border shadow-sm">
                                        <div className="text-[10px] font-bold text-muted-foreground mb-1 uppercase tracking-wider">Cals</div>
                                        <div className="font-bold text-sm tracking-tight">{Math.round(totals.calories)}</div>
                                    </div>
                                    <div className="bg-rose-500/10 p-2.5 rounded-lg text-center border border-rose-500/20 shadow-sm">
                                        <div className="text-[10px] font-bold text-rose-600 dark:text-rose-400 mb-1 uppercase tracking-wider">Pro</div>
                                        <div className="font-bold text-sm text-rose-600 dark:text-rose-400 tracking-tight">{Math.round(totals.protein)}g</div>
                                    </div>
                                    <div className="bg-blue-500/10 p-2.5 rounded-lg text-center border border-blue-500/20 shadow-sm">
                                        <div className="text-[10px] font-bold text-blue-600 dark:text-blue-400 mb-1 uppercase tracking-wider">Carb</div>
                                        <div className="font-bold text-sm text-blue-600 dark:text-blue-400 tracking-tight">{Math.round(totals.carbs)}g</div>
                                    </div>
                                    <div className="bg-amber-500/10 p-2.5 rounded-lg text-center border border-amber-500/20 shadow-sm">
                                        <div className="text-[10px] font-bold text-amber-600 dark:text-amber-400 mb-1 uppercase tracking-wider">Fat</div>
                                        <div className="font-bold text-sm text-amber-600 dark:text-amber-400 tracking-tight">{Math.round(totals.fat)}g</div>
                                    </div>
                                </div>

                                <Button 
                                    className="w-full py-6 text-base font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5"
                                    onClick={handleSubmit}
                                    disabled={loading || selectedFoods.length === 0}
                                >
                                    {loading ? (
                                        <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin"></div>
                                    ) : (
                                        <>
                                            <Check className="mr-2 h-5 w-5" /> Log {mealTypes.find(t => t.id === mealType)?.label}
                                        </>
                                    )}
                                </Button>
                            </div>
                        </Card>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default LogMeal;
