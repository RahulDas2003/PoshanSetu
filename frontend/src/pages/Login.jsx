import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Activity, Camera, PieChart, Target, Zap } from 'lucide-react';
import logo from '../assets/logo.jpeg';
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const Login = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        
        const result = await login(formData.email, formData.password);
        
        setLoading(false);
        if (result.success) {
            navigate('/dashboard');
        }
    };

    return (
        <div className="min-h-screen pt-20 pb-10 flex items-center justify-center relative overflow-hidden bg-background text-foreground">

            <div className="container mx-auto px-6 grid md:grid-cols-2 gap-12 items-center max-w-5xl relative z-10">
                
                {/* Auth Card */}
                <Card className="w-full max-w-md mx-auto relative z-20 shadow-xl border-border bg-card/80 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-500">
                    <CardContent className="p-8">
                        <div className="text-center mb-10">
                            <Link to="/" className="inline-flex rounded-3xl mb-6 shadow-sm transform hover:scale-110 transition-transform overflow-hidden">
                                <img src={logo} alt="PoshanSetu Logo" className="h-16 w-16 rounded-2xl object-cover" />
                            </Link>
                            <h1 className="text-3xl font-bold tracking-tight mb-2">Welcome Back!</h1>
                            <p className="text-muted-foreground font-medium text-sm">Log in to continue your nutrition journey</p>
                        </div>

                        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-foreground">Email Address</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
                                        <Mail className="h-5 w-5" />
                                    </div>
                                    <Input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="you@example.com"
                                        className="pl-11 h-12 text-base rounded-xl"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-foreground">Password</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
                                        <Lock className="h-5 w-5" />
                                    </div>
                                    <Input
                                        type={showPassword ? 'text' : 'password'}
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        placeholder="Enter your password"
                                        className="pl-11 pr-11 h-12 text-base rounded-xl"
                                        required
                                    />
                                    <button
                                        type="button"
                                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                    </button>
                                </div>
                            </div>

                            <Button 
                                type="submit" 
                                size="lg"
                                className="w-full text-base h-12 mt-4 rounded-xl shadow-md gap-2"
                                disabled={loading}
                            >
                                {loading ? (
                                    <span className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin"></span>
                                ) : (
                                    <>
                                        Log In <ArrowRight className="h-5 w-5" />
                                    </>
                                )}
                            </Button>
                        </form>

                        <div className="mt-8 text-center border-t pt-6">
                            <p className="text-muted-foreground font-medium text-sm">
                                Don't have an account?{' '}
                                <Link to="/register" className="text-primary hover:text-primary/80 transition-colors font-bold hover:underline decoration-2 underline-offset-4">Sign up free</Link>
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Features (Visible on Desktop) */}
                <div className="hidden md:flex flex-col gap-8 animate-in fade-in slide-in-from-right-12 duration-700">
                    <h2 className="text-4xl font-extrabold leading-tight tracking-tight">Track Your <br/><span className="text-primary">Nutrition</span> with AI</h2>
                    <ul className="flex flex-col gap-5">
                        {[
                            { icon: <Camera />, text: "Scan food photos for instant nutrition" },
                            { icon: <PieChart />, text: "Beautiful analytics dashboard" },
                            { icon: <Target />, text: "Personalized daily goals" },
                            { icon: <Zap />, text: "AI-powered meal suggestions" }
                        ].map((item, i) => (
                            <li key={i} className="flex items-center gap-4 p-4 bg-secondary/50 backdrop-blur-xl rounded-2xl border shadow-sm">
                                <span className="text-primary bg-background p-2.5 rounded-xl shadow-sm border border-border/50">{item.icon}</span>
                                <span className="text-base font-semibold text-foreground">{item.text}</span>
                            </li>
                        ))}
                    </ul>
                </div>

            </div>
        </div>
    );
};

export default Login;
