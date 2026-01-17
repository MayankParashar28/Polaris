import { useParams, Link } from "wouter";
import { useResumeAnalysis } from "@/hooks/use-resumes";
import { Gauge } from "@/components/Gauge";
import { RoadmapItemCard } from "@/components/RoadmapItemCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, CheckCircle2, AlertCircle, Share2, Download } from "lucide-react";
import { motion } from "framer-motion";

export default function Dashboard() {
  const params = useParams();
  const id = parseInt(params.id || "0");
  const { data: analysis, isLoading, error } = useResumeAnalysis(id);

  if (isLoading) {
    return <DashboardLoading />;
  }

  if (error || !analysis) {
    return <DashboardError />;
  }

  const completedItems = analysis.roadmap.filter(i => i.status === "completed").length;
  const totalItems = analysis.roadmap.length;
  const progress = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  return (
    <div className="min-h-screen bg-gray-50/50">
      
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground">
                <ArrowLeft className="w-4 h-4" /> Back
              </Button>
            </Link>
            <div className="h-6 w-px bg-gray-200" />
            <h1 className="font-display font-bold text-xl text-foreground">Career Dashboard</h1>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-2">
              <Share2 className="w-4 h-4" /> Share
            </Button>
            <Button size="sm" className="gap-2 bg-primary">
              <Download className="w-4 h-4" /> Export Plan
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Hero / Score Section */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Score Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-8 bg-white rounded-3xl p-8 shadow-xl shadow-gray-200/50 border border-gray-100 flex flex-col md:flex-row items-center gap-10"
          >
            <div className="flex-shrink-0">
              <Gauge value={analysis.readinessScore} label="Readiness" size="lg" />
            </div>
            <div className="flex-1 text-center md:text-left space-y-4">
              <div>
                <span className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-semibold mb-2">
                  Target Role
                </span>
                <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground">
                  {analysis.resume.targetRole}
                </h2>
              </div>
              <p className="text-muted-foreground text-lg leading-relaxed">
                You're off to a great start! Your profile shows strong potential. 
                Focus on bridging the identified gaps to increase your interview chances.
              </p>
            </div>
          </motion.div>

          {/* Quick Stats / Progress */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-4 bg-gradient-to-br from-indigo-600 to-violet-700 rounded-3xl p-8 shadow-xl text-white flex flex-col justify-between"
          >
            <div>
              <h3 className="font-display font-bold text-xl mb-1 opacity-90">Roadmap Progress</h3>
              <p className="text-indigo-100 text-sm">Tasks completed to reach your goal</p>
            </div>
            
            <div className="my-8">
              <div className="flex items-end gap-2 mb-2">
                <span className="text-5xl font-bold font-display">{completedItems}</span>
                <span className="text-xl opacity-60 mb-1.5">/ {totalItems}</span>
              </div>
              <div className="w-full bg-black/20 h-2 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-white rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            <div className="text-sm bg-white/10 rounded-xl p-4 backdrop-blur-sm border border-white/10">
              <p className="leading-snug">
                Completing just <strong>2 more tasks</strong> could boost your score by ~15%. Keep going!
              </p>
            </div>
          </motion.div>
        </section>

        {/* Strengths & Gaps */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Strengths */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="font-display font-bold text-xl">Top Strengths</h3>
            </div>
            <ul className="space-y-3">
              {(analysis.strengths as string[]).map((strength, i) => (
                <li key={i} className="flex items-start gap-3 p-3 rounded-xl bg-emerald-50/50 border border-emerald-100/50 text-emerald-900 text-sm font-medium">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
                  {strength}
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Gaps */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-rose-100 text-rose-600 rounded-lg">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h3 className="font-display font-bold text-xl">Critical Gaps</h3>
            </div>
            <ul className="space-y-3">
              {(analysis.gaps as string[]).map((gap, i) => (
                <li key={i} className="flex items-start gap-3 p-3 rounded-xl bg-rose-50/50 border border-rose-100/50 text-rose-900 text-sm font-medium">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-rose-500 flex-shrink-0" />
                  {gap}
                </li>
              ))}
            </ul>
          </motion.div>
        </section>

        {/* Roadmap */}
        <section className="bg-white rounded-3xl p-8 shadow-lg shadow-gray-200/50 border border-gray-100">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="font-display font-bold text-2xl">Your Personalized Roadmap</h3>
              <p className="text-muted-foreground mt-1">Step-by-step actions to improve your readiness.</p>
            </div>
            <div className="hidden sm:flex gap-2">
              {['Skill', 'Project', 'Practice'].map(cat => (
                <span key={cat} className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600 border border-gray-200">
                  {cat}
                </span>
              ))}
            </div>
          </div>
          
          <div className="space-y-4">
            {analysis.roadmap.length === 0 ? (
              <p className="text-center text-muted-foreground py-10">No roadmap items generated yet.</p>
            ) : (
              analysis.roadmap
                .sort((a, b) => a.order - b.order)
                .map((item, index) => (
                  <RoadmapItemCard key={item.id} item={item} index={index} />
                ))
            )}
          </div>
        </section>

      </main>
    </div>
  );
}

function DashboardLoading() {
  return (
    <div className="min-h-screen bg-gray-50/50 p-8 space-y-8 max-w-7xl mx-auto">
      <Skeleton className="h-16 w-full rounded-xl" />
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <Skeleton className="lg:col-span-8 h-64 rounded-3xl" />
        <Skeleton className="lg:col-span-4 h-64 rounded-3xl" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Skeleton className="h-64 rounded-2xl" />
        <Skeleton className="h-64 rounded-2xl" />
      </div>
      <Skeleton className="h-96 rounded-3xl" />
    </div>
  );
}

function DashboardError() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center space-y-4">
        <h2 className="text-2xl font-bold text-gray-900">Analysis Not Found</h2>
        <p className="text-gray-500">We couldn't find the resume analysis you were looking for.</p>
        <Link href="/">
          <Button>Go Home</Button>
        </Link>
      </div>
    </div>
  );
}
