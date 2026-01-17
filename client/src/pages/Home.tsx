import { useState } from "react";
import { useLocation } from "wouter";
import { useAnalyzeResume } from "@/hooks/use-resumes";
import { Button } from "@/components/ui/button";
import { ArrowRight, Upload, Sparkles, Briefcase, FileText } from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  const [_, setLocation] = useLocation();
  const [content, setContent] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const { mutate: analyze, isPending } = useAnalyzeResume();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !targetRole.trim()) return;

    analyze(
      { 
        content, 
        targetRole, 
        fileName: "pasted-resume.txt" 
      },
      {
        onSuccess: (data) => {
          setLocation(`/dashboard/${data.resumeId}`);
        }
      }
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 relative overflow-hidden">
      {/* Abstract Background Shapes */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-b from-primary/10 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 z-0 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-t from-accent/10 to-transparent rounded-full blur-3xl translate-y-1/3 -translate-x-1/4 z-0 pointer-events-none" />

      <main className="relative z-10 max-w-5xl mx-auto px-4 py-16 sm:px-6 lg:px-8 flex flex-col items-center justify-center min-h-screen">
        
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto space-y-6 animate-in">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/60 backdrop-blur-sm border border-primary/20 text-primary text-sm font-medium shadow-sm">
            <Sparkles className="w-4 h-4" />
            <span>AI-Powered Career Mentor</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-display font-extrabold tracking-tight text-foreground leading-tight">
            Level Up Your <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Career Journey</span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Upload your resume, target your dream role, and get a personalized roadmap to bridge the gap. No sign-up required to start.
          </p>
        </div>

        {/* Form Card */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="w-full max-w-2xl mt-12"
        >
          <div className="bg-white rounded-3xl shadow-2xl shadow-indigo-100 border border-indigo-50 p-6 md:p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              
              <div className="space-y-4">
                <label className="block text-sm font-semibold text-foreground/80 pl-1">Target Role</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
                    <Briefcase className="h-5 w-5" />
                  </div>
                  <input
                    type="text"
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                    placeholder="e.g. Senior Product Manager"
                    className="block w-full pl-11 pr-4 py-3.5 rounded-xl border-2 border-border bg-gray-50/50 text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200 font-medium"
                    required
                  />
                </div>
              </div>

              <div className="space-y-4">
                <label className="block text-sm font-semibold text-foreground/80 pl-1">Resume Content</label>
                <div className="relative group">
                  <div className="absolute top-3.5 left-3.5 text-muted-foreground group-focus-within:text-primary transition-colors pointer-events-none">
                    <FileText className="h-5 w-5" />
                  </div>
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Paste your resume text here..."
                    className="block w-full pl-11 pr-4 py-3.5 rounded-xl border-2 border-border bg-gray-50/50 text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200 min-h-[200px] font-mono text-sm resize-none"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isPending}
                size="lg"
                className="w-full text-lg h-14 rounded-xl shadow-xl shadow-primary/20 hover:shadow-primary/30"
              >
                {isPending ? (
                  <span className="flex items-center gap-2">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                    />
                    Analyzing Profile...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Analyze Resume <ArrowRight className="w-5 h-5" />
                  </span>
                )}
              </Button>
            </form>
          </div>
          
          <p className="mt-6 text-center text-sm text-muted-foreground">
            We value your privacy. Your data is processed securely and not shared.
          </p>
        </motion.div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20 w-full max-w-5xl animate-in delay-300">
          {[
            { 
              icon: <Sparkles className="w-6 h-6 text-amber-500" />,
              title: "Instant Analysis", 
              desc: "Get immediate feedback on your profile strengths and weaknesses." 
            },
            { 
              icon: <Upload className="w-6 h-6 text-blue-500" />,
              title: "Actionable Roadmap", 
              desc: "A step-by-step plan to bridge the gap to your dream role." 
            },
            { 
              icon: <Trophy className="w-6 h-6 text-emerald-500" />, // Using Trophy locally, imported below
              title: "Track Progress", 
              desc: "Mark items as done and watch your readiness score grow." 
            }
          ].map((item, i) => (
            <div key={i} className="flex flex-col items-center text-center p-6 bg-white/50 backdrop-blur-sm rounded-2xl border border-white/50 shadow-sm hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-4 border border-gray-100">
                {item.icon}
              </div>
              <h3 className="font-display font-bold text-lg mb-2">{item.title}</h3>
              <p className="text-muted-foreground text-sm">{item.desc}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

// Icon import needed for the features grid (Trophy was not imported in Home scope)
import { Trophy } from "lucide-react";
