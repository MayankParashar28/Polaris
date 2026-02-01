import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { insertUserSchema, InsertUser } from "@shared/schema";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Redirect } from "wouter";
import { motion } from "framer-motion";
import { Sparkles, BrainCircuit, ShieldCheck, Zap } from "lucide-react";

export default function AuthPage() {
    const { user, loginMutation, registerMutation } = useAuth();
    const [, setLocation] = useLocation();

    if (user) {
        return <Redirect to="/" />;
    }

    return (
        <div className="min-h-screen relative overflow-hidden bg-background text-slate-900 selection:bg-primary/20">
            {/* Light Ambient Atmosphere */}
            <div className="fixed inset-0 z-0 pointer-events-none bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-50/50 via-background to-background" />

            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-10%] right-[-5%] w-[800px] h-[800px] bg-indigo-200/30 rounded-full blur-[120px] animate-float opacity-50" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-cyan-100/20 rounded-full blur-[100px] animate-float-delayed opacity-40" />
            </div>

            <div className="relative z-10 min-h-screen grid lg:grid-cols-2">
                <main className="flex items-center justify-center p-6 md:p-12 order-2 lg:order-1">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="w-full max-w-md"
                    >
                        <div className="glass-card rounded-[3rem] p-1 overflow-hidden relative group">
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10 opacity-50 group-hover:opacity-100 transition-opacity duration-700" />
                            <div className="bg-white/60 backdrop-blur-3xl rounded-[2.8rem] p-8 md:p-12 relative z-10 border border-white/80">
                                <CardHeader className="p-0 space-y-4 mb-10">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                                            <BrainCircuit className="w-6 h-6 text-primary" />
                                        </div>
                                        <h1 className="font-display font-bold text-xl tracking-tight text-slate-900">Polaris</h1>
                                    </div>
                                    <CardTitle className="text-3xl font-display font-bold tracking-tight text-slate-900 uppercase tracking-widest text-xs">
                                        Mission Control
                                    </CardTitle>
                                    <CardDescription className="text-slate-500 text-lg font-light leading-relaxed">
                                        Deconstruct your credentials to initiate career trajectory mapping.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <Tabs defaultValue="login" className="w-full">
                                        <TabsList className="grid w-full grid-cols-2 mb-10 bg-white border border-slate-100 p-1.5 rounded-2xl h-14 shadow-sm">
                                            <TabsTrigger value="login" className="rounded-[1rem] data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-lg transition-all font-bold uppercase tracking-widest text-[10px]">Access Link</TabsTrigger>
                                            <TabsTrigger value="register" className="rounded-[1rem] data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-lg transition-all font-bold uppercase tracking-widest text-[10px]">Create Identity</TabsTrigger>
                                        </TabsList>

                                        <TabsContent value="login">
                                            <LoginForm onSubmit={(data) => loginMutation.mutate(data)} isPending={loginMutation.isPending} />
                                        </TabsContent>

                                        <TabsContent value="register">
                                            <RegisterForm onSubmit={(data) => registerMutation.mutate(data)} isPending={registerMutation.isPending} />
                                        </TabsContent>
                                    </Tabs>
                                </CardContent>
                            </div>
                        </div>
                    </motion.div>
                </main>

                <aside className="hidden lg:flex flex-col justify-center p-12 order-1 lg:order-2 relative">
                    <div className="max-w-lg mx-auto space-y-12">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-[0.2em] border border-primary/20 shadow-sm"
                        >
                            <Sparkles className="w-4 h-4" />
                            <span>Neural Career Intelligence</span>
                        </motion.div>

                        <div className="space-y-6">
                            <h1 className="text-7xl font-display font-bold text-slate-900 tracking-tighter leading-[0.95]">
                                Design <br />
                                <span className="text-gradient">Potential</span>
                            </h1>
                            <p className="text-slate-500 text-xl leading-relaxed font-light">
                                Secure your position in the next generation of professional architecture.
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-8 pt-10 border-t border-slate-200">
                            {[
                                { icon: ShieldCheck, label: "ATS Matrix", desc: "Verified Resonance" },
                                { icon: Zap, label: "Pulse", desc: "Adaptive Strategy" }
                            ].map((feature, i) => (
                                <div key={i} className="space-y-4">
                                    <div className="w-12 h-12 rounded-[1.2rem] bg-white border border-slate-100 flex items-center justify-center text-primary shadow-sm">
                                        <feature.icon className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <div className="text-slate-900 font-bold text-lg tracking-tight">{feature.label}</div>
                                        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{feature.desc}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
}

function LoginForm({ onSubmit, isPending }: { onSubmit: (data: InsertUser) => void, isPending: boolean }) {
    const form = useForm<InsertUser>({
        resolver: zodResolver(insertUserSchema),
        defaultValues: {
            username: "",
            password: "",
        },
    });

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                        <FormItem className="space-y-2">
                            <FormLabel className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 ml-1">Identity ID</FormLabel>
                            <FormControl>
                                <Input placeholder="commander-01" {...field} className="h-14 bg-white border-slate-200 focus:border-primary/40 focus:ring-primary/10 transition-all text-slate-900 rounded-2xl shadow-sm" />
                            </FormControl>
                            <FormMessage className="text-rose-500 text-xs font-bold" />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                        <FormItem className="space-y-2">
                            <FormLabel className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 ml-1">Security Phrase</FormLabel>
                            <FormControl>
                                <Input type="password" {...field} className="h-14 bg-white border-slate-200 focus:border-primary/40 focus:ring-primary/10 transition-all text-slate-900 rounded-2xl shadow-sm" />
                            </FormControl>
                            <FormMessage className="text-rose-500 text-xs font-bold" />
                        </FormItem>
                    )}
                />
                <Button type="submit" className="w-full h-15 bg-primary hover:bg-primary/90 text-white font-bold rounded-2xl shadow-lg shadow-indigo-500/20 transition-all active:scale-[0.98] text-base" disabled={isPending}>
                    {isPending ? "Connecting Neural Link..." : "Initialize Link"}
                </Button>
            </form>
        </Form>
    );
}

function RegisterForm({ onSubmit, isPending }: { onSubmit: (data: InsertUser) => void, isPending: boolean }) {
    const form = useForm<InsertUser>({
        resolver: zodResolver(insertUserSchema),
        defaultValues: {
            username: "",
            password: "",
        },
    });

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                        <FormItem className="space-y-2">
                            <FormLabel className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 ml-1">New Assignment ID</FormLabel>
                            <FormControl>
                                <Input placeholder="agent-x" {...field} className="h-14 bg-white border-slate-200 focus:border-primary/40 focus:ring-primary/10 transition-all text-slate-900 rounded-2xl shadow-sm" />
                            </FormControl>
                            <FormMessage className="text-rose-500 text-xs font-bold" />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                        <FormItem className="space-y-2">
                            <FormLabel className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 ml-1">Security Phrase</FormLabel>
                            <FormControl>
                                <Input type="password" {...field} className="h-14 bg-white border-slate-200 focus:border-primary/40 focus:ring-primary/10 transition-all text-slate-900 rounded-2xl shadow-sm" />
                            </FormControl>
                            <FormMessage className="text-rose-500 text-xs font-bold" />
                        </FormItem>
                    )}
                />
                <Button type="submit" className="w-full h-15 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl shadow-lg shadow-slate-900/10 transition-all active:scale-[0.98] text-base" disabled={isPending}>
                    {isPending ? "Establishing Neural Path..." : "Create Identity"}
                </Button>
            </form>
        </Form>
    );
}
