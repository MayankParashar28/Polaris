import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Users, DollarSign, Briefcase, Search, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { JobRecommendations } from "@/components/JobRecommendations";

const mockTrendData = [
    { month: 'Jan', react: 4000, python: 2400, ai: 1800 },
    { month: 'Feb', react: 3000, python: 1398, ai: 2200 },
    { month: 'Mar', react: 2000, python: 9800, ai: 2800 },
    { month: 'Apr', react: 2780, python: 3908, ai: 3500 },
    { month: 'May', react: 1890, python: 4800, ai: 4200 },
    { month: 'Jun', react: 2390, python: 3800, ai: 5100 },
    { month: 'Jul', react: 3490, python: 4300, ai: 6000 },
];

export default function MarketPulse() {
    return (
        <div className="min-h-screen bg-background text-foreground pb-20">
            {/* Header */}
            <header className="py-12 px-6 border-b border-border/40 bg-muted/20">
                <div className="max-w-7xl mx-auto">
                    <Badge className="mb-4 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 uppercase tracking-widest text-[10px]">Real-time Insights</Badge>
                    <h1 className="text-4xl md:text-5xl font-display font-bold mb-4 tracking-tight">Market Pulse</h1>
                    <p className="text-xl text-muted-foreground font-light max-w-2xl">
                        Live analysis of the global job market. Track trending skills, salary velocity, and role demand.
                    </p>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 py-10 space-y-10">

                {/* Ticker Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {[
                        { label: "Open Roles", value: "142,593", change: "+12%", icon: Briefcase, color: "text-blue-500" },
                        { label: "Avg Salary", value: "$125k", change: "+5.3%", icon: DollarSign, color: "text-emerald-500" },
                        { label: "Active Seekers", value: "840k", change: "-2%", icon: Users, color: "text-amber-500", trend: "down" },
                        { label: "Top Skill", value: "React.js", change: "Hot", icon: TrendingUp, color: "text-rose-500" },
                    ].map((stat, i) => (
                        <Card key={i} className="bg-card/50 backdrop-blur border-border/50 shadow-sm hover:shadow-md transition-all">
                            <CardContent className="p-6 flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">{stat.label}</p>
                                    <h3 className="text-2xl font-bold tracking-tight">{stat.value}</h3>
                                </div>
                                <div className={`p-3 rounded-full bg-muted/50 ${stat.color}`}>
                                    <stat.icon className="w-5 h-5" />
                                </div>
                            </CardContent>
                            <div className="px-6 pb-4 flex items-center gap-2 text-xs font-medium">
                                {stat.trend === 'down' ? <ArrowDownRight className="w-3 h-3 text-rose-500" /> : <ArrowUpRight className="w-3 h-3 text-emerald-500" />}
                                <span className={stat.trend === 'down' ? "text-rose-500" : "text-emerald-500"}>{stat.change}</span>
                                <span className="text-muted-foreground">vs last month</span>
                            </div>
                        </Card>
                    ))}
                </div>

                {/* Main Chart */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <Card className="lg:col-span-2 border-border/50 bg-card/40 backdrop-blur-xl shadow-lg">
                        <CardHeader>
                            <CardTitle>Skill Demand Velocity</CardTitle>
                            <CardDescription>Growth trajectory of top technical skills over the last 6 months.</CardDescription>
                        </CardHeader>
                        <CardContent className="h-[400px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={mockTrendData}>
                                    <defs>
                                        <linearGradient id="colorAi" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="colorReact" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }}
                                        itemStyle={{ color: '#fff' }}
                                    />
                                    <Area type="monotone" dataKey="ai" stroke="#f43f5e" fillOpacity={1} fill="url(#colorAi)" strokeWidth={3} />
                                    <Area type="monotone" dataKey="react" stroke="#3b82f6" fillOpacity={1} fill="url(#colorReact)" strokeWidth={3} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    <div className="space-y-6">
                        <Card className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white border-none shadow-xl">
                            <CardContent className="p-8 space-y-6">
                                <TrendingUp className="w-10 h-10 opacity-80" />
                                <div>
                                    <h3 className="text-2xl font-bold mb-2">AI Engineering</h3>
                                    <p className="text-indigo-100 leading-relaxed">Demand for AI/ML engineers has spiked by <span className="font-bold text-white">240%</span> in Q4. It is currently the highest paying role tier.</p>
                                </div>
                                <Button variant="secondary" className="w-full bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur-sm">View Learning Path</Button>
                            </CardContent>
                        </Card>

                        <Card className="border-border/50">
                            <CardHeader>
                                <CardTitle className="text-base">Top Rising Roles</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {[
                                    { name: "Prompt Engineer", growth: "+145%" },
                                    { name: "Full Stack Dev", growth: "+45%" },
                                    { name: "Data Analyst", growth: "+32%" },
                                ].map((role, i) => (
                                    <div key={i} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                                        <span className="font-medium text-sm">{role.name}</span>
                                        <Badge variant="outline" className="text-emerald-500 border-emerald-500/20 bg-emerald-500/5">{role.growth}</Badge>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* All Jobs Section */}
                <div>
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold font-display">Browse All Opportunities</h2>
                        <Button variant="outline">Filter & Sort</Button>
                    </div>
                    <JobRecommendations role="all" />
                </div>
            </main>
        </div>
    );
}
