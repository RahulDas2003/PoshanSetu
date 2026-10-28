import { useState } from 'react';
import { Clock, Flame, Sparkles, ChevronDown, ChevronUp, ExternalLink, PlusCircle, Check, Utensils, Heart, Play } from 'lucide-react';
import { FaYoutube } from 'react-icons/fa';
import { mealAPI } from '../services/api';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

// Curated high-res culinary photography for authentic Indian dishes
export const getDishImageUrl = (dishName = '', cuisine = '') => {
    const text = `${dishName} ${cuisine}`.toLowerCase();
    if (text.includes('handvo') || text.includes('dhokla') || text.includes('idada') || text.includes('khaman')) {
        return 'https://images.unsplash.com/photo-1626074353765-517a681e40be?auto=format&fit=crop&w=800&q=80';
    }
    if (text.includes('dosa') || text.includes('uttapam') || text.includes('pesarattu') || text.includes('paniyaram')) {
        return 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=800&q=80';
    }
    if (text.includes('khichdi') || text.includes('pongal') || text.includes('daliya') || text.includes('porridge')) {
        return 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80';
    }
    if (text.includes('paneer') || text.includes('bhurji') || text.includes('tofu')) {
        return 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=800&q=80';
    }
    if (text.includes('biryani') || text.includes('pulao') || text.includes('rice') || text.includes('bath')) {
        return 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80';
    }
    if (text.includes('paratha') || text.includes('thepla') || text.includes('roti') || text.includes('naan') || text.includes('litti')) {
        return 'https://images.unsplash.com/photo-1626074353765-517a681e40be?auto=format&fit=crop&w=800&q=80';
    }
    if (text.includes('poha') || text.includes('upma') || text.includes('idli') || text.includes('vada')) {
        return 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80';
    }
    if (text.includes('cheela') || text.includes('chilla') || text.includes('besan')) {
        return 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=800&q=80';
    }
    if (text.includes('salad') || text.includes('sprout') || text.includes('chaat') || text.includes('kachumber')) {
        return 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80';
    }
    if (text.includes('dal') || text.includes('sambar') || text.includes('curry') || text.includes('chole') || text.includes('rajma') || text.includes('kadhi')) {
        return 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=800&q=80';
    }
    return 'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?auto=format&fit=crop&w=800&q=80';
};

// Popular India-based cooking channels
export const TOP_INDIAN_CHANNELS = [
    { name: 'Ranveer Brar', handle: '@RanveerBrar', url: 'https://www.youtube.com/@RanveerBrar' },
    { name: 'Sanjeev Kapoor', handle: '@sanjeevkapoorkhazana', url: 'https://www.youtube.com/@sanjeevkapoorkhazana' },
    { name: 'Bharatzkitchen', handle: '@bharatzkitchenHINDI', url: 'https://www.youtube.com/@bharatzkitchenHINDI' },
    { name: 'Hebbars Kitchen', handle: '@hebbarskitchen', url: 'https://www.youtube.com/@hebbarskitchen' },
    { name: 'Cook With Parul', handle: '@CookWithParul', url: 'https://www.youtube.com/@CookWithParul' },
    { name: 'Kunal Kapur', handle: '@KunalKapur', url: 'https://www.youtube.com/@KunalKapur' },
];

export const parseRecommendations = (data, fallbackMealType = 'meal') => {
    if (!data) return null;

    if (typeof data === 'object') {
        if (data.meals && Array.isArray(data.meals)) {
            return {
                summary: data.summary || '',
                meals: data.meals.map(m => enrichMeal(m, fallbackMealType))
            };
        }
        if (Array.isArray(data)) {
            return {
                summary: '',
                meals: data.map(m => enrichMeal(m, fallbackMealType))
            };
        }
    }

    if (typeof data === 'string') {
        // Try parsing JSON string
        try {
            const parsed = JSON.parse(data);
            if (parsed.meals && Array.isArray(parsed.meals)) {
                return {
                    summary: parsed.summary || '',
                    meals: parsed.meals.map(m => enrichMeal(m, fallbackMealType))
                };
            }
            if (Array.isArray(parsed)) {
                return {
                    summary: '',
                    meals: parsed.map(m => enrichMeal(m, fallbackMealType))
                };
            }
        } catch (e) {
            // Not JSON, continue to markdown parser
        }

        // Markdown text parsing (e.g. 🍽️ **Dish Name**)
        const blocks = data.split(/(?=🍽️\s*\*\*)/g).filter(b => b.trim().length > 0);
        let summaryText = '';
        if (blocks.length > 0 && !blocks[0].startsWith('🍽️')) {
            summaryText = blocks.shift().trim();
        }

        const meals = [];
        for (const b of blocks) {
            const titleMatch = b.match(/🍽️\s*\*\*([^*]+)\*\*/);
            if (!titleMatch) continue;

            const rawTitle = titleMatch[1].trim();
            let name = rawTitle;
            let regionalName = '';
            if (rawTitle.includes('(') && rawTitle.includes(')')) {
                const pIdx = rawTitle.indexOf('(');
                name = rawTitle.substring(0, pIdx).trim();
                regionalName = rawTitle.substring(pIdx + 1, rawTitle.lastIndexOf(')')).trim();
            }

            const descMatch = b.match(/-\s*\*\*Description:\*\*\s*([^\n]+)/i);
            const macroMatch = b.match(/-\s*\*\*Approx\.?\s*Calories\s*&\s*Protein:\*\*\s*([^\n]+)/i);
            const whyMatch = b.match(/-\s*\*\*Why it's a good choice:\*\*\s*([^\n]+)/i);

            let calories = 300;
            let protein = 10;
            if (macroMatch) {
                const calM = macroMatch[1].match(/(\d+)\s*kcal/i);
                const protM = macroMatch[1].match(/(\d+)\s*g/i);
                if (calM) calories = parseInt(calM[1]);
                if (protM) protein = parseInt(protM[1]);
            }

            meals.push(enrichMeal({
                name,
                regionalName: regionalName || name,
                cuisine: name.toLowerCase().includes('gujarati') ? 'Gujarati' : (name.toLowerCase().includes('hyderabadi') ? 'Hyderabadi' : 'Indian'),
                calories,
                protein,
                description: descMatch ? descMatch[1].trim() : '',
                whyItsGood: whyMatch ? whyMatch[1].trim() : '',
                prepTime: '15-20 mins',
                cookTime: '20-25 mins',
                ingredients: [
                    'Traditional whole grains & lentils',
                    'Fresh regional herbs and vegetables',
                    'Tempering spices (mustard, cumin, asafoetida, curry leaves)',
                    'Cold-pressed oil or pure ghee (1 tsp)'
                ],
                instructions: [
                    'Prep all vegetables and lentils.',
                    'Heat oil or ghee, splutter tempering spices.',
                    'Cook on gentle heat until tender, fragrant, and golden.'
                ]
            }, fallbackMealType));
        }

        if (meals.length > 0) {
            return {
                summary: summaryText,
                meals
            };
        }
    }

    return null;
};

const enrichMeal = (meal, fallbackMealType) => {
    const name = meal.name || 'Indian Dish';
    const cuisine = meal.cuisine || 'Traditional Indian';
    const chef = meal.recommendedChefChannel || 'Chef Ranveer Brar / Hebbar\'s Kitchen';
    const query = meal.youtubeSearchQuery || `${name} authentic recipe ${chef}`;
    const calories = typeof meal.calories === 'number' ? meal.calories : (parseInt(meal.calories) || 300);
    const protein = typeof meal.protein === 'number' ? meal.protein : (parseInt(meal.protein) || 12);
    const carbs = typeof meal.carbs === 'number' ? meal.carbs : (parseInt(meal.carbs) || Math.max(15, Math.round((calories - (protein * 4) - 40) / 4)));
    const fat = typeof meal.fat === 'number' ? meal.fat : (parseInt(meal.fat) || Math.max(4, Math.round((calories * 0.25) / 9)));

    return {
        ...meal,
        name,
        regionalName: meal.regionalName || name,
        cuisine,
        mealType: meal.mealType || fallbackMealType,
        prepTime: meal.prepTime || '15 mins',
        cookTime: meal.cookTime || '20 mins',
        calories,
        protein,
        carbs,
        fat,
        fiber: meal.fiber || 5,
        imageUrl: meal.imageUrl || getDishImageUrl(name, cuisine),
        youtubeUrl: meal.youtubeUrl || `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`,
        youtubeSearchQuery: query,
        recommendedChefChannel: chef,
        description: meal.description || 'Delicious and authentic home-cooked recipe.',
        whyItsGood: meal.whyItsGood || 'Nutrient-rich, comforting, and perfectly aligned with your daily nutrition targets.',
        ingredients: Array.isArray(meal.ingredients) && meal.ingredients.length > 0 ? meal.ingredients : [
            'Fresh seasonal vegetables & lentils',
            'Cold-pressed oil or pure ghee (1 tsp)',
            'Traditional Indian spices (mustard, cumin, turmeric, asafoetida)',
            'Fresh green chillies, ginger, and curry leaves'
        ],
        instructions: Array.isArray(meal.instructions) && meal.instructions.length > 0 ? meal.instructions : [
            'Rinse and prepare your ingredients and spices.',
            'Heat 1 tsp oil in a heavy-bottomed pan, add the tempering spices.',
            'Cook on medium heat until golden, aromatic, and cooked through.'
        ]
    };
};

export const RecipeCard = ({ meal, onLogMeal }) => {
    const [expanded, setExpanded] = useState(false);
    const [logging, setLogging] = useState(false);
    const [logged, setLogged] = useState(false);

    const handleQuickLog = async () => {
        setLogging(true);
        try {
            if (onLogMeal) {
                await onLogMeal(meal);
            } else {
                await mealAPI.create({
                    mealType: meal.mealType || 'dinner',
                    date: new Date().toISOString(),
                    foods: [{
                        name: meal.name,
                        servings: 1,
                        servingUnit: 'portion',
                        nutrition: {
                            calories: meal.calories,
                            protein: meal.protein,
                            carbs: meal.carbs,
                            fat: meal.fat,
                            fiber: meal.fiber || 0
                        }
                    }]
                });
            }
            setLogged(true);
            toast.success(`Logged ${meal.name} to your daily tracker! 🎉`);
            setTimeout(() => setLogged(false), 4000);
        } catch (err) {
            toast.error('Failed to log meal. Please try again.');
        } finally {
            setLogging(false);
        }
    };

    return (
        <Card className="overflow-hidden border border-border/80 shadow-md hover:shadow-xl transition-all duration-300 rounded-3xl bg-card flex flex-col">
            {/* Dish Image Banner */}
            <div className="relative h-52 sm:h-56 w-full overflow-hidden bg-muted group">
                <img
                    src={meal.imageUrl}
                    alt={meal.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?auto=format&fit=crop&w=800&q=80';
                    }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent"></div>

                {/* Regional Badge */}
                <div className="absolute top-3 left-3 flex gap-2">
                    <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/90 text-white backdrop-blur-md shadow-sm">
                        {meal.cuisine || 'Traditional'}
                    </span>
                    {meal.mealType && (
                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold capitalize bg-black/50 text-white/90 backdrop-blur-md">
                            {meal.mealType}
                        </span>
                    )}
                </div>

                {/* Cooking Time */}
                <div className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-black/60 text-white backdrop-blur-md shadow-sm">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    <span>{meal.cookTime || meal.prepTime || '25 mins'}</span>
                </div>

                {/* Dish Title on Image Overlay */}
                <div className="absolute bottom-3 left-4 right-4 text-white">
                    <h3 className="text-xl sm:text-2xl font-bold leading-tight drop-shadow-md">
                        {meal.name}
                    </h3>
                    {meal.regionalName && meal.regionalName !== meal.name && (
                        <p className="text-xs sm:text-sm text-emerald-300 font-medium italic mt-0.5">
                            {meal.regionalName}
                        </p>
                    )}
                </div>
            </div>

            {/* Content Body */}
            <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
                {/* Macro Pills Bar */}
                <div className="grid grid-cols-4 gap-2">
                    <div className="bg-amber-500/10 border border-amber-500/20 dark:border-amber-500/30 rounded-2xl p-2 text-center">
                        <span className="text-[11px] font-bold uppercase text-amber-600 dark:text-amber-400 flex items-center justify-center gap-1">
                            <Flame className="w-3 h-3" /> Cal
                        </span>
                        <p className="text-sm sm:text-base font-extrabold text-foreground mt-0.5">
                            {meal.calories}
                        </p>
                    </div>

                    <div className="bg-emerald-500/10 border border-emerald-500/20 dark:border-emerald-500/30 rounded-2xl p-2 text-center">
                        <span className="text-[11px] font-bold uppercase text-emerald-600 dark:text-emerald-400">
                            Protein
                        </span>
                        <p className="text-sm sm:text-base font-extrabold text-foreground mt-0.5">
                            {meal.protein}g
                        </p>
                    </div>

                    <div className="bg-sky-500/10 border border-sky-500/20 dark:border-sky-500/30 rounded-2xl p-2 text-center">
                        <span className="text-[11px] font-bold uppercase text-sky-600 dark:text-sky-400">
                            Carbs
                        </span>
                        <p className="text-sm sm:text-base font-extrabold text-foreground mt-0.5">
                            {meal.carbs}g
                        </p>
                    </div>

                    <div className="bg-rose-500/10 border border-rose-500/20 dark:border-rose-500/30 rounded-2xl p-2 text-center">
                        <span className="text-[11px] font-bold uppercase text-rose-600 dark:text-rose-400">
                            Fat
                        </span>
                        <p className="text-sm sm:text-base font-extrabold text-foreground mt-0.5">
                            {meal.fat}g
                        </p>
                    </div>
                </div>

                {/* Description */}
                <p className="text-sm text-muted-foreground leading-relaxed">
                    {meal.description}
                </p>

                {/* Why it's a good choice */}
                {meal.whyItsGood && (
                    <div className="bg-emerald-500/5 dark:bg-emerald-950/20 border border-emerald-500/20 rounded-2xl p-3.5 flex gap-3 text-xs sm:text-sm text-foreground/90">
                        <Sparkles className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                        <div>
                            <span className="font-semibold text-emerald-600 dark:text-emerald-400 block mb-0.5">
                                Why it fits your goal:
                            </span>
                            <span className="leading-snug">{meal.whyItsGood}</span>
                        </div>
                    </div>
                )}

                {/* Expandable Recipe Outlook */}
                <div className="pt-1 border-t border-border/50">
                    <button
                        onClick={() => setExpanded(!expanded)}
                        className="w-full flex items-center justify-between text-xs sm:text-sm font-semibold text-primary hover:text-primary/80 py-2 transition-colors"
                    >
                        <span className="flex items-center gap-2">
                            <Utensils className="w-4 h-4 text-primary" />
                            {expanded ? 'Hide Recipe Outlook' : 'View Sleek Recipe & Ingredients'}
                        </span>
                        {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>

                    {expanded && (
                        <div className="space-y-4 pt-3 pb-2 text-xs sm:text-sm animate-in fade-in slide-in-from-top-2 duration-300">
                            {/* Ingredients */}
                            <div>
                                <h4 className="font-bold text-foreground mb-2 flex items-center gap-1.5">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                    Key Ingredients:
                                </h4>
                                <ul className="grid grid-cols-1 gap-1.5 pl-2 text-muted-foreground">
                                    {meal.ingredients.map((ing, i) => (
                                        <li key={i} className="flex items-start gap-2">
                                            <span className="text-emerald-500 mt-1">•</span>
                                            <span>{ing}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Method */}
                            <div>
                                <h4 className="font-bold text-foreground mb-2 flex items-center gap-1.5">
                                    <span className="w-2 h-2 rounded-full bg-primary"></span>
                                    Step-by-Step Preparation:
                                </h4>
                                <ol className="space-y-2 pl-2">
                                    {meal.instructions.map((step, idx) => (
                                        <li key={idx} className="flex items-start gap-2 text-muted-foreground">
                                            <span className="w-5 h-5 rounded-full bg-secondary flex items-center justify-center text-[10px] font-bold text-foreground shrink-0 mt-0.5">
                                                {idx + 1}
                                            </span>
                                            <span className="leading-snug">{step}</span>
                                        </li>
                                    ))}
                                </ol>
                            </div>
                        </div>
                    )}
                </div>

                {/* Primary Action Buttons */}
                <div className="pt-2 space-y-2.5">
                    {/* YouTube Watch Button (All India Based) */}
                    <a
                        href={meal.youtubeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full flex items-center justify-center gap-2.5 py-3 px-4 rounded-2xl bg-red-600 hover:bg-red-700 active:scale-[0.98] text-white font-semibold text-sm shadow-md transition-all duration-200"
                    >
                        <FaYoutube className="w-5 h-5 shrink-0" />
                        <span>Watch Recipe Preparation on YouTube</span>
                        <ExternalLink className="w-3.5 h-3.5 opacity-75 ml-auto" />
                    </a>

                    <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] text-muted-foreground truncate">
                            Chef: <strong className="text-foreground">{meal.recommendedChefChannel || 'Ranveer Brar'}</strong>
                        </span>

                        <Button
                            variant="outline"
                            size="sm"
                            className="rounded-xl text-xs h-8 px-3 gap-1.5"
                            onClick={handleQuickLog}
                            disabled={logging || logged}
                        >
                            {logged ? (
                                <>
                                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                                    <span>Logged!</span>
                                </>
                            ) : (
                                <>
                                    <PlusCircle className="w-3.5 h-3.5" />
                                    <span>Log This Meal</span>
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        </Card>
    );
};

export const RecipeRecommendationsView = ({ recommendationsData, fallbackMealType = 'meal' }) => {
    const parsed = parseRecommendations(recommendationsData, fallbackMealType);

    if (!parsed || !parsed.meals || parsed.meals.length === 0) {
        return (
            <div className="p-6 text-center text-muted-foreground">
                <p>No formatted recipes found. Please generate new meal ideas.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Summary Header */}
            {parsed.summary && (
                <div className="bg-gradient-to-r from-emerald-500/10 via-primary/10 to-amber-500/10 border border-emerald-500/20 rounded-3xl p-5 sm:p-6 backdrop-blur-sm">
                    <div className="flex items-start gap-3">
                        <div className="bg-emerald-500 p-2.5 rounded-2xl text-white shadow-md">
                            <Utensils className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-bold text-base sm:text-lg text-foreground">
                                Personalized Regional Nutrition Recommendations
                            </h3>
                            <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                                {parsed.summary}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Indian YouTube Channels Quick Bar */}
            <div className="bg-card/70 border border-border/60 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
                    <FaYoutube className="w-4 h-4 text-red-600" />
                    <span>Explore India's Top Culinary Channels:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                    {TOP_INDIAN_CHANNELS.map((ch) => (
                        <a
                            key={ch.name}
                            href={ch.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-secondary hover:bg-red-500/10 hover:text-red-600 transition-colors border border-border/40"
                        >
                            <span>{ch.name}</span>
                            <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                        </a>
                    ))}
                </div>
            </div>

            {/* Recipe Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {parsed.meals.map((meal, index) => (
                    <RecipeCard key={`${meal.name}-${index}`} meal={meal} />
                ))}
            </div>
        </div>
    );
};

export default RecipeRecommendationsView;
