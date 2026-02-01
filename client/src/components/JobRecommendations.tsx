import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, DollarSign, Building2, ExternalLink } from "lucide-react";

interface Job {
    id: number;
    title: string;
    company: string;
    location: string;
    salary: string;
    type: string;
    tags: string[];
    logo: string;
}

const COMPANY_LOGOS = ["TF", "LI", "VC", "G", "M", "A"];
const LOCATIONS = ["San Francisco, CA (Remote)", "New York, NY", "Remote", "London, UK", "Austin, TX"];

function generateMockJobs(role: string): Job[] {
    if (role === "all") {
        // Generate a mix of all categories
        return [
            {
                id: 1,
                title: "Senior Full Stack Engineer",
                company: "Netflix",
                location: LOCATIONS[0],
                salary: "$240k - $380k",
                type: "Full-time",
                tags: ["React", "Java", "Microservices"],
                logo: "N"
            },
            ...generateMockJobs("Senior React Developer"),
            ...generateMockJobs("Backend Engineer"),
            ...generateMockJobs("Machine Learning Engineer")
        ].slice(0, 12).map((j, i) => ({ ...j, id: i + 1 })); // Ensure unique IDs
    }

    const isFrontend = /frontend|react|vue|angular|ui|ux/i.test(role);
    const isBackend = /backend|node|java|python|go|api/i.test(role);
    const isData = /data|ai|ml|learning|scientist/i.test(role);

    let baseTitle = role;
    let relevantTags: string[] = [];

    if (isFrontend) {
        relevantTags = ["React", "TypeScript", "Tailwind", "Next.js", "Figma"];
    } else if (isBackend) {
        relevantTags = ["Node.js", "PostgreSQL", "AWS", "Docker", "Microservices"];
    } else if (isData) {
        relevantTags = ["Python", "PyTorch", "TensorFlow", "SQL", "BigQuery"];
    } else {
        // Default fallback tags
        relevantTags = ["Agile", "Communication", "Leadership", "Architecture"];
    }

    // Generate 3 variations
    return [
        {
            id: 1,
            title: `Senior ${role}`,
            company: isData ? "Scale AI" : (isFrontend ? "Vercel" : "Stripe"),
            location: LOCATIONS[0],
            salary: "$160k - $220k",
            type: "Full-time",
            tags: relevantTags.slice(0, 3),
            logo: isData ? "SA" : (isFrontend ? "VC" : "S")
        },
        {
            id: 2,
            title: role,
            company: isData ? "Databricks" : (isFrontend ? "Linear" : "Airbnb"),
            location: LOCATIONS[2],
            salary: "$140k - $190k",
            type: "Full-time",
            tags: [relevantTags[1], relevantTags[3] || "Cloud", "Growth"],
            logo: isData ? "DB" : (isFrontend ? "LI" : "A")
        },
        {
            id: 3,
            title: `Lead ${role.split(' ')[0]} Engineer`,
            company: "Startup Stealth",
            location: LOCATIONS[1],
            salary: "$180k - $250k+ Equity",
            type: "Full-time",
            tags: ["Leadership", relevantTags[0], "System Design"],
            logo: "ST"
        }
    ];
}

export function JobRecommendations({ role }: { role: string }) {
    const jobs = generateMockJobs(role);

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-slate-900">Top Matches for {role}</h3>
                <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-200">
                    {jobs.length} Active Leads
                </Badge>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {jobs.map((job) => (
                    <Card key={job.id} className="group hover:shadow-md transition-all border-slate-200">
                        <CardContent className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-lg">
                                    {job.logo}
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-900 group-hover:text-primary transition-colors">{job.title}</h4>
                                    <p className="text-sm font-medium text-slate-500 mb-2">{job.company}</p>
                                    <div className="flex flex-wrap gap-2">
                                        {job.tags.map(tag => (
                                            <Badge key={tag} variant="secondary" className="text-[10px] bg-slate-100 text-slate-600 hover:bg-slate-200">
                                                {tag}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col items-start md:items-end gap-2 text-sm text-slate-500">
                                <div className="flex items-center gap-1">
                                    <MapPin className="w-3.5 h-3.5" /> {job.location}
                                </div>
                                <div className="flex items-center gap-1 font-medium text-slate-700">
                                    <DollarSign className="w-3.5 h-3.5" /> {job.salary}
                                </div>
                                <Button size="sm" className="mt-2 w-full md:w-auto h-8 text-xs font-bold gap-1 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-primary hover:border-primary/20 shadow-sm">
                                    Apply Now <ExternalLink className="w-3 h-3" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
