import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Trophy, Flame, Target, Star, Shield, Zap, Lock, Award, Globe, Code, Eye, Users } from "lucide-react";

export default function CareerQuest() {
    return (
        <div className="min-h-screen bg-background text-foreground pb-20 overflow-hidden relative">
            {/* Ambient Background */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />

            {/* Header */}
            <header className="relative z-10 py-12 px-6">
                <div className="max-w-5xl mx-auto text-center space-y-4">
                    <Badge className="bg-amber-500 text-white hover:bg-amber-600 shadow-lg shadow-amber-500/20 px-4 py-1.5 text-xs uppercase tracking-widest rounded-full">
                        Season 1: Genesis
                    </Badge>
                    <h1 className="text-5xl md:text-7xl font-display font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-br from-amber-400 via-orange-500 to-rose-600">
                        CAREER QUEST
                    </h1>
                    <p className="text-xl text-muted-foreground font-light max-w-xl mx-auto">
                        Gamify your professional growth. Earn XP, unlock badges, and climb the global leaderboard.
                    </p>
                </div>
            </header>

            <main className="relative z-10 max-w-6xl mx-auto px-6 space-y-12">

                {/* User Stats Bar */}
                <div className="glass-panel p-6 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-8 border-border/40 shadow-xl">
                    <div className="flex items-center gap-6 w-full md:w-auto">
                        <div className="relative">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-2xl shadow-lg transform rotate-3">
                                7
                            </div>
                            <Badge className="absolute -bottom-3 -right-3 bg-slate-900 border text-white">Lvl</Badge>
                        </div>
                        <div className="space-y-2 flex-1">
                            <div className="flex justify-between text-sm font-bold">
                                <span>Explorer</span>
                                <span className="text-muted-foreground">3,450 / 5,000 XP</span>
                            </div>
                            <Progress value={65} className="h-3 w-48 md:w-64 bg-muted" />
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <div className="flex items-center gap-3 px-5 py-3 bg-amber-50 dark:bg-amber-950/20 rounded-2xl border border-amber-100 dark:border-amber-900/50">
                            <Flame className="w-6 h-6 text-orange-500 fill-orange-500 animate-pulse" />
                            <div>
                                <div className="text-xl font-bold text-orange-600 dark:text-orange-400">12 Days</div>
                                <div className="text-[10px] uppercase font-bold text-orange-400/80 tracking-wider">Streak</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 px-5 py-3 bg-indigo-50 dark:bg-indigo-950/20 rounded-2xl border border-indigo-100 dark:border-indigo-900/50">
                            <Star className="w-6 h-6 text-indigo-500 fill-indigo-500" />
                            <div>
                                <div className="text-xl font-bold text-indigo-600 dark:text-indigo-400 text-right">850</div>
                                <div className="text-[10px] uppercase font-bold text-indigo-400/80 tracking-wider">Total XP</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quests Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                        <div>
                            <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
                                <Target className="w-6 h-6 text-primary" /> Active Quests
                            </h3>
                            <div className="space-y-4">
                                {[
                                    { title: "Resume Perfection", desc: "Score 90+ on readiness analysis", xp: 500, progress: 85, icon: Award, color: "text-purple-500" },
                                    { title: "Interview Master", desc: "Complete 3 mock interviews", xp: 300, progress: 33, icon: Zap, color: "text-amber-500" },
                                    { title: "Portfolio Builder", desc: "Publish your first portfolio", xp: 1000, progress: 0, icon: Globe, color: "text-emerald-500" },
                                ].map((quest, i) => (
                                    <motion.div
                                        key={i}
                                        whileHover={{ scale: 1.01 }}
                                        className="group bg-card/40 backdrop-blur border border-border/50 p-6 rounded-2xl flex items-center gap-6 hover:bg-card/60 transition-colors"
                                    >
                                        <div className={`p-4 rounded-full bg-muted/50 group-hover:bg-white group-hover:shadow-md transition-all ${quest.color}`}>
                                            <quest.icon className="w-6 h-6" />
                                        </div>
                                        <div className="flex-1 space-y-3">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h4 className="font-bold text-lg">{quest.title}</h4>
                                                    <p className="text-sm text-muted-foreground">{quest.desc}</p>
                                                </div>
                                                <Badge variant="secondary" className="font-mono text-xs">+{quest.xp} XP</Badge>
                                            </div>
                                            <div className="w-full bg-muted/50 h-2 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-primary transition-all duration-1000"
                                                    style={{ width: `${quest.progress}%` }}
                                                />
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
                                <Shield className="w-6 h-6 text-primary" /> Badges Collection
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {[
                                    { name: "Early Adopter", icon: Star, unlocked: true },
                                    { name: "Code Ninja", icon: Code, unlocked: true },
                                    { name: "Networker", icon: Users, unlocked: false },
                                    { name: "Visionary", icon: Eye, unlocked: false },
                                ].map((badge, i) => (
                                    <div key={i} className={`aspect-square rounded-2xl border-2 flex flex-col items-center justify-center gap-3 p-4 transition-all ${badge.unlocked ? 'border-primary/20 bg-primary/5' : 'border-dashed border-muted grayscale opacity-50'}`}>
                                        <div className={`p-3 rounded-full ${badge.unlocked ? 'bg-gradient-to-br from-amber-300 to-orange-400 text-white shadow-lg' : 'bg-muted'}`}>
                                            <badge.icon className="w-6 h-6" />
                                        </div>
                                        <span className="font-bold text-xs text-center">{badge.name}</span>
                                        {!badge.unlocked && <Lock className="w-3 h-3 text-muted-foreground" />}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar / Leaderboard */}
                    <div className="space-y-6">
                        <Card className="bg-gradient-to-b from-slate-900 to-slate-800 text-white border-none shadow-2xl">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-amber-400">
                                    <Trophy className="w-5 h-5" /> Global Top 5
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {[
                                    { name: "Alex Chen", xp: "12,450", rank: 1 },
                                    { name: "Sarah J.", xp: "11,200", rank: 2 },
                                    { name: "Mike Ross", xp: "10,980", rank: 3 },
                                    { name: "You", xp: "3,450", rank: 142, highlight: true },
                                ].map((user, i) => (
                                    <div key={i} className={`flex items-center gap-3 p-3 rounded-lg ${user.highlight ? 'bg-white/10 border border-white/20' : 'hover:bg-white/5'}`}>
                                        <div className={`w-6 h-6 flex items-center justify-center font-bold text-xs rounded-full ${user.rank <= 3 ? 'bg-amber-400 text-amber-900' : 'bg-slate-700 text-slate-400'}`}>
                                            {user.rank}
                                        </div>
                                        <div className="flex-1 font-medium text-sm">{user.name}</div>
                                        <div className="font-mono text-xs text-slate-400">{user.xp}</div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>
        </div>
    );
}
