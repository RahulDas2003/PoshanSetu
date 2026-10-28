import { useState, useRef, useEffect } from 'react';
import { Send, MessageCircle, Cpu, Zap, RefreshCw, Search, Camera, Check, X, Lightbulb, Target, Trash2 } from 'lucide-react';
import { aiAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import RecipeRecommendationsView from '../components/RecipeRecommendations';

const CHAT_STORAGE_KEY = 'poshanSetu_chat_messages';

const AIAssistant = () => {
    const { user } = useAuth();
    const [messages, setMessages] = useState(() => {
        try {
            const saved = sessionStorage.getItem(CHAT_STORAGE_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed) && parsed.length > 0) return parsed;
            }
        } catch (e) { /* ignore parse errors */ }
        return [];
    });
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [dailyTip, setDailyTip] = useState('');
    const [recommendations, setRecommendations] = useState('');
    const [selectedMealType, setSelectedMealType] = useState('dinner');
    const [activeTab, setActiveTab] = useState('chat');
    const [foodDescription, setFoodDescription] = useState('');
    const [selectedImage, setSelectedImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [foodAnalysis, setFoodAnalysis] = useState(null);
    const messagesEndRef = useRef(null);

    // Save messages to sessionStorage whenever they change
    useEffect(() => {
        if (messages.length > 0) {
            try {
                sessionStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages));
            } catch (e) { /* ignore storage errors */ }
        }
    }, [messages]);

    useEffect(() => {
        fetchDailyTip();
        // Only set the welcome message if there are no saved messages
        if (messages.length === 0) {
            setMessages([{
                role: 'assistant',
                content: `Hey ${user?.name?.split(' ')[0] || 'there'}! 👋 I'm your AI nutrition assistant. Ask me anything about nutrition, meal planning, or healthy eating!`
            }]);
        }
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const fetchDailyTip = async () => {
        try {
            const response = await aiAPI.getDailyTip();
            setDailyTip(response.data.tip);
        } catch (error) {
            setDailyTip('Stay hydrated! Aim for 8 glasses of water daily. 💧');
        }
    };

    const fetchRecommendations = async (mealType) => {
        setSelectedMealType(mealType);
        setLoading(true);
        try {
            const response = await aiAPI.getRecommendations(mealType);
            setRecommendations(response.data.recommendations);
        } catch (error) {
            toast.error('Failed to get recommendations');
        } finally {
            setLoading(false);
        }
    };

    const sendMessage = async () => {
        if (!input.trim() || loading) return;

        const userMessage = { role: 'user', content: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setLoading(true);

        try {
            const response = await aiAPI.chat(input);
            const assistantMessage = { role: 'assistant', content: response.data.response };
            setMessages(prev => [...prev, assistantMessage]);
        } catch (error) {
            toast.error('Failed to get response');
            setMessages(prev => [...prev, { 
                role: 'assistant', 
                content: "Sorry, I couldn't process that. Please try again." 
            }]);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast.error('Image size must be less than 5MB');
                return;
            }
            setSelectedImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const analyzeFood = async () => {
        if (!selectedImage) {
            toast.error('Please upload an image of your food');
            return;
        }
        
        setLoading(true);
        setFoodAnalysis(null);
        
        try {
            const formData = new FormData();
            formData.append('image', selectedImage);
            if (foodDescription.trim()) {
                formData.append('description', foodDescription);
            }

            const response = await aiAPI.analyzeImage(formData);
            setFoodAnalysis(response.data.analysis);
            toast.success('Food analyzed! 🍽️');
        } catch (error) {
            toast.error('Failed to analyze food');
        } finally {
            setLoading(false);
        }
    };

    const clearAnalysis = () => {
        setFoodDescription('');
        setSelectedImage(null);
        setImagePreview(null);
        setFoodAnalysis(null);
    };

    const quickQuestions = [
        "What should I eat for lunch?",
        "How much protein do I need?",
        "Tips for weight loss",
        "Healthy snack ideas"
    ];

    const clearChat = () => {
        const welcomeMessage = {
            role: 'assistant',
            content: `Hey ${user?.name?.split(' ')[0] || 'there'}! 👋 I'm your AI nutrition assistant. Ask me anything about nutrition, meal planning, or healthy eating!`
        };
        setMessages([welcomeMessage]);
        sessionStorage.removeItem(CHAT_STORAGE_KEY);
    };

    const exampleMeals = [
        "2 eggs, 2 toast with butter, and orange juice",
        "Chicken salad with mixed greens and olive oil dressing",
        "Grilled salmon with rice and steamed vegetables"
    ];

    return (
        <div className="min-h-screen pt-28 pb-20 bg-background text-foreground">
            <div className="container mx-auto px-6 max-w-5xl space-y-8">
                
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3 mb-1">
                            <div className="bg-primary/10 text-primary p-2 rounded-lg">
                                <Cpu className="h-6 w-6" />
                            </div>
                            AI Assistant
                        </h1>
                        <p className="text-muted-foreground ml-1">Your personal nutrition guide</p>
                    </div>
                </div>

                {/* Daily Tip */}
                {dailyTip && (
                    <Card className="bg-secondary/40 border-muted animate-in fade-in slide-in-from-bottom-6 duration-700 shadow-sm relative overflow-hidden group">
                        <CardContent className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div className="bg-background border p-2 rounded-lg shadow-sm text-amber-500 group-hover:scale-110 transition-transform">
                                    <Lightbulb className="h-6 w-6" />
                                </div>
                                <div>
                                    <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">Daily Tip</h4>
                                    <p className="font-semibold">{dailyTip}</p>
                                </div>
                            </div>
                            <Button 
                                variant="outline"
                                className="rounded-full gap-2 flex-shrink-0"
                                onClick={fetchDailyTip}
                            >
                                <RefreshCw className="h-4 w-4 group-hover:rotate-180 transition-transform duration-700" /> Refresh
                            </Button>
                        </CardContent>
                    </Card>
                )}

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
                    
                    {/* Sidebar Nav */}
                    <div className="lg:col-span-1 flex flex-col gap-2 bg-secondary/30 p-2 rounded-2xl h-fit border border-border/50">
                        <button 
                            className={`p-4 rounded-xl font-bold transition-all text-left flex items-center gap-3 border ${activeTab === 'chat' ? 'bg-background text-foreground border-border shadow-sm' : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-secondary/50'}`}
                            onClick={() => setActiveTab('chat')}
                        >
                            <MessageCircle className="h-5 w-5" /> AI Chat
                        </button>
                        <button 
                            className={`p-4 rounded-xl font-bold transition-all text-left flex items-center gap-3 border ${activeTab === 'analyze' ? 'bg-background text-foreground border-border shadow-sm' : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-secondary/50'}`}
                            onClick={() => setActiveTab('analyze')}
                        >
                            <Camera className="h-5 w-5" /> Snap & Analyze
                        </button>
                        <button 
                            className={`p-4 rounded-xl font-bold transition-all text-left flex items-center gap-3 border ${activeTab === 'recommend' ? 'bg-background text-foreground border-border shadow-sm' : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-secondary/50'}`}
                            onClick={() => setActiveTab('recommend')}
                        >
                            <Zap className="h-5 w-5" /> Meal Ideas
                        </button>
                    </div>

                    {/* Main Area */}
                    <div className="lg:col-span-3">
                        
                        {/* Chat Tab */}
                        {activeTab === 'chat' && (
                            <Card className="h-[600px] flex flex-col shadow-sm border overflow-hidden">
                                <CardHeader className="p-4 border-b bg-muted/30 flex-row justify-between items-center space-y-0">
                                    <div className="flex items-center gap-3">
                                        <div className="relative">
                                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center border text-primary">
                                                <Cpu className="h-5 w-5" />
                                            </div>
                                            <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-background"></div>
                                        </div>
                                        <div>
                                            <CardTitle className="text-sm font-bold tracking-tight">PoshanSetu Assistant</CardTitle>
                                            <div className="text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                                                Online
                                            </div>
                                        </div>
                                    </div>
                                    <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        className="rounded-full gap-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                                        onClick={clearChat}
                                    >
                                        <Trash2 className="h-4 w-4" /> Clear
                                    </Button>
                                </CardHeader>
                                
                                <CardContent className="flex-1 p-0 flex flex-col overflow-hidden bg-muted/10">
                                    <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 custom-scrollbar">
                                        {messages.map((msg, index) => (
                                            <div key={index} className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                                                <div className="flex gap-3 max-w-[85%] sm:max-w-[75%] items-end">
                                                    {msg.role === 'assistant' && (
                                                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center border text-primary shrink-0 hidden sm:flex">
                                                            <Cpu className="h-4 w-4" />
                                                        </div>
                                                    )}
                                                    
                                                    <div className={`rounded-2xl p-4 shadow-sm ${msg.role === 'user' ? 'bg-primary text-primary-foreground rounded-br-sm' : 'bg-background border text-foreground rounded-bl-sm'}`}>
                                                        <p className="font-medium whitespace-pre-wrap leading-relaxed text-sm sm:text-base">{msg.content}</p>
                                                    </div>

                                                    {msg.role === 'user' && (
                                                        <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center border text-muted-foreground shrink-0 hidden sm:flex font-bold text-xs uppercase">
                                                            {user?.name?.charAt(0) || 'U'}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                        
                                        {loading && (
                                            <div className="flex w-full justify-start animate-in fade-in slide-in-from-bottom-2">
                                                <div className="flex gap-3 max-w-[85%] sm:max-w-[75%] items-end">
                                                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center border text-primary shrink-0 hidden sm:flex">
                                                        <Cpu className="h-4 w-4" />
                                                    </div>
                                                    <div className="rounded-2xl p-4 bg-background border rounded-bl-sm shadow-sm flex items-center h-[52px]">
                                                        <div className="flex gap-1.5 items-center">
                                                            <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                                            <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                                            <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce"></div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        <div ref={messagesEndRef} className="h-2" />
                                    </div>

                                    <div className="p-4 bg-background border-t">
                                        <div className="flex flex-col gap-3">
                                            {/* Quick Actions Scrollbar */}
                                            <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar hide-scrollbar-on-mobile">
                                                {quickQuestions.map((q, i) => (
                                                    <Button 
                                                        key={i} 
                                                        variant="outline"
                                                        size="sm"
                                                        className="rounded-full h-8 px-4 text-xs font-semibold text-muted-foreground whitespace-nowrap bg-secondary/30 hover:bg-secondary border-transparent hover:border-border transition-colors hover:text-foreground"
                                                        onClick={() => { setInput(q); }}
                                                    >
                                                        {q}
                                                    </Button>
                                                ))}
                                            </div>
                                            
                                            {/* Input Area */}
                                            <div className="flex items-center gap-3 bg-secondary/30 p-1.5 rounded-full border border-border/50 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all shadow-sm">
                                                <Input
                                                    type="text"
                                                    value={input}
                                                    onChange={(e) => setInput(e.target.value)}
                                                    onKeyPress={handleKeyPress}
                                                    placeholder="Ask about nutrition, meals, or goals..."
                                                    disabled={loading}
                                                    className="flex-1 bg-transparent border-0 outline-none px-4 shadow-none h-11 focus-visible:ring-0 text-base placeholder:text-muted-foreground/70"
                                                />
                                                <Button 
                                                    size="icon"
                                                    className={`w-11 h-11 rounded-full flex-shrink-0 transition-transform ${input.trim() ? 'scale-100' : 'scale-90 opacity-80'}`}
                                                    onClick={sendMessage}
                                                    disabled={loading || !input.trim()}
                                                >
                                                    <Send className="h-5 w-5 ml-0.5" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Analyze Food Tab */}
                        {activeTab === 'analyze' && (
                            <Card className="min-h-[600px] shadow-sm border">
                                <CardHeader>
                                    <CardTitle className="text-2xl">Estimate Nutrition</CardTitle>
                                    <CardDescription className="text-base font-medium">Snap a photo of your meal and let AI estimate its nutritional content!</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {!foodAnalysis ? (
                                        <div className="space-y-6 max-w-2xl px-1">
                                            {/* Image Upload Area */}
                                            <div className="relative border-2 border-dashed border-border rounded-2xl overflow-hidden bg-secondary/30 transition-all hover:bg-secondary/50 group">
                                                {!imagePreview ? (
                                                    <label htmlFor="image-upload" className="flex flex-col items-center justify-center w-full h-48 sm:h-56 cursor-pointer rounded-2xl">
                                                        <div className="w-16 h-16 bg-background rounded-full flex items-center justify-center border shadow-sm mb-4 group-hover:scale-105 transition-transform">
                                                            <Camera className="h-7 w-7 text-muted-foreground" />
                                                        </div>
                                                        <p className="font-semibold text-base mb-1">Click or drag image to upload</p>
                                                        <p className="text-sm text-muted-foreground font-medium">SVG, PNG, JPG or WEBP (max. 5MB)</p>
                                                        <input 
                                                            id="image-upload" 
                                                            type="file" 
                                                            accept="image/*" 
                                                            className="hidden" 
                                                            onChange={handleImageChange}
                                                        />
                                                    </label>
                                                ) : (
                                                    <div className="relative w-full h-48 sm:h-56">
                                                        <img 
                                                            src={imagePreview} 
                                                            alt="Food preview" 
                                                            className="w-full h-full object-cover"
                                                        />
                                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                            <label htmlFor="image-upload-change" className="bg-background/90 text-foreground px-4 py-2 rounded-lg font-semibold cursor-pointer shadow-sm hover:scale-105 transition-transform flex items-center gap-2">
                                                                <RefreshCw className="h-4 w-4" /> Change Image
                                                            </label>
                                                            <input 
                                                                id="image-upload-change" 
                                                                type="file" 
                                                                accept="image/*" 
                                                                className="hidden" 
                                                                onChange={handleImageChange}
                                                            />
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Optional Description */}
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground pl-2">Optional Context</label>
                                                <Input
                                                    value={foodDescription}
                                                    onChange={(e) => setFoodDescription(e.target.value)}
                                                    placeholder="E.g., It was cooked in olive oil, contains walnuts..."
                                                    className="w-full bg-secondary/50 border border-input rounded-xl p-4 h-14 text-sm sm:text-base font-medium outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors placeholder:text-muted-foreground"
                                                />
                                            </div>

                                            <div>
                                                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-3 pl-2">Or describe it</span>
                                                <div className="flex flex-wrap gap-2">
                                                    {exampleMeals.map((meal, i) => (
                                                        <Button 
                                                            key={i}
                                                            variant="secondary"
                                                            size="sm"
                                                            className="rounded-xl h-auto py-2 px-3 text-xs sm:text-sm font-medium whitespace-normal text-left h-fit items-start min-h-10 border border-transparent hover:border-border"
                                                            onClick={() => setFoodDescription(meal)}
                                                        >
                                                            {meal.substring(0, 35)}...
                                                        </Button>
                                                    ))}
                                                </div>
                                            </div>

                                            <Button 
                                                size="lg"
                                                className="w-full h-14 rounded-xl text-base sm:text-lg gap-2 shadow-md"
                                                onClick={analyzeFood}
                                                disabled={loading || (!selectedImage && !foodDescription.trim())}
                                            >
                                                {loading ? (
                                                    <><div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin"></div> Analyzing...</>
                                                ) : (
                                                    <><Search className="h-5 w-5" /> Analyze</>
                                                )}
                                            </Button>
                                        </div>
                                ) : (
                                    <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
                                        <div className="flex justify-between items-center bg-emerald-500/10 p-4 rounded-xl border border-emerald-500/20">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center"><Check className="h-5 w-5" /></div>
                                                <h3 className="text-lg font-bold text-emerald-600 dark:text-emerald-400 m-0">Analysis Results</h3>
                                            </div>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-background/50 rounded-full" onClick={clearAnalysis}><X className="h-5 w-5" /></Button>
                                        </div>
                                        
                                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                            <div className="bg-secondary/40 p-4 rounded-2xl border text-center">
                                                <div className="text-[10px] sm:text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Calories</div>
                                                <div className="text-2xl font-black text-foreground">{foodAnalysis.totalCalories || 0}</div>
                                            </div>
                                            <div className="bg-emerald-500/5 border border-emerald-500/10 p-4 rounded-2xl text-center">
                                                <div className="text-[10px] sm:text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-1">Protein</div>
                                                <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{foodAnalysis.totalProtein || 0}g</div>
                                            </div>
                                            <div className="bg-blue-500/5 border border-blue-500/10 p-4 rounded-2xl text-center">
                                                <div className="text-[10px] sm:text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-1">Carbs</div>
                                                <div className="text-2xl font-black text-blue-600 dark:text-blue-400">{foodAnalysis.totalCarbs || 0}g</div>
                                            </div>
                                            <div className="bg-amber-500/5 border border-amber-500/10 p-4 rounded-2xl text-center">
                                                <div className="text-[10px] sm:text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-1">Fat</div>
                                                <div className="text-2xl font-black text-amber-600 dark:text-amber-400 text-foreground">{foodAnalysis.totalFat || 0}g</div>
                                            </div>
                                        </div>

                                        {foodAnalysis.foods && foodAnalysis.foods.length > 0 && (
                                            <div>
                                                <h4 className="text-lg font-bold mb-4">Detected Items</h4>
                                                <div className="bg-secondary/30 rounded-2xl border overflow-hidden">
                                                    {foodAnalysis.foods.map((food, idx) => (
                                                        <div key={idx} className="flex justify-between items-center p-4 border-b last:border-0 hover:bg-background transition-colors">
                                                            <div>
                                                                <div className="font-bold text-sm sm:text-base">{food.name}</div>
                                                                <div className="text-xs sm:text-sm text-muted-foreground font-medium">{food.portion}</div>
                                                            </div>
                                                            <div className="font-bold text-primary bg-primary/10 px-3 py-1 rounded-lg text-sm sm:text-base">
                                                                {food.calories} <span className="text-xs opacity-70">kcal</span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {foodAnalysis.healthRating && (
                                            <div className="flex items-center gap-4 bg-secondary/30 p-5 sm:p-6 rounded-2xl border">
                                                <div className="bg-background h-12 w-12 sm:h-14 sm:w-14 shrink-0 rounded-full flex items-center justify-center border shadow-sm text-amber-500">
                                                    {foodAnalysis.healthRating > 7 ? <Lightbulb className="h-6 w-6 sm:h-7 sm:w-7" /> : foodAnalysis.healthRating > 4 ? <Check className="h-6 w-6 sm:h-7 sm:w-7 text-emerald-500" /> : <Target className="h-6 w-6 sm:h-7 sm:w-7 text-destructive" />}
                                                </div>
                                                <div>
                                                    <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">Health Rating</div>
                                                    <div className="text-xl sm:text-2xl font-black">{foodAnalysis.healthRating}/10</div>
                                                </div>
                                            </div>
                                        )}

                                        {foodAnalysis.suggestions && (
                                            <div className="bg-amber-500/5 border border-amber-500/20 p-5 sm:p-6 rounded-2xl">
                                                <h4 className="font-bold text-amber-600 dark:text-amber-500 mb-2 uppercase tracking-wide text-xs sm:text-sm flex items-center gap-2">
                                                    <Lightbulb className="h-4 w-4" /> AI Suggestion
                                                </h4>
                                                <p className="font-medium text-sm sm:text-base text-foreground/90 leading-relaxed">{foodAnalysis.suggestions}</p>
                                            </div>
                                        )}

                                        <Button variant="outline" className="w-full py-6 rounded-xl text-base" onClick={clearAnalysis}>
                                            Analyze Another Meal
                                        </Button>
                                    </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}

                        {/* Recommendations Tab */}
                        {activeTab === 'recommend' && (
                            <Card className="min-h-[600px] flex flex-col shadow-sm border">
                                <CardHeader>
                                    <CardTitle className="text-2xl">Meal Ideas</CardTitle>
                                    <CardDescription className="text-base font-medium">Personalized ideas based on your goals and remaining calories.</CardDescription>
                                </CardHeader>
                                <CardContent className="flex-1 flex flex-col pb-6">
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
                                        {['breakfast', 'lunch', 'dinner', 'snack'].map(type => (
                                            <Button 
                                                key={type}
                                                variant="outline"
                                                className="h-auto py-4 rounded-2xl flex flex-col items-center gap-2"
                                                onClick={() => fetchRecommendations(type)}
                                                disabled={loading}
                                            >
                                                <div className="bg-secondary/50 p-3 rounded-full">
                                                    {type === 'breakfast' && <Zap className="h-5 w-5 text-amber-500" />}
                                                    {type === 'lunch' && <Target className="h-5 w-5 text-emerald-500" />}
                                                    {type === 'dinner' && <Cpu className="h-5 w-5 text-blue-500" />}
                                                    {type === 'snack' && <Lightbulb className="h-5 w-5 text-rose-500" />}
                                                </div>
                                                <span className="capitalize font-semibold">{type}</span>
                                            </Button>
                                        ))}
                                    </div>

                                    <div className="flex-1 bg-secondary/30 border rounded-2xl p-6 relative overflow-hidden min-h-[300px]">
                                        {loading ? (
                                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm z-10 space-y-4">
                                                <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                                                <p className="font-semibold text-muted-foreground animate-pulse">Generating recipes...</p>
                                            </div>
                                        ) : recommendations ? (
                                            <div className="overflow-y-auto h-full pr-1 custom-scrollbar">
                                                <RecipeRecommendationsView 
                                                    recommendationsData={recommendations} 
                                                    fallbackMealType={selectedMealType} 
                                                />
                                            </div>
                                        ) : (
                                            <div className="absolute inset-0 flex flex-col items-center justify-center opacity-50 px-8 text-center space-y-4">
                                                <div className="bg-background p-4 rounded-full border shadow-sm">
                                                    <Target className="h-10 w-10 text-muted-foreground" />
                                                </div>
                                                <p className="text-lg font-semibold max-w-sm">Select a meal type above to get AI-powered recommendations tailored to you!</p>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AIAssistant;
