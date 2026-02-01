import { Button } from "@/components/ui/button";
import { Download, FileText } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface ResumePreviewProps {
    content: string;
}

export function ResumePreview({ content }: ResumePreviewProps) {
    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between glass-panel p-5 rounded-2xl border border-white shadow-lg shadow-indigo-500/5">
                <div className="flex items-center gap-3 text-sm text-slate-900 font-bold">
                    <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                        <FileText className="w-5 h-5" />
                    </div>
                    <span className="uppercase tracking-widest text-[10px]">Professional ATS-Optimized Format</span>
                </div>
                <Button onClick={handlePrint} className="gap-2 bg-slate-900 text-white hover:bg-slate-800 shadow-lg shadow-slate-900/10 rounded-xl px-6 h-11">
                    <Download className="w-4 h-4" /> Export PDF
                </Button>
            </div>

            <div className="bg-slate-50 p-4 md:p-12 rounded-xl md:rounded-[2.5rem] overflow-auto flex justify-center print:p-0 print:bg-white print:overflow-visible border border-slate-100">
                <div className="bg-white shadow-2xl w-full md:max-w-[210mm] min-h-[297mm] p-6 md:p-[20mm] text-sm text-gray-800 leading-relaxed print:shadow-none print:w-full print:max-w-none print:h-auto print:p-0 relative">
                    {/* Subtle paper texture/gradient if desired, but clean white is best for ATS */}
                    <article className="prose prose-sm prose-slate max-w-none prose-headings:font-display prose-headings:font-bold prose-h1:text-3xl prose-h1:border-b prose-h1:pb-4 prose-h1:mb-6 prose-h2:text-xl prose-h2:mt-8 prose-h2:mb-4 prose-h2:text-primary prose-ul:my-2 prose-li:my-1">
                        <ReactMarkdown>{content}</ReactMarkdown>
                    </article>
                </div>
            </div>


        </div>
    );
}
