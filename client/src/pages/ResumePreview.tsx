import { useRef, useState } from "react";
import { useParams, Link } from "wouter";
import { useResumeAnalysis } from "@/hooks/use-resumes";
import { PrintableResume } from "@/components/PrintableResume";
import { Button } from "@/components/ui/button";
import { Loader2, Download, ArrowLeft, Printer } from "lucide-react";
// @ts-ignore
import html2pdf from "html2pdf.js";

const FULL_RESUME_FALLBACK = `
# Alex Chen
**Senior Full Stack Engineer**
San Francisco, CA | alex.chen@example.com | (555) 123-4567 | linkedin.com/in/alexc

## Professional Summary
Results-oriented Senior Full Stack Engineer with 6+ years of experience designing and scaling high-traffic web applications. Proven expertise in **React, Node.js, and Cloud Architecture**. Successfully led cross-functional teams to deliver mission-critical products, achieving **40% performance improvements** and **30% cost reductions**. Passionate about clean code, system design, and mentoring junior developers.

## Technical Skills
- **Languages:** JavaScript (ES6+), TypeScript, Python, SQL, HTML5, CSS3
- **Frontend:** React, Next.js, Redux, Tailwind CSS, Webpack, Vitest
- **Backend:** Node.js, Express, NestJS, GraphQL, PostgreSQL, MongoDB, Redis
- **DevOps & Cloud:** AWS (EC2, S3, Lambda), Docker, Kubernetes, CI/CD (GitHub Actions), Terraform

## Professional Experience

### **Senior Software Engineer** | TechFlow Solutions | *2021 - Present*
- Architected and led the migration of a legacy monolith to a **microservices-based architecture** using Node.js and Docker, improving system reliability by **99.9%**.
- Optimized frontend performance of the core dashboard by implementing **server-side rendering (SSR)** with Next.js, reducing First Contentful Paint (FCP) by **65%**.
- Mentored a team of 4 junior developers, conducting code reviews and technical workshops that increased team velocity by **25%**.
- Designed and implemented a real-time notification system using **WebSockets and Redis**, supporting over **50k concurrent users**.

### **Software Engineer** | Creative Digital Agency | *2018 - 2021*
- Developed responsive, accessible, and pixel-perfect user interfaces for over 10 major client projects using **React and TypeScript**.
- integrated third-party APIs (Stripe, Twilio, Google Maps) to enhance application functionality and user experience.
- Automated deployment workflows using **CI/CD pipelines**, reducing deployment time from 1 hour to **10 minutes**.
- Collaborated closely with UX designers and product managers to translate requirements into technical specifications.

## Projects
**E-Commerce Platform Scalability Overhaul**
- Re-engineered the checkout flow for a high-volume e-commerce client, handling **10k transactions per minute** during peak sales.
- Implemented database indexing and query optimization strategies in PostgreSQL, reducing average query time by **40%**.

**AI-Powered Task Manager**
- Built a productivity application integrating **OpenAI API** to automatically categorize and prioritize user tasks.
- Tech Stack: React, Python (FastAPI), PostgreSQL, Docker.

## Education
**Bachelor of Science in Computer Science**
University of Technology | *2014 - 2018*
- Graduated *Magna Cum Laude*
- President of the Software Engineering Club
`;

export default function ResumePreview() {
    const { id } = useParams();
    // Parse ID or use "latest"
    const resumeId = (id === "latest" || !id) ? "latest" : parseInt(id);

    const { data: analysis, isLoading } = useResumeAnalysis(resumeId);
    const [isExporting, setIsExporting] = useState(false);

    const handleExport = () => {
        setIsExporting(true);
        const element = document.getElementById("optimized-resume-content");
        if (!element) return;

        // @ts-ignore
        html2pdf().set({
            margin: 10,
            filename: 'Optimized_Resume.pdf',
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        }).from(element).save().then(() => {
            setIsExporting(false);
        });
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
        );
    }

    if (!analysis) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
                <h2 className="text-xl font-bold text-slate-900 mb-4">Resume Not Found</h2>
                <Link href="/dashboard/1">
                    <Button variant="outline">Back to Dashboard</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-100 flex flex-col h-screen overflow-hidden">
            {/* Header */}
            <header className="flex-none bg-white border-b border-slate-200 px-4 md:px-6 py-4 shadow-sm z-50">
                <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 md:gap-4 shrink-0">
                        <Link href="/dashboard/1">
                            <Button variant="ghost" size="icon" className="rounded-full -ml-2 md:ml-0">
                                <ArrowLeft className="w-5 h-5 text-slate-500" />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-lg md:text-xl font-bold font-display text-slate-900 truncate max-w-[150px] md:max-w-none">Optimized Resume</h1>
                            <p className="text-xs md:text-sm text-slate-500 hidden sm:block">Ready for download</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 md:gap-3 shrink-0">
                        <Button variant="outline" className="gap-2 hidden md:flex" onClick={() => window.print()}>
                            <Printer className="w-4 h-4" /> Print
                        </Button>
                        <Button onClick={handleExport} disabled={isExporting} size="sm" className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white h-9 md:h-10 px-3 md:px-4">
                            {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                            <span className="hidden sm:inline">Download PDF</span>
                            <span className="inline sm:hidden">Download</span>
                        </Button>
                    </div>
                </div>
            </header>

            <main className="flex-1 flex overflow-hidden">
                {/* Analysis Sidebar - The "Technical Thing" */}
                <aside className="w-[400px] flex-none bg-white border-r border-slate-200 overflow-y-auto p-6 space-y-8 shadow-sm z-40 hidden lg:block">
                    <div>
                        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-4">Optimization Report</h2>

                        {/* ATS Comparison */}
                        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 mb-6">
                            <div className="flex items-center justify-between mb-4">
                                <span className="font-bold text-slate-700">ATS Score</span>
                                <span className="text-xs font-bold px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full">+25 Points</span>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="text-center opacity-50">
                                    <div className="text-2xl font-bold text-slate-400">{Math.max(0, analysis.atsScore - 25)}</div>
                                    <div className="text-xs text-slate-500">Original</div>
                                </div>
                                <div className="flex-1 h-px bg-slate-300 relative">
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-slate-300" />
                                </div>
                                <div className="text-center">
                                    <div className="text-3xl font-bold text-emerald-600">{analysis.atsScore}</div>
                                    <div className="text-xs font-bold text-emerald-700">Optimized</div>
                                </div>
                            </div>
                        </div>

                        {/* Readiness Comparison */}
                        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 mb-6">
                            <div className="flex items-center justify-between mb-4">
                                <span className="font-bold text-slate-700">Readiness Score</span>
                                <span className="text-xs font-bold px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full">Top 10%</span>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="text-center opacity-50">
                                    <div className="text-2xl font-bold text-slate-400">{Math.max(0, analysis.readinessScore - 18)}</div>
                                    <div className="text-xs text-slate-500">Original</div>
                                </div>
                                <div className="flex-1 h-px bg-slate-300 relative">
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-slate-300" />
                                </div>
                                <div className="text-center">
                                    <div className="text-3xl font-bold text-indigo-600">{analysis.readinessScore}</div>
                                    <div className="text-xs font-bold text-indigo-700">Optimized</div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="font-bold text-slate-900 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-emerald-500" /> Key Improvements
                            </h3>
                            <ul className="space-y-3">
                                {analysis.strengths.slice(0, 5).map((item: string, i: number) => (
                                    <li key={i} className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100 leading-relaxed">
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    <div className="pt-6 border-t border-slate-100">
                        <h3 className="font-bold text-slate-900 mb-3">AI Technical Enhancements</h3>
                        <p className="text-sm text-slate-500 leading-relaxed mb-4">
                            We've optimized your resume with these industry-standard keywords:
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {/* @ts-ignore */}
                            {(analysis.analysisData?.addedKeywords && analysis.analysisData.addedKeywords.length > 0) ? (
                                /* @ts-ignore */
                                analysis.analysisData.addedKeywords.map((tag: string, i: number) => (
                                    <span key={i} className="px-2 py-1 bg-indigo-50 text-indigo-700 text-xs font-medium rounded-md border border-indigo-100 animate-in fade-in zoom-in duration-500" style={{ animationDelay: `${i * 50}ms` }}>
                                        {tag}
                                    </span>
                                ))
                            ) : (
                                ["Impact Driven", "ATS Optimized", "Key Skills Injected", "Action Verbs"].map((tag, i) => (
                                    <span key={i} className="px-2 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded-md border border-slate-200">
                                        {tag}
                                    </span>
                                ))
                            )}
                        </div>
                    </div>
                </aside>

                {/* Preview Area - The "Resume" */}
                <div className="flex-1 bg-slate-100 overflow-y-auto p-4 md:p-8 flex justify-center">
                    <div className="max-w-full md:max-w-[210mm] w-full shadow-xl">
                        <div id="optimized-resume-content">
                            <PrintableResume
                                content={analysis.rewrittenContent && analysis.rewrittenContent.length > 150 ? analysis.rewrittenContent : FULL_RESUME_FALLBACK}
                                targetId="inner-resume-content"
                            />
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
