import { Link, useLocation } from "wouter";
import { LayoutDashboard, Briefcase, Award, FolderKanban, Target, LogOut, Menu, X, Rocket, UserCircle, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { useAuth } from "@/hooks/use-auth";

const navItems = [
    { title: "Mission Control", url: "/dashboard/1", icon: LayoutDashboard },
    { title: "Optimized Resume", url: "/resume/latest", icon: FileText },
    { title: "Jobs", url: "/market", icon: Briefcase },
    { title: "Recommendations", url: "/recommendations", icon: Award },
];

export default function AppNavbar() {
    const [location] = useLocation();
    const { logoutMutation } = useAuth();
    const [isOpen, setIsOpen] = useState(false);

    // Helper to check active state
    const isActive = (path: string) => {
        if (path.startsWith('/dashboard') && location.startsWith('/dashboard')) return true;
        return location === path;
    };

    return (
        <nav className="sticky top-0 z-50 w-full border-b border-white/10 bg-white/5 backdrop-blur-xl supports-[backdrop-filter]:bg-white/5">
            <div className="flex h-16 items-center px-4 md:px-6 max-w-7xl mx-auto justify-between">

                {/* Logo */}
                <Link href="/dashboard/1">
                    <div className="flex items-center gap-2 font-bold text-xl tracking-tight text-slate-900 cursor-pointer">
                        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 border border-primary/20">
                            <Target className="w-5 h-5 text-primary" />
                        </div>
                        <span>Navigator</span>
                    </div>
                </Link>

                {/* Desktop Nav */}
                <div className="hidden md:flex items-center gap-1">
                    {navItems.map((item) => (
                        <Link key={item.url} href={item.url}>
                            <Button
                                variant={isActive(item.url) ? "secondary" : "ghost"}
                                size="sm"
                                className={`gap-2 rounded-full px-4 transition-all ${isActive(item.url) ? 'bg-primary/10 text-primary font-bold hover:bg-primary/20' : 'text-slate-500 hover:text-slate-900'}`}
                            >
                                <item.icon className="w-4 h-4" />
                                {item.title}
                            </Button>
                        </Link>
                    ))}
                </div>

                {/* User & Mobile Toggle */}
                <div className="flex items-center gap-4">
                    <div className="hidden md:flex items-center gap-3 pl-4">
                        <Button variant="ghost" size="sm" className="gap-2 text-slate-500 hover:text-rose-500 rounded-full" onClick={() => logoutMutation.mutate()}>
                            <LogOut className="w-4 h-4" /> <span className="text-xs font-bold uppercase tracking-widest">Logout</span>
                        </Button>
                    </div>

                    {/* Mobile Menu */}
                    <Sheet open={isOpen} onOpenChange={setIsOpen}>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon" className="md:hidden">
                                <Menu className="w-5 h-5" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                            <SheetHeader>
                                <SheetTitle>Navigation Menu</SheetTitle>
                                <SheetDescription className="hidden">
                                    Access main application sections.
                                </SheetDescription>
                            </SheetHeader>
                            <div className="flex flex-col gap-6 mt-10">
                                {navItems.map((item) => (
                                    <Link key={item.url} href={item.url} onClick={() => setIsOpen(false)}>
                                        <div className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${isActive(item.url) ? 'bg-primary/10 text-primary font-bold' : 'text-slate-600 hover:bg-slate-50'}`}>
                                            <item.icon className="w-5 h-5" />
                                            {item.title}
                                        </div>
                                    </Link>
                                ))}
                                <Button variant="outline" className="w-full mt-4 gap-2 text-rose-500 hover:text-rose-600 hover:bg-rose-50 border-rose-200" onClick={() => logoutMutation.mutate()}>
                                    <LogOut className="w-4 h-4" /> Sign Out
                                </Button>
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>
        </nav>
    );
}
