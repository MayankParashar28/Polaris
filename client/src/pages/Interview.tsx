import { useEffect, useRef, useState } from "react";
import { useRoute, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, User, Bot, ArrowLeft, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function InterviewPage() {
    const [, params] = useRoute("/interview/:id");
    const [, setLocation] = useLocation();
    const id = Number(params?.id);
    const { toast } = useToast();
    const scrollRef = useRef<HTMLDivElement>(null);
    const [inputValue, setInputValue] = useState("");

    // Fetch Interview Session
    const { data: interview, isLoading } = useQuery({
        queryKey: ["interview", id],
        queryFn: async () => {
            const res = await fetch(api.interviews.get.path.replace(":id", String(id)));
            if (!res.ok) throw new Error("Failed to load interview");
            return res.json();
        },
        enabled: !!id,
        refetchInterval: 5000, // Poll for updates occasionally
    });

    // Fetch Resume details for context (if interview loads)
    const { data: resumeData } = useQuery({
        queryKey: ["resume-analysis", interview?.resumeId],
        queryFn: async () => {
            const res = await fetch(api.resumes.getAnalysis.path.replace(":id", String(interview?.resumeId)));
            if (!res.ok) return null;
            return res.json();
        },
        enabled: !!interview?.resumeId,
    });

    // Send Message Mutation
    const sendMessage = useMutation({
        mutationFn: async (content: string) => {
            const res = await fetch(api.interviews.addMessage.path.replace(":id", String(id)), {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content }),
            });
            if (!res.ok) throw new Error("Failed to send message");
            return res.json();
        },
        onSuccess: () => {
            setInputValue("");
            queryClient.invalidateQueries({ queryKey: ["interview", id] });
        },
        onError: () => {
            toast({
                title: "Error",
                description: "Failed to send message. Please try again.",
                variant: "destructive",
            });
        },
    });

    // Auto-scroll to bottom of chat
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [interview?.messages]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!interview) {
        return <div className="p-8 text-center">Interview not found.</div>;
    }

    const handleSend = () => {
        if (!inputValue.trim()) return;
        sendMessage.mutate(inputValue);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="flex h-screen bg-background">
            {/* Sidebar / Context Panel */}
            <div className="hidden md:flex flex-col w-80 border-r p-6 bg-muted/20">
                <Button
                    variant="outline"
                    className="mb-6 self-start gap-2"
                    onClick={() => setLocation(`/dashboard/${interview.resumeId}`)} // Return to dashboard
                >
                    <ArrowLeft className="h-4 w-4" />
                    Exit Interview
                </Button>

                <Card className="bg-background shadow-sm border-none">
                    <CardHeader>
                        <CardTitle className="text-lg">Interview Context</CardTitle>
                        <CardDescription>{resumeData?.resume?.targetRole || "Loading role..."}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <h4 className="font-semibold text-sm mb-2">Focus Areas</h4>
                            <div className="flex flex-wrap gap-2">
                                {resumeData?.strengths?.slice(0, 3).map((s: string, i: number) => (
                                    <span key={i} className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full dark:bg-green-900 dark:text-green-300">
                                        {s}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {resumeData?.gaps && (
                            <div>
                                <h4 className="font-semibold text-sm mb-2 mt-4">Topics to Improve</h4>
                                <ul className="text-sm list-disc list-inside text-muted-foreground">
                                    {resumeData?.gaps?.slice(0, 3).map((g: string, i: number) => (
                                        <li key={i}>{g}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col h-full relative">
                <div className="p-4 border-b flex items-center justify-between md:hidden">
                    <Button variant="ghost" onClick={() => setLocation(`/dashboard/${interview.resumeId}`)}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <span className="font-bold">Mock Interview</span>
                    <div className="w-8"></div>
                </div>

                <ScrollArea className="flex-1 p-6">
                    <div className="max-w-3xl mx-auto space-y-6 pb-4">
                        {interview.messages.map((msg: any) => (
                            <div
                                key={msg.id}
                                className={`flex gap-4 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                            >
                                <Avatar className="h-8 w-8 mt-1">
                                    <AvatarFallback className={msg.role === "ai" ? "bg-primary text-primary-foreground" : "bg-muted"}>
                                        {msg.role === "ai" ? <Bot className="h-5 w-5" /> : <User className="h-5 w-5" />}
                                    </AvatarFallback>
                                </Avatar>

                                <div
                                    className={`relative p-4 rounded-2xl max-w-[80%] ${msg.role === "user"
                                            ? "bg-primary text-primary-foreground rounded-tr-sm"
                                            : "bg-muted rounded-tl-sm border"
                                        }`}
                                >
                                    <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                                </div>
                            </div>
                        ))}

                        {sendMessage.isPending && (
                            <div className="flex gap-4 flex-row">
                                <Avatar className="h-8 w-8 mt-1">
                                    <AvatarFallback className="bg-primary text-primary-foreground">
                                        <Bot className="h-5 w-5" />
                                    </AvatarFallback>
                                </Avatar>
                                <div className="bg-muted p-4 rounded-2xl rounded-tl-sm border flex items-center gap-2">
                                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                                    <span className="text-xs text-muted-foreground">Thinking...</span>
                                </div>
                            </div>
                        )}

                        <div ref={scrollRef} />
                    </div>
                </ScrollArea>

                {/* Input Area */}
                <div className="p-4 bg-background border-t">
                    <div className="max-w-3xl mx-auto flex gap-2">
                        <Input
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Type your answer here..."
                            className="flex-1 h-12 shadow-sm"
                            disabled={sendMessage.isPending}
                        />
                        <Button
                            onClick={handleSend}
                            className="h-12 w-12 rounded-full shadow-sm"
                            disabled={!inputValue.trim() || sendMessage.isPending}
                        >
                            <Send className="h-5 w-5" />
                        </Button>
                    </div>
                    <p className="text-center text-xs text-muted-foreground mt-2">
                        AI can make mistakes. Treat this as practice.
                    </p>
                </div>
            </div>
        </div>
    );
}
