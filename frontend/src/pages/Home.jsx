import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowRight, Check, Camera, PieChart, Target, Zap, Sparkles, Activity, Apple, Salad } from 'lucide-react';
import { Button } from "@/components/ui/button";
import logo from '../assets/logo.jpeg';

const Home = () => {
    const { isAuthenticated } = useAuth();

    return (
        <div className="bg-background min-h-screen pt-20 overflow-hidden text-foreground pb-20">
            
            <div className="container mx-auto px-6 relative z-10 space-y-32">
                
                {/* 1. MASSIVE HERO SECTION */}
                <section className="pt-8 lg:pt-12 text-center lg:text-left grid lg:grid-cols-2 gap-12 items-center">
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary border text-sm font-bold text-secondary-foreground">
                            <Sparkles className="h-5 w-5 text-amber-500" /> Introducing PoshanSetu
                        </div>
                        
                        <h1 className="text-6xl sm:text-7xl lg:text-8xl font-black leading-[1.1] tracking-tighter">
                            Eat Smart.<br/>Live <span className="text-primary block">Better.</span>
                        </h1>
                        
                        <p className="text-xl sm:text-2xl text-muted-foreground font-medium max-w-xl mx-auto lg:mx-0">
                            Snap a photo of your meal and let AI do the rest. Effortless tracking, personalized insights, and beautiful analytics.
                        </p>
                        
                        <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
                            <Link to={isAuthenticated ? '/dashboard' : '/register'}>
                                <Button size="lg" className="w-full sm:w-auto text-lg px-8 py-6 rounded-full gap-2 transition-transform hover:scale-105 shadow-xl">
                                    {isAuthenticated ? 'Go to Dashboard' : 'Start Free Today'}
                                    <ArrowRight className="h-5 w-5" />
                                </Button>
                            </Link>
                            {!isAuthenticated && (
                                <Link to="/login">
                                    <Button variant="outline" size="lg" className="w-full sm:w-auto text-lg px-8 py-6 rounded-full">
                                        Login
                                    </Button>
                                </Link>
                            )}
                        </div>
                    </div>
                    
                    {/* Hero Visual / Mockup */}
                    <div className="relative pt-10 lg:pt-0 animate-in fade-in zoom-in-95 duration-1000 delay-200">
                        <div className="w-[300px] sm:w-[350px] md:w-[400px] aspect-[1/2] rounded-[3rem] bg-card mx-auto border-8 border-primary/20 shadow-2xl overflow-hidden relative">
                            {/* Dynamic Mockup UI */}
                            <div className="p-6 h-full flex flex-col gap-6 bg-secondary/30">
                                <div className="space-y-1">
                                    <div className="text-sm font-bold text-muted-foreground">Today's Progress</div>
                                    <div className="text-3xl font-black">1,450 kcal</div>
                                </div>
                                <div className="w-full aspect-square rounded-full border-[1.5rem] border-muted border-t-emerald-500 border-r-emerald-500 flex items-center justify-center relative shadow-inner">
                                    <div className="text-center w-full">
                                        <div className="text-4xl font-black text-emerald-500">65%</div>
                                        <div className="text-sm font-bold text-muted-foreground">of goal</div>
                                    </div>
                                    <div className="absolute top-0 right-0 transform rotate-12 bg-background p-3 rounded-2xl shadow-lg border">
                                        <Apple className="h-8 w-8 text-rose-500" />
                                    </div>
                                    <div className="absolute bottom-4 left-0 -translate-x-4 bg-background p-3 rounded-2xl shadow-lg border">
                                        <Salad className="h-8 w-8 text-emerald-500" />
                                    </div>
                                </div>
                                <div className="space-y-3 flex-1 mt-auto bg-background p-5 rounded-3xl shadow-sm border">
                                    <div className="flex justify-between font-bold"><span>Protein</span><span className="text-rose-500">75g</span></div>
                                    <div className="w-full h-3 bg-secondary rounded-full overflow-hidden"><div className="h-full bg-rose-500 w-3/4"></div></div>
                                    
                                    <div className="flex justify-between font-bold mt-2"><span>Carbs</span><span className="text-blue-500">180g</span></div>
                                    <div className="w-full h-3 bg-secondary rounded-full overflow-hidden"><div className="h-full bg-blue-500 w-2/3"></div></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 2. BENTO GRID SECTION (Features) */}
                <section className="pt-20">
                    <div className="text-center max-w-3xl mx-auto mb-16 px-4">
                        <h2 className="text-5xl font-black mb-6">Built to be effortless.</h2>
                        <p className="text-xl text-muted-foreground font-medium">Everything you need to master your nutrition without the tedious manual entry.</p>
                    </div>

                    {/* The Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6 auto-rows-[minmax(300px,auto)]">
                        {/* Big Card 1 */}
                        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 p-10 rounded-[2rem] lg:col-span-8 flex flex-col justify-end relative overflow-hidden group">
                            <Camera className="h-10 w-10 mb-6 opacity-90" />
                            <h3 className="text-3xl font-black mb-4">AI Food Scanner</h3>
                            <p className="text-lg opacity-90 font-medium max-w-lg relative z-10">Snap a photo. Our advanced AI instantly recognizes your meal and estimates calories and macros with incredible accuracy.</p>
                            <Camera className="absolute right-0 bottom-0 h-96 w-96 opacity-5 translate-x-1/4 translate-y-1/4 pointer-events-none" />
                        </div>
                        
                        {/* Small Card 1 */}
                        <div className="bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 p-10 rounded-[2rem] lg:col-span-4 flex flex-col justify-end relative overflow-hidden group">
                            <Zap className="h-10 w-10 mb-6 opacity-90" />
                            <h3 className="text-2xl font-black mb-4">Smart Recs</h3>
                            <p className="text-base opacity-90 font-medium relative z-10">Personalized meal suggestions designed to hit your missing macros for the day.</p>
                            <Zap className="absolute right-0 bottom-0 h-64 w-64 opacity-5 translate-x-1/4 translate-y-1/4 pointer-events-none" />
                        </div>

                        {/* Small Card 2 */}
                        <div className="bg-primary/5 border border-primary/10 text-primary p-10 rounded-[2rem] lg:col-span-4 flex flex-col justify-end relative overflow-hidden group">
                            <Target className="h-10 w-10 mb-6" />
                            <h3 className="text-2xl font-black mb-4">Auto Goals</h3>
                            <p className="text-base font-medium opacity-90">Dynamic targets that adjust to your personal weight loss, maintenance, or muscle gain objectives.</p>
                            <Target className="absolute -right-10 -top-10 h-64 w-64 opacity-5 pointer-events-none" />
                        </div>

                        {/* Big Card 2 */}
                        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 p-10 rounded-[2rem] lg:col-span-8 flex flex-col justify-end relative overflow-hidden group">
                            <PieChart className="h-10 w-10 mb-6 opacity-90" />
                            <h3 className="text-3xl font-black mb-4 z-10 relative">Beautiful Analytics</h3>
                            <p className="text-lg opacity-90 font-medium max-w-md z-10 relative">Visualize your progress with stunning charts. See exactly where your calories come from and how your habits evolve.</p>
                            <PieChart className="absolute right-0 bottom-0 h-96 w-96 opacity-5 translate-x-1/4 translate-y-1/4 pointer-events-none" />
                        </div>
                    </div>
                </section>

                {/* CTA Overlay */}
                <section className="relative px-2 sm:px-4">
                    <div className="bg-primary/5 border rounded-[2rem] sm:rounded-[3rem] p-8 sm:p-12 lg:p-20 text-center overflow-hidden relative shadow-sm">
                        <div className="relative z-10 w-full max-w-3xl mx-auto space-y-6 sm:space-y-8">
                            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black leading-tight text-foreground">Ready to transform your health?</h2>
                            <p className="text-lg sm:text-xl text-muted-foreground font-medium">Join thousands tracking meals the smart way. 100% free.</p>
                            <div className="pt-2 sm:pt-4 pb-2">
                                <Link to="/register">
                                    <Button size="lg" className="w-full sm:w-auto text-base sm:text-lg px-6 py-6 sm:px-10 sm:py-8 rounded-2xl sm:rounded-full shadow-xl transform hover:scale-105 transition-all gap-2 flex items-center justify-center">
                                        Start Your Journey <ArrowRight className="h-5 w-5" />
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Minimal Footer */}
                <footer className="text-center py-10 border-t text-muted-foreground font-medium flex flex-col items-center justify-center">
                    <div className="flex items-center gap-2 mb-4 text-xl font-black text-foreground">
                        <img src={logo} alt="PoshanSetu Logo" className="h-8 w-8 rounded-lg object-cover" /> PoshanSetu
                    </div>
                    <p>Designed for effortless tracking. Made with ❤️ in 2026.</p>
                </footer>

            </div>
        </div>
    );
};

export default Home;
