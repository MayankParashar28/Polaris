import { useState } from "react";
import { useRoute, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Layout, Globe, Share2, Plus, Trash2, ExternalLink, Code2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

export default function PortfolioBuilder() {
    const { toast } = useToast();
    const [, setLocation] = useLocation();
    const [activeTab, setActiveTab] = useState("content");

    // Mock state for now (will connect to DB later)
    const [portfolioData, setPortfolioData] = useState({
        domain: "mayank",
        bio: "Full Stack Engineer passionate about building scalable web applications and AI agents.",
        projects: [
            { id: 1, title: "Polaris", desc: "AI-powered career coaching platform", tech: ["React", "Node", "AI"] },
            { id: 2, title: "Lumina UI", desc: "Premium design system for modern web apps", tech: ["Tailwind", "Radix"] }
        ],
        theme: "minimal"
    });

    const handleSave = () => {
        toast({
            title: "Portfolio Saved",
            description: "Your changes have been published to your public link.",
        });
    };

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col">
            {/* Header */}
            <header className="sticky top-0 z-50 glass-panel border-b border-border/40 backdrop-blur-xl">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-primary/10 border border-primary/20">
                            <Layout className="w-5 h-5 text-primary" />
                        </div>
                        <h1 className="font-display font-bold text-lg tracking-tight">Portfolio Studio</h1>
                    </div>
                    <div className="flex gap-4">
                        <Button variant="outline" size="sm" className="gap-2 rounded-full">
                            <Globe className="w-4 h-4" /> Preview
                        </Button>
                        <Button size="sm" onClick={handleSave} className="gap-2 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20">
                            <Share2 className="w-4 h-4" /> Publish
                        </Button>
                    </div>
                </div>
            </header>

            <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-10 grid grid-cols-1 lg:grid-cols-12 gap-10">

                {/* Editor Panel */}
                <div className="lg:col-span-4 space-y-6">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="w-full grid grid-cols-2 bg-muted/50 p-1 rounded-xl">
                            <TabsTrigger value="content" className="rounded-lg">Content</TabsTrigger>
                            <TabsTrigger value="design" className="rounded-lg">Design</TabsTrigger>
                        </TabsList>

                        <TabsContent value="content" className="space-y-6 mt-6">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-muted-foreground">Subdomain</label>
                                    <div className="flex items-center gap-2">
                                        <Input
                                            value={portfolioData.domain}
                                            onChange={(e) => setPortfolioData({ ...portfolioData, domain: e.target.value })}
                                            className="font-mono bg-muted/20"
                                        />
                                        <span className="text-sm text-muted-foreground whitespace-nowrap">.polaris.app</span>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-muted-foreground">Bio</label>
                                    <Textarea
                                        value={portfolioData.bio}
                                        onChange={(e) => setPortfolioData({ ...portfolioData, bio: e.target.value })}
                                        className="h-32 bg-muted/20 resize-none"
                                        placeholder="Tell your story..."
                                    />
                                </div>

                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <label className="text-sm font-medium text-muted-foreground">Projects</label>
                                        <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full hover:bg-muted">
                                            <Plus className="w-3 h-3" />
                                        </Button>
                                    </div>

                                    {portfolioData.projects.map((p, i) => (
                                        <Card key={i} className="bg-muted/10 border-border/50">
                                            <CardContent className="p-4 space-y-2">
                                                <Input value={p.title} className="h-8 font-semibold bg-transparent border-none p-0 focus-visible:ring-0" />
                                                <Input value={p.desc} className="h-6 text-sm text-muted-foreground bg-transparent border-none p-0 focus-visible:ring-0" />
                                                <div className="flex flex-wrap gap-1 mt-2">
                                                    {p.tech.map(t => (
                                                        <Badge key={t} variant="secondary" className="text-[10px] h-5">{t}</Badge>
                                                    ))}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="design" className="mt-6">
                            <Card className="border-border/50 bg-muted/10">
                                <CardContent className="p-4 grid grid-cols-2 gap-4">
                                    {['Minimal', 'Glass', 'Brutalist', 'Terminal'].map(theme => (
                                        <button
                                            key={theme}
                                            onClick={() => setPortfolioData({ ...portfolioData, theme: theme.toLowerCase() })}
                                            className={`h-20 rounded-xl border border-border/50 flex items-center justify-center text-sm font-medium transition-all ${portfolioData.theme === theme.toLowerCase() ? 'ring-2 ring-primary bg-primary/5' : 'hover:bg-muted/20'}`}
                                        >
                                            {theme}
                                        </button>
                                    ))}
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>

                {/* Live Preview Panel */}
                <div className="lg:col-span-8">
                    <div className="sticky top-24 rounded-[2rem] border-[8px] border-slate-900 bg-slate-900 shadow-2xl overflow-hidden aspect-[16/10] relative group">
                        {/* Mock Browser UI */}
                        <div className="h-8 bg-slate-800 flex items-center px-4 gap-2">
                            <div className="flex gap-1.5">
                                <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                                <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                            </div>
                            <div className="flex-1 flex justify-center">
                                <div className="bg-slate-900/50 text-slate-500 text-[10px] px-3 py-0.5 rounded-full font-mono flex items-center gap-1">
                                    <Globe className="w-3 h-3" /> {portfolioData.domain}.polaris.app
                                </div>
                            </div>
                        </div>

                        {/* Preview Content (This would act as the iframe) */}
                        <div className="h-full bg-white dark:bg-slate-950 p-10 overflow-auto text-slate-900 dark:text-white">
                            <div className="max-w-2xl mx-auto space-y-12">
                                <div className="space-y-4">
                                    <h1 className="text-4xl md:text-6xl font-display font-bold tracking-tighter">Hi, I'm {portfolioData.domain}.</h1>
                                    <p className="text-xl text-muted-foreground font-light leading-relaxed max-w-lg">{portfolioData.bio}</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {portfolioData.projects.map((p) => (
                                        <motion.div
                                            key={p.id}
                                            layoutId={`project-${p.id}`}
                                            className="group relative rounded-3xl p-6 bg-slate-50 dark:bg-slate-900 block border border-transparent hover:border-slate-200 dark:hover:border-slate-800 transition-all hover:shadow-xl"
                                        >
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="p-3 bg-white dark:bg-slate-800 rounded-2xl shadow-sm group-hover:scale-110 transition-transform">
                                                    <Code2 className="w-6 h-6" />
                                                </div>
                                                <ExternalLink className="w-5 h-5 opacity-0 group-hover:opacity-50 transition-opacity" />
                                            </div>
                                            <h3 className="font-bold text-lg mb-2">{p.title}</h3>
                                            <p className="text-sm text-muted-foreground mb-4">{p.desc}</p>
                                            <div className="flex flex-wrap gap-2">
                                                {p.tech.map(t => (
                                                    <span key={t} className="text-xs font-medium px-2 py-1 rounded-md bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-800">{t}</span>
                                                ))}
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </main>
        </div>
    );
}
