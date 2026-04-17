import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../ThemeProvider';
import { 
    Home, 
    PlusCircle, 
    PieChart, 
    User, 
    LogOut,
    Sun,
    Moon,
    Menu,
    X,
    Cpu,
    Utensils
} from 'lucide-react';
import logo from '../../assets/logo.jpeg';
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Navbar = () => {
    const { user, isAuthenticated, logout } = useAuth();
    const { theme, setTheme } = useTheme();
    const location = useLocation();
    const navigate = useNavigate();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/');
        setMobileMenuOpen(false);
    };

    const navLinks = [
        { path: '/dashboard', label: 'Dashboard', icon: Home },
        { path: '/log-meal', label: 'Log Meal', icon: PlusCircle },
        { path: '/meals', label: 'My Meals', icon: Utensils },
        { path: '/children', label: 'Students', icon: User },
        { path: '/school-analytics', label: 'School Analytics', icon: PieChart },
        { path: '/analytics', label: 'My Analytics', icon: PieChart },
        { path: '/ai-assistant', label: 'AI', icon: Cpu },
    ];

    const isActive = (path) => location.pathname === path;

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
            <div className="container mx-auto px-6 h-20 flex items-center justify-between">
                {/* Logo */}
                <Link to={isAuthenticated ? '/dashboard' : '/'} className="flex items-center gap-2 text-2xl font-display font-extrabold tracking-tight">
                    <img src={logo} alt="PoshanSetu Logo" className="h-9 w-9 rounded-lg object-cover" />
                    <span className="text-slate-900 dark:text-white">Poshan<span className="text-primary">Setu</span></span>
                </Link>

                {/* Desktop Navigation */}
                {isAuthenticated && (
                    <div className="hidden md:flex items-center gap-1">
                        {navLinks.map(({ path, label, icon: Icon }) => (
                            <Link
                                key={path}
                                to={path}
                                className={`flex items-center gap-2 px-3 py-2 rounded-md font-medium text-sm transition-colors ${
                                    isActive(path) 
                                        ? 'bg-secondary text-secondary-foreground' 
                                        : 'text-muted-foreground hover:bg-secondary/50 hover:text-secondary-foreground'
                                }`}
                            >
                                <Icon className="text-lg" />
                                <span className="hidden lg:block">{label}</span>
                            </Link>
                        ))}
                    </div>
                )}

                {/* Right Side */}
                <div className="flex items-center gap-2">
                    {/* Theme Toggle */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-9 w-9">
                          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                          <span className="sr-only">Toggle theme</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setTheme("light")}>
                          Light
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setTheme("dark")}>
                          Dark
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setTheme("system")}>
                          System
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>

                    {isAuthenticated ? (
                        <div className="hidden md:flex items-center gap-4">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="relative h-9 rounded-full px-2 flex items-center gap-2 hover:bg-secondary">
                                        <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                            <User className="h-4 w-4" />
                                        </div>
                                        <span className="text-sm font-medium">{user?.name?.split(' ')[0]}</span>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-56">
                                    <DropdownMenuLabel className="font-normal">
                                        <div className="flex flex-col space-y-1">
                                            <p className="text-sm font-medium leading-none">{user?.name}</p>
                                            <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                                        </div>
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => navigate('/profile')} className="cursor-pointer">
                                        <User className="mr-2 h-4 w-4" />
                                        <span>Profile</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-500 cursor-pointer">
                                        <LogOut className="mr-2 h-4 w-4" />
                                        <span>Log out</span>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    ) : (
                        <div className="hidden md:flex items-center gap-2">
                            <Button variant="ghost" asChild>
                                <Link to="/login">Login</Link>
                            </Button>
                            <Button asChild>
                                <Link to="/register">Get Started</Link>
                            </Button>
                        </div>
                    )}

                    {/* Mobile Menu Toggle */}
                    <Button 
                        variant="ghost" 
                        size="icon"
                        className="md:hidden"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                        {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                    </Button>
                </div>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <div className="md:hidden absolute top-20 left-0 right-0 bg-background border-b border-border shadow-lg p-4 flex flex-col gap-1">
                    {isAuthenticated ? (
                        <>
                            {navLinks.map(({ path, label, icon: Icon }) => (
                                <Link
                                    key={path}
                                    to={path}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-md font-medium text-sm ${
                                        isActive(path) 
                                            ? 'bg-secondary text-foreground' 
                                            : 'text-muted-foreground hover:bg-secondary/50'
                                    }`}
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    <Icon className="h-5 w-5" />
                                    <span>{label}</span>
                                </Link>
                            ))}
                            <div className="my-2 h-px bg-border"></div>
                            <Link
                                to="/profile"
                                className="flex items-center gap-3 px-4 py-3 rounded-md font-medium text-sm text-muted-foreground hover:bg-secondary/50"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                <User className="h-5 w-5" />
                                <span>Profile</span>
                            </Link>
                            <button 
                                className="flex items-center gap-3 px-4 py-3 rounded-md font-medium text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 w-full text-left" 
                                onClick={handleLogout}
                            >
                                <LogOut className="h-5 w-5" />
                                <span>Logout</span>
                            </button>
                        </>
                    ) : (
                        <div className="flex flex-col gap-2 p-2">
                            <Button variant="outline" className="w-full" asChild onClick={() => setMobileMenuOpen(false)}>
                                <Link to="/login">Login</Link>
                            </Button>
                            <Button className="w-full" asChild onClick={() => setMobileMenuOpen(false)}>
                                <Link to="/register">Get Started</Link>
                            </Button>
                        </div>
                    )}
                </div>
            )}
        </nav>
    );
};

export default Navbar;
