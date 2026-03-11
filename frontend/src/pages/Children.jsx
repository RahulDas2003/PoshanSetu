import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, User, Activity, AlertTriangle, CheckCircle, TrendingUp } from 'lucide-react';
import { childAPI } from '../services/api';
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";

const Children = () => {
    const [children, setChildren] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    
    // Form state
    const [formData, setFormData] = useState({
        name: '',
        age: '',
        gender: 'male',
        schoolClass: '',
        height: '',
        weight: ''
    });

    useEffect(() => {
        fetchChildren();
    }, []);

    const fetchChildren = async () => {
        try {
            const response = await childAPI.getAll();
            setChildren(response.data.children || []);
        } catch (error) {
            console.error('Failed to fetch children:', error);
            toast.error('Could not load student data');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleAddChild = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                ...formData,
                age: Number(formData.age),
                height: Number(formData.height),
                weight: Number(formData.weight)
            };
            await childAPI.create(payload);
            toast.success('Student added successfully');
            setIsAddModalOpen(false);
            setFormData({ name: '', age: '', gender: 'male', schoolClass: '', height: '', weight: '' });
            fetchChildren();
        } catch (error) {
            toast.error(error.message || 'Failed to add student');
        }
    };

    const getRiskStyles = (riskLevel) => {
        switch (riskLevel) {
            case 'Healthy': return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
            case 'At Risk': return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
            case 'Malnourished': return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20';
            default: return 'bg-secondary text-secondary-foreground border-border';
        }
    };

    const getRiskIcon = (riskLevel) => {
        switch (riskLevel) {
            case 'Healthy': return <CheckCircle className="h-4 w-4" />;
            case 'At Risk': return <AlertTriangle className="h-4 w-4" />;
            case 'Malnourished': return <Activity className="h-4 w-4" />;
            default: return null;
        }
    };

    const filteredChildren = children.filter(child => 
        child.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        (child.schoolClass && child.schoolClass.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <div className="min-h-screen pt-28 pb-20 bg-background text-foreground">
            <div className="container mx-auto px-6 max-w-6xl space-y-8">
                
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight mb-1">Students</h1>
                        <p className="text-muted-foreground">Monitor the health and nutrition status of your students.</p>
                    </div>
                    
                    <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                        <DialogTrigger asChild>
                            <Button className="gap-2 shrink-0">
                                <Plus className="h-4 w-4" /> Add Student
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                                <DialogTitle>Add New Student</DialogTitle>
                                <DialogDescription>
                                    Enter the student's base measurements and details.
                                </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleAddChild} className="space-y-4 pt-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Full Name</label>
                                    <Input required name="name" value={formData.name} onChange={handleInputChange} placeholder="e.g. Rahul Kumar" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Age</label>
                                        <Input required type="number" name="age" value={formData.age} onChange={handleInputChange} placeholder="Years" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Class/Grade</label>
                                        <Input name="schoolClass" value={formData.schoolClass} onChange={handleInputChange} placeholder="e.g. 5A" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Gender</label>
                                    <select 
                                        name="gender" 
                                        value={formData.gender} 
                                        onChange={handleInputChange}
                                        className="w-full h-10 px-3 rounded-md border border-input bg-background"
                                    >
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Height (cm)</label>
                                        <Input required type="number" step="0.1" name="height" value={formData.height} onChange={handleInputChange} placeholder="e.g. 120" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Weight (kg)</label>
                                        <Input required type="number" step="0.1" name="weight" value={formData.weight} onChange={handleInputChange} placeholder="e.g. 22.5" />
                                    </div>
                                </div>
                                <DialogFooter className="pt-4">
                                    <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
                                    <Button type="submit">Save Student</Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Search Bar */}
                <div className="relative animate-in fade-in slide-in-from-bottom-5 duration-700">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input 
                        placeholder="Search students by name or class..." 
                        className="pl-10 h-12 text-base rounded-xl bg-card border-border shadow-sm"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                {/* Content Area */}
                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                    </div>
                ) : filteredChildren.length === 0 ? (
                    <div className="text-center py-20 border-2 border-dashed rounded-xl bg-muted/20">
                        <User className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                        <h3 className="text-lg font-semibold">No students found</h3>
                        <p className="text-muted-foreground mt-1">
                            {searchQuery ? "Try a different search term" : "Add some students to start monitoring their growth."}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                        {filteredChildren.map((child) => (
                            <Link to={`/children/${child._id}`} key={child._id}>
                                <Card className="hover:shadow-md hover:border-primary/50 transition-all cursor-pointer h-full border">
                                    <CardContent className="p-5 flex flex-col h-full gap-4">
                                        <div className="flex justify-between items-start">
                                            <div className="flex gap-3 items-center">
                                                <div className="h-10 w-10 bg-secondary rounded-full flex items-center justify-center font-bold text-lg text-muted-foreground shrink-0 uppercase">
                                                    {child.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-lg leading-tight line-clamp-1">{child.name}</h3>
                                                    <p className="text-sm text-muted-foreground mt-0.5">
                                                        Class {child.schoolClass || 'N/A'} • {child.age} yrs
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="mt-auto grid grid-cols-2 gap-3">
                                            <div className="bg-muted/30 p-2.5 rounded-lg border">
                                                <div className="text-xs text-muted-foreground font-medium mb-1">Latest BMI</div>
                                                <div className="font-semibold text-sm">
                                                    {child.measurements?.[0]?.bmi || 'N/A'}
                                                </div>
                                            </div>
                                            <div className={`p-2.5 rounded-lg border flex flex-col justify-center gap-1 ${getRiskStyles(child.riskLevel)}`}>
                                                <div className="text-[10px] uppercase font-bold tracking-wider opacity-80">Risk Status</div>
                                                <div className="font-semibold text-xs flex items-center gap-1.5">
                                                    {getRiskIcon(child.riskLevel)} {child.riskLevel}
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Children;
