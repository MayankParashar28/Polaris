import React from "react";
import { useParams, Link, useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { useResumeAnalysis } from "@/hooks/use-resumes";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ResumePreview } from "@/components/ResumePreview";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  ArrowLeft,
  Download,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Target,
  Loader2,
  FileText,
  TrendingUp,
  Briefcase
} from "lucide-react";
// @ts-ignore
import html2pdf from "html2pdf.js";
import { motion } from "framer-motion";
import { PrintableResume } from "@/components/PrintableResume";
import { JobRecommendations } from "@/components/JobRecommendations";
import { Gauge } from "@/components/Gauge";
import { SkillsRadarChart } from "@/components/ui/radar-chart";

export default function Dashboard() {
  const params = useParams();
  const id = parseInt(params.id || "0");
  const { data: analysis, isLoading, error } = useResumeAnalysis(id);
  const [isExporting, setIsExporting] = React.useState(false);
  const [, setLocation] = useLocation();

  const handleExport = () => {
    if (!analysis?.rewrittenContent) {
      alert("No rewritten resume available to export.");
      return;
    }
    setIsExporting(true);
    const element = document.getElementById("printable-resume-content");
    if (!element) return;
    // @ts-ignore
    html2pdf().set({
      margin: 10,
      filename: `optimized-resume-${analysis.resume.targetRole.replace(/\s+/g, '-').toLowerCase()}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    }).from(element).save().then(() => setIsExporting(false));
  };

  if (isLoading) return <DashboardLoading />;
  if (error || !analysis) return <DashboardError />;

  // Prepare data for Radar Chart
  // We'll map strengths to high scores (80-100) and gaps to lower scores (40-60) for visualization
  // In a real app, these values would come from the AI analysis directly
  const radarData = [
    ...analysis.strengths.slice(0, 3).map((s: string) => ({ subject: s.split(' ').slice(0, 2).join(' '), A: 90, fullMark: 100 })),
    ...analysis.gaps.slice(0, 3).map((g: string) => ({ subject: g.split(' ').slice(0, 2).join(' '), A: 50, fullMark: 100 })),
  ];

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      {/* Hidden PDF Render */}
      <div className="absolute top-0 left-0 w-0 h-0 overflow-hidden">
        <PrintableResume content={analysis.rewrittenContent || ""} targetId="printable-resume-content" />
      </div>

      <main className="max-w-6xl mx-auto px-4 md:px-6 py-4 md:py-8 space-y-6 md:space-y-8">

        {/* Journey Tracker Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row justify-between gap-8">
            <div>
              <h1 className="text-2xl font-bold font-display text-slate-900 mb-2">Job Search Journey</h1>
              <p className="text-slate-500 text-sm max-w-md">Your AI-guided path to your next role. Complete these steps to maximize your success.</p>

              <div className="flex items-center gap-2 mt-6">
                <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-100 gap-1.5 py-1.5 px-3">
                  <Target className="w-3.5 h-3.5" />
                  Target: {analysis.resume.targetRole}
                </Badge>
              </div>
            </div>

            <div className="flex-1 max-w-2xl flex flex-col justify-end">
              <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 px-2">
                <span className="text-indigo-600">Analyze</span>
                <span className="text-indigo-600">Optimize</span>
                <span>Apply</span>
                <span>Interview</span>
              </div>
              <div className="h-3 bg-slate-100 rounded-full overflow-hidden relative">
                {/* Animated Progress Bar */}
                <motion.div
                  initial={{ width: "0%" }}
                  animate={{ width: "45%" }}
                  transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.5)]"
                />

                {/* Steps Indicators */}
                <div className="absolute top-0 left-0 w-full h-full flex justify-between px-[12%]">
                  <div className="w-0.5 h-full bg-white/50" />
                  <div className="w-0.5 h-full bg-white/50" />
                  <div className="w-0.5 h-full bg-white/50" />
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Quick Actions & Header Controls */}
        <div className="flex justify-end gap-3">
          <Button variant="outline" className="gap-2 bg-white hover:bg-slate-50" onClick={() => setLocation('/')}>
            <ArrowLeft className="w-4 h-4" /> Upload New Resume
          </Button>
          <Button onClick={handleExport} disabled={isExporting} className="gap-2 bg-[#1a1b41] hover:bg-[#2d2e5f] text-white shadow-lg shadow-indigo-900/10">
            {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            Export Optimized PDF
          </Button>
        </div>

        {/* Core Metrics Grid - UPGRADED WITH GAUGES */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Overall Score - CIRCULAR GAUGE */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="h-full border-none shadow-sm bg-white overflow-hidden relative group hover:shadow-md transition-all hover:scale-[1.02] duration-300">
              <CardContent className="p-6 flex flex-col items-center justify-center pt-8">
                <Gauge value={analysis.readinessScore} size="lg" label="Match Score" color="hsla(243, 75%, 59%, 1)" />
                <p className="text-xs text-slate-500 mt-6 font-medium flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> Top 10% of candidates
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* ATS Score - CIRCULAR GAUGE */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="h-full border-none shadow-sm bg-white overflow-hidden relative group hover:shadow-md transition-all hover:scale-[1.02] duration-300">
              <CardContent className="p-6 flex flex-col items-center justify-center pt-8">
                <Gauge value={analysis.atsScore} size="lg" label="ATS Compatible" color="hsla(158, 64%, 52%, 1)" />
                <p className="text-xs text-slate-500 mt-6 font-medium flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> System Readable
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* AI Summary Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="h-full border-none shadow-sm bg-gradient-to-br from-[#1a1b41] to-[#2d2e5f] text-white md:col-span-1 relative overflow-hidden group hover:shadow-xl transition-all">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/30 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
              <CardContent className="p-8 relative z-10 flex flex-col h-full justify-between">
                <div>
                  <p className="text-indigo-200 font-bold text-xs uppercase tracking-widest mb-4 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-indigo-400" /> AI Coach Insight
                  </p>
                  <p className="text-white/90 text-sm leading-relaxed font-light italic">
                    "{analysis.feedback}"
                  </p>
                </div>
                <Button variant="ghost" className="mt-6 text-white hover:bg-white/10 hover:text-white p-0 h-auto font-bold text-xs self-start">
                  View Full Report <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Deep Dive Tabs */}
        <Tabs defaultValue="insights" className="w-full">
          <TabsList className="bg-white border p-1 h-auto rounded-xl w-full md:w-fit mb-6 overflow-x-auto flex flex-nowrap md:flex-wrap justify-start md:justify-center no-scrollbar">
            <TabsTrigger value="insights" className="rounded-lg h-9 px-4 md:px-6 text-sm font-medium whitespace-nowrap flex-shrink-0">Analysis Breakdown</TabsTrigger>
            <TabsTrigger value="roadmap" className="rounded-lg h-9 px-4 md:px-6 text-sm font-medium whitespace-nowrap flex-shrink-0">Action Plan</TabsTrigger>
            <TabsTrigger value="jobs" className="rounded-lg h-9 px-4 md:px-6 text-sm font-medium whitespace-nowrap flex-shrink-0">Recommended Jobs</TabsTrigger>
          </TabsList>

          <TabsContent value="insights" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* RADAR CHART - NEW */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="md:col-span-1"
              >
                <SkillsRadarChart data={radarData} className="h-full" />
              </motion.div>

              <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Strengths */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <Card className="h-full border-none shadow-sm bg-white hover:shadow-md transition-all">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex items-center gap-2 text-emerald-600">
                        <CheckCircle2 className="w-5 h-5" /> Strong Points
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-3">
                        {analysis.strengths.map((item: string, i: number) => (
                          <li key={i} className="flex gap-3 text-sm text-slate-600 items-start">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Weaknesses */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <Card className="h-full border-none shadow-sm bg-white hover:shadow-md transition-all">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex items-center gap-2 text-rose-600">
                        <AlertCircle className="w-5 h-5" /> Areas for Improvement
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-3">
                        {analysis.gaps.map((item: string, i: number) => (
                          <li key={i} className="flex gap-3 text-sm text-slate-600 items-start">
                            <div className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="roadmap">
            <Card className="border-none shadow-sm bg-white">
              <CardHeader>
                <CardTitle className="text-lg">Step-by-Step Improvement Plan</CardTitle>
                <CardDescription>Follow these steps to increase your hireability score.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-0">
                {analysis.roadmap.map((item: any, i: number) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * i }}
                    className="flex gap-4 py-4 border-b last:border-0 border-slate-100 group hover:bg-slate-50/50 px-2 rounded-lg transition-colors"
                  >
                    <div className="flex flex-col items-center gap-1">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${item.status === 'completed' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200'}`}>
                        {i + 1}
                      </div>
                      {i !== analysis.roadmap.length - 1 && <div className="w-px h-full bg-slate-100" />}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900">{item.title}</h4>
                      <p className="text-sm text-slate-500">{item.description}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 border border-slate-200 px-2 py-0.5 rounded-full">{item.category}</span>
                        <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${item.status === 'completed' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>{item.status}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="jobs">
            <JobRecommendations role={analysis.resume.targetRole} />
          </TabsContent>


        </Tabs>

        {/* Application Tracker Placeholder (Resuflex Feature) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="col-span-1 lg:col-span-2 border-none shadow-sm bg-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-bold text-slate-900">Recent Applications</CardTitle>
              <Button variant="outline" size="sm" className="h-8 text-xs">View All</Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { role: "Senior Frontend Engineer", company: "TechCorp", status: "Interview", date: "2d ago" },
                  { role: "Full Stack Developer", company: "StartUp Inc", status: "Applied", date: "5d ago" },
                  { role: "React Native Lead", company: "MobileFirst", status: "Rejected", date: "1w ago" }
                ].map((job, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100 group">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-lg">
                        {job.company[0]}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">{job.role}</h4>
                        <p className="text-xs text-slate-500">{job.company}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary" className={`
                                        ${job.status === 'Interview' ? 'bg-amber-100 text-amber-700' : ''}
                                        ${job.status === 'Applied' ? 'bg-blue-100 text-blue-700' : ''}
                                        ${job.status === 'Rejected' ? 'bg-slate-100 text-slate-500' : ''}
                                    `}>
                        {job.status}
                      </Badge>
                      <span className="text-xs text-slate-400">{job.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-indigo-900 text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-500/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            <CardContent className="p-6 relative z-10 flex flex-col justify-between h-full">
              <div>
                <h3 className="font-bold text-lg mb-2">Unlock Premium</h3>
                <p className="text-indigo-200 text-sm mb-6">Get unlimited AI resume scans, cover letter generation, and priority job matching.</p>
              </div>
              <Button className="w-full bg-white text-indigo-900 hover:bg-indigo-50 font-bold">
                Upgrade Now
              </Button>
            </CardContent>
          </Card>
        </div>

      </main>
    </div>
  );
}

function DashboardLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="text-slate-500 font-medium">Analyzing career trajectory...</p>
      </div>
    </div>
  );
}

function DashboardError() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-900">Analysis Failed</h2>
        <Link href="/"><Button>Try Again</Button></Link>
      </div>
    </div>
  );
}
