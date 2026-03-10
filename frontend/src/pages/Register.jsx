import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Lock, Eye, EyeOff, ArrowRight, Activity, CheckCircle, Smartphone, ShieldCheck, Zap } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validate passwords match
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        // Validate password length
        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setLoading(true);
        
        const result = await register(formData.name, formData.email, formData.password);
        
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
                        <div className="text-center mb-8">
                            <Link to="/" className="inline-flex bg-primary/10 text-primary p-4 rounded-3xl mb-4 shadow-sm transform hover:scale-110 transition-transform">
                                <Activity className="h-8 w-8" />
                            </Link>
                            <h1 className="text-3xl font-bold tracking-tight mb-2">Create Account</h1>
                            <p className="text-muted-foreground font-medium text-sm">Start your healthy eating journey today</p>
                        </div>

                        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                            {error && (
                                <div className="bg-destructive/10 text-destructive p-3 rounded-lg text-sm font-semibold border border-destructive/20 text-center animate-in slide-in-from-top-2">
                                    {error}
                                </div>
                            )}
                            
                            <div className="space-y-2">
                                <label className="text-sm font-semibold">Full Name</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
                                        <User className="h-5 w-5" />
                                    </div>
                                    <Input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder="John Doe"
                                        className="pl-11 h-11 rounded-xl"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold">Email Address</label>
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
                                        className="pl-11 h-11 rounded-xl"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold">Password</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
                                        <Lock className="h-5 w-5" />
                                    </div>
                                    <Input
                                        type={showPassword ? 'text' : 'password'}
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        placeholder="Min. 6 characters"
                                        className="pl-11 pr-11 h-11 rounded-xl"
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

                            <div className="space-y-2">
                                <label className="text-sm font-semibold">Confirm Password</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
                                        <Lock className="h-5 w-5" />
                                    </div>
                                    <Input
                                        type={showPassword ? 'text' : 'password'}
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        placeholder="Confirm your password"
                                        className="pl-11 h-11 rounded-xl"
                                        required
                                    />
                                </div>
                            </div>

                            <Button 
                                type="submit" 
                                size="lg"
                                className="w-full text-base h-12 mt-2 rounded-xl shadow-md gap-2"
                                disabled={loading}
                            >
                                {loading ? (
                                    <span className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin"></span>
                                ) : (
                                    <>
                                        Create Account <ArrowRight className="h-5 w-5" />
                                    </>
                                )}
                            </Button>
                        </form>

                        <div className="mt-6 text-center border-t pt-5">
                            <p className="text-muted-foreground font-medium text-sm">
                                Already have an account?{' '}
                                <Link to="/login" className="text-primary hover:text-primary/80 transition-colors font-bold hover:underline decoration-2 underline-offset-4">Log in</Link>
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Features (Visible on Desktop) */}
                <div className="hidden md:flex flex-col gap-8 animate-in fade-in slide-in-from-right-12 duration-700">
                    <h2 className="text-4xl font-extrabold leading-tight tracking-tight">Join SmartAI <br/><span className="text-primary">Nutrition</span></h2>
                    <ul className="flex flex-col gap-5">
                        {[
                            { icon: <CheckCircle />, text: "100% Free to use" },
                            { icon: <Smartphone />, text: "Works on all devices" },
                            { icon: <ShieldCheck />, text: "Your data is secure" },
                            { icon: <Zap />, text: "Get started in seconds" }
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

export default Register;
