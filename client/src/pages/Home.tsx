
import { useState } from "react";
import { useLocation } from "wouter";
import { useAnalyzeResume } from "@/hooks/use-resumes";
import { useAuth } from "@/hooks/use-auth";
import { useMutation } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { Button } from "@/components/ui/button";
import { ArrowRight, Upload, Sparkles, Briefcase, Trophy, LogOut, Loader2, Check, ChevronsUpDown, Cpu, BrainCircuit } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import * as pdfjsLib from "pdfjs-dist";
import { useToast } from "@/hooks/use-toast";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

// Set worker source
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

const ROLES = [
  { label: "MERN Stack Developer", value: "MERN Stack Developer" },
  { label: "Full Stack Engineer", value: "Full Stack Engineer" },
  { label: "Frontend Developer (React)", value: "Frontend Developer" },
  { label: "Backend Developer (Node.js)", value: "Backend Developer" },
  { label: "AI/ML Engineer", value: "AI/ML Engineer" },
  { label: "Data Scientist", value: "Data Scientist" },
  { label: "DevOps Engineer", value: "DevOps Engineer" },
  { label: "Product Manager", value: "Product Manager" },
  { label: "Java Developer", value: "Java Developer" },
  { label: "Python Developer", value: "Python Developer" },
];

export default function Home() {
  const [_, setLocation] = useLocation();
  const { user, logoutMutation } = useAuth();
  const { toast } = useToast();

  const [content, setContent] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [open, setOpen] = useState(false); // Popover state
  const [isReadingFile, setIsReadingFile] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState("");
  const { mutate: analyze, isPending } = useAnalyzeResume();



  // Scan Mutation
  const scanMutation = useMutation({
    mutationFn: async (text: string) => {
      const res = await fetch(api.resumes.scan.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: text }),
      });
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Scan failed: ${res.status} ${res.statusText} - ${errorText}`);
      }
      return res.json();
    },
    onSuccess: (data: any) => {
      if (data.suggestedRole) {
        setTargetRole(data.suggestedRole);
        toast({
          className: "p-0 bg-transparent border-none shadow-none",
          description: (
            <div className="glass-panel rounded-full px-6 py-3 flex items-center gap-4 shadow-xl border-white/40 min-w-[320px]">
              <div className="w-9 h-9 flex items-center justify-center rounded-xl bg-primary/10 border border-primary/20 shrink-0">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <div className="font-display font-bold text-sm text-slate-900 tracking-tight">Intelligent Identity Detected</div>
                <div className="text-xs text-slate-500 font-medium truncate">
                  {data.candidateName || "Candidate"} • {data.suggestedRole}
                </div>
              </div>
            </div>
          ),
        });
      }
    },
    onError: (error) => {
      console.error("Scan Mutation Failed:", error);
      toast({
        variant: "destructive",
        title: "Scan Failed",
        description: `Could not analyze resume: ${error.message}`
      });
    }
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setSelectedFile(file);
    setIsReadingFile(true);
    console.log("File selected:", file.name, file.type, file.size);

    if (file.size === 0) {
      toast({ variant: "destructive", title: "Empty File", description: "The selected file is empty." });
      setIsReadingFile(false);
      return;
    }

    try {
      console.log("Starting file reading...");
      let text = "";
      if (file.type === "application/pdf") {
        console.log("File is PDF. Loading PDFJS...");
        const arrayBuffer = await file.arrayBuffer();
        console.log("ArrayBuffer loaded. Size:", arrayBuffer.byteLength);

        try {
          const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
          console.log("PDF Document loaded. Pages:", pdf.numPages);

          for (let i = 1; i <= pdf.numPages; i++) {
            console.log(`Parsing page ${i}...`);
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items.map((item: any) => item.str).join(" ");
            text += pageText + "\n";
          }
          console.log("PDF Parsing complete. Text length:", text.length);
        } catch (pdfErr) {
          console.error("PDF Parsing Inner Error:", pdfErr);
          throw pdfErr;
        }
      } else {
        text = await file.text();
      }

      // Handle case where text extraction failed but file exists
      if (text.length < 10) {
        console.warn("Text extraction returned empty/short string. Proceeding with file upload for Multimodal Analysis.");
        text = ""; // Ensure it's not a garbage 1-char string
      }

      setContent(text);

      // Auto-Scan Logic
      // Only scan if we have text. If not, user enters role manually.
      if (text.length > 50) {
        console.log("Triggering Scan Mutation...");
        scanMutation.mutate(text);
      } else {
        console.log("Skipping auto-scan (content too short). User must enter role.");
        // We do typically require content to be present for the submit button to work?
        // Let's check handleSubmit.
        // It checks: if (!content.trim() || !targetRole.trim()) return;
        // We need to bypass that if a file is selected.
      }

    } catch (err) {
      console.error("Error reading file:", err);
      toast({ variant: "destructive", title: "File Error", description: "Could not read the file. Please try again." });
    } finally {
      setIsReadingFile(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Allow submit if (content OR file) AND targetRole
    if ((!content.trim() && !selectedFile) || !targetRole.trim()) {
      toast({ title: "Incomplete", description: "Please select a role and upload a resume.", variant: "destructive" });
      return;
    }

    const formData = new FormData();
    formData.append("content", content || "Attached File Analysis"); // Fallback text
    formData.append("targetRole", targetRole);
    formData.append("fileName", selectedFile?.name || fileName || "pasted-resume.txt");
    if (selectedFile) {
      formData.append("file", selectedFile);
    }

    analyze(formData, {
      onSuccess: (data) => {
        setLocation(`/dashboard/${data.resumeId}`);
      }
    });
  };


  return (
    <div className="min-h-screen relative overflow-hidden text-slate-900 selection:bg-primary/20">

      {/* Light Ambient Atmosphere */}
      <div className="fixed inset-0 z-0 pointer-events-none bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-50/50 via-background to-background" />

      {/* Dynamic Light Orbs */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[-10%] right-[-5%] w-[800px] h-[800px] bg-indigo-200/40 rounded-full blur-[120px]"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-cyan-100/30 rounded-full blur-[100px]"
        />
      </div>

      {/* Floating Glass Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 w-full flex justify-center pt-6 px-6">
        <div className="glass-panel rounded-full px-8 py-3 flex items-center gap-8 shadow-xl border-white/40">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 flex items-center justify-center rounded-xl bg-primary/10 border border-primary/20">
              <BrainCircuit className="w-5 h-5 text-primary" />
            </div>
            <span className="font-display font-bold text-xl tracking-tight text-slate-900">Polaris</span>
          </div>

          <div className="h-4 w-[1px] bg-slate-200 hidden sm:block" />

          {user && (
            <Button variant="ghost" className="text-slate-600 hover:text-primary hover:bg-primary/5 rounded-full px-4 h-8 text-sm" onClick={() => logoutMutation.mutate()}>
              <LogOut className="w-3 h-3 mr-2" /> Logout
            </Button>
          )}
        </div>
      </nav>

      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-24 md:pt-32 pb-12 md:pb-20 flex flex-col lg:flex-row items-center justify-between gap-10 lg:gap-16 min-h-screen">

        {/* Hero Text */}
        <div className="flex-1 space-y-10 lg:max-w-xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest border border-primary/20 shadow-sm"
          >
            <Sparkles className="w-3 h-3" />
            <span>AI-Architected Future</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-8xl lg:text-8xl font-display font-bold leading-[0.95] tracking-tight text-slate-900"
          >
            Design Your <br />
            <span className="text-gradient">Dream Career</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-slate-600 max-w-lg leading-relaxed font-light"
          >
            Unleash the power of neural networks to deconstruct your resume, identify skill gaps, and architect the perfect trajectory for your professional evolution.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex gap-10 pt-6 border-t border-slate-200"
          >
            {[
              { icon: Trophy, label: "98% Match Rate", color: "text-amber-500" },
              { icon: Cpu, label: "Neural Analysis", color: "text-cyan-500" }
            ].map((stat, i) => (
              <div key={i} className="flex items-center gap-4 group cursor-help">
                <div className={`p-3 rounded-2xl bg-white border border-slate-100 shadow-sm group-hover:shadow-md transition-all ${stat.color}`}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xl font-bold text-slate-900">{stat.label.split(" ")[0]}</div>
                  <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">{stat.label.split(" ").slice(1).join(" ")}</div>
                </div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Futuristic Glass Scanner Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6, type: "spring" }}
          className="w-full max-w-md relative"
        >
          <div className="glass-card rounded-[2.5rem] p-1 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10 opacity-50 group-hover:opacity-100 transition-opacity duration-700" />

            <div className="bg-white/60 backdrop-blur-3xl rounded-[2.3rem] p-6 md:p-10 relative z-10 border border-white/80">
              <form onSubmit={handleSubmit} className="space-y-8">

                <div className="space-y-3">
                  <div className="flex justify-between items-end">
                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 ml-1">Target Mission</label>
                    <span className="text-[10px] text-slate-300 font-mono font-bold">ALPHA-01</span>
                  </div>

                  <div className="relative group/input">
                    <Popover open={open} onOpenChange={setOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={open}
                          className="relative w-full justify-between h-14 bg-white border-slate-200 hover:border-primary/40 hover:bg-slate-50 text-slate-900 text-left font-normal text-base rounded-2xl transition-all shadow-sm"
                        >
                          {targetRole
                            ? <span className="font-semibold text-slate-900">{targetRole}</span>
                            : <span className="text-slate-400">Select target role...</span>}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-40" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 bg-white border-slate-200 rounded-2xl shadow-2xl overflow-hidden">
                        <Command>
                          <CommandInput placeholder="Search role database..." className="h-12 border-none focus:ring-0 text-slate-900" />
                          <CommandEmpty>No roles found.</CommandEmpty>
                          <CommandGroup className="max-h-60 overflow-y-auto">
                            {ROLES.map((role) => (
                              <CommandItem
                                key={role.value}
                                value={role.value}
                                onSelect={(currentValue) => {
                                  setTargetRole(currentValue === targetRole ? "" : currentValue);
                                  setOpen(false);
                                }}
                                className="aria-selected:bg-primary/5 aria-selected:text-primary cursor-pointer py-3"
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4 text-primary",
                                    targetRole === role.value ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                {role.label}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-end">
                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 ml-1">Professional Artifact</label>
                    <span className="text-[10px] text-slate-300 font-mono font-bold">DECRYPT-02</span>
                  </div>

                  <label
                    htmlFor="resume-upload"
                    className={`relative w-full h-44 rounded-2xl border-2 border-dashed transition-all duration-300 cursor-pointer flex flex-col items-center justify-center gap-3 group/upload overflow-hidden shadow-sm
                      ${content ? 'bg-primary/5 border-primary/30' : 'bg-slate-50/50 border-slate-200 hover:border-primary/40 hover:bg-slate-50'}`}
                  >
                    <AnimatePresence mode="wait">
                      {isReadingFile ? (
                        <motion.div
                          key="loading"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="flex flex-col items-center gap-3 z-10"
                        >
                          <Loader2 className="w-10 h-10 text-primary animate-spin" />
                          <span className="text-xs font-bold text-primary tracking-widest uppercase">Analyzing PDF...</span>
                        </motion.div>
                      ) : content ? (
                        <motion.div
                          key="success"
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="flex flex-col items-center gap-4 z-10 w-full px-6"
                        >
                          <div className="w-12 h-12 rounded-full bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-600">
                            <Check className="w-6 h-6" />
                          </div>
                          <div className="text-center">
                            <div className="text-sm text-slate-900 font-bold truncate max-w-[200px]">{fileName}</div>
                            <div className="text-[10px] text-emerald-600 font-bold uppercase mt-1">Ready for transition</div>
                          </div>
                        </motion.div>
                      ) : (
                        <motion.div
                          key="idle"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="flex flex-col items-center gap-3 text-slate-400 group-hover/upload:text-primary transition-colors z-10"
                        >
                          <div className="p-3 rounded-2xl bg-white border border-slate-100 shadow-sm group-hover:scale-110 group-hover:border-primary/20 transition-all duration-500">
                            <Upload className="w-6 h-6" />
                          </div>
                          <span className="text-xs font-bold uppercase tracking-widest">Drop Resume Artifact</span>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <input
                      id="resume-upload"
                      type="file"
                      accept=".pdf,.txt,.md"
                      className="hidden"
                      onChange={handleFileUpload}
                      disabled={isReadingFile}
                    />
                  </label>
                </div>

                <Button
                  type="submit"
                  disabled={isPending || isReadingFile || scanMutation.isPending}
                  className="w-full h-15 text-base font-bold bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 transition-all active:scale-[0.98] rounded-2xl relative overflow-hidden group/btn"
                >
                  {isPending ? (
                    <span className="flex items-center gap-2 relative z-10">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Initializing...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2 relative z-10">
                      Initiate Analysis <ArrowRight className="w-5 h-5" />
                    </span>
                  )}
                </Button>

              </form>
            </div>
          </div>
        </motion.div>

      </main>
    </div>
  );
}

