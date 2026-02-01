import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, PlayCircle, Award, BookOpen, CheckCircle2 } from "lucide-react";

export default function Recommendations() {
    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            <header className="bg-white border-b border-slate-200 py-12 px-6">
                <div className="max-w-6xl mx-auto">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                            <Award className="w-6 h-6" />
                        </div>
                        <h1 className="text-3xl font-bold font-display text-slate-900">Learning Center</h1>
                    </div>
                    <p className="text-lg text-slate-600 max-w-2xl">
                        Curated resources to bridge your skill gaps. Hand-picked certifications, courses, and free tutorials tailored to your target role.
                    </p>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-6 py-10">
                <Tabs defaultValue="skills" className="w-full">
                    <TabsList className="w-full justify-start h-12 bg-white p-1 border border-slate-200 mb-8 rounded-xl overflow-x-auto">
                        <TabsTrigger value="skills" className="px-6 h-10 rounded-lg data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700">Skills & Roadmap</TabsTrigger>
                        <TabsTrigger value="certifications" className="px-6 h-10 rounded-lg data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700">Free Certifications</TabsTrigger>
                        <TabsTrigger value="courses" className="px-6 h-10 rounded-lg data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700">Premium Courses</TabsTrigger>
                        <TabsTrigger value="youtube" className="px-6 h-10 rounded-lg data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700">YouTube Playlists</TabsTrigger>
                    </TabsList>

                    <TabsContent value="skills" className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Card className="border-slate-200 shadow-sm">
                                <CardHeader>
                                    <CardTitle>Core Technical Skills</CardTitle>
                                    <CardDescription>Must-have technologies for your target role.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {["Advanced React Patterns", "TypeScript Generics", "Server-Side Rendering (Next.js)", "GraphQL API Design", "System Architecture"].map((skill, i) => (
                                        <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                                            <div className="flex items-center gap-3">
                                                <CheckCircle2 className={`w-5 h-5 ${i < 2 ? 'text-emerald-500' : 'text-slate-300'}`} />
                                                <span className="font-medium text-slate-700">{skill}</span>
                                            </div>
                                            <Badge variant="outline" className="bg-white">{i < 2 ? 'Mastered' : 'Pending'}</Badge>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                            <Card className="border-slate-200 shadow-sm">
                                <CardHeader>
                                    <CardTitle>Soft Skills & Leadership</CardTitle>
                                    <CardDescription>Critical for career advancement.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {["System Design Interviews", "Agile Project Management", "Stakeholder Communication", "Mentorship"].map((skill, i) => (
                                        <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                                            <div className="flex items-center gap-3">
                                                <div className="w-5 h-5 rounded-full border-2 border-slate-300" />
                                                <span className="font-medium text-slate-700">{skill}</span>
                                            </div>
                                            <Badge variant="outline" className="bg-white">To Learn</Badge>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="certifications" className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {[
                                { title: "Meta Front-End Developer", provider: "Coursera", tags: ["Professional Cert", "Free Audit"], color: "bg-blue-50 text-blue-700" },
                                { title: "Legacy Full Stack", provider: "FreeCodeCamp", tags: ["100% Free", "300 Hours"], color: "bg-slate-900 text-white" },
                                { title: "Google UX Design", provider: "Google", tags: ["Industry Standard", "Free Audit"], color: "bg-yellow-50 text-yellow-700" },
                            ].map((cert, i) => (
                                <Card key={i} className="group hover:shadow-md transition-all border-slate-200">
                                    <CardContent className="p-6 space-y-4">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-xl ${cert.color}`}>
                                            {cert.provider[0]}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-900 text-lg group-hover:text-primary transition-colors">{cert.title}</h3>
                                            <p className="text-sm text-slate-500">{cert.provider}</p>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {cert.tags.map(tag => <Badge key={tag} variant="secondary" className="bg-slate-100">{tag}</Badge>)}
                                        </div>
                                        <Button variant="outline" className="w-full mt-2">View Certificate</Button>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </TabsContent>

                    <TabsContent value="courses" className="space-y-6">
                        <div className="grid grid-cols-1 gap-4">
                            {[
                                { title: "The Joy of React", author: "Josh Comeau", level: "Advanced", rating: "4.9/5" },
                                { title: "Total TypeScript", author: "Matt Pocock", level: "Expert", rating: "5.0/5" },
                                { title: "Epic Web.dev", author: "Kent C. Dodds", level: "Full Stack", rating: "4.9/5" },
                            ].map((course, i) => (
                                <Card key={i} className="hover:bg-slate-50 transition-colors border-slate-200">
                                    <CardContent className="p-5 flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-indigo-100 text-indigo-600 rounded-lg">
                                                <BookOpen className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-slate-900">{course.title}</h4>
                                                <p className="text-sm text-slate-500">by {course.author} • <span className="text-amber-500 font-medium">★ {course.rating}</span></p>
                                            </div>
                                        </div>
                                        <Button size="sm">Enroll Now</Button>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </TabsContent>

                    <TabsContent value="youtube" className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[
                                { title: "React 2025 Crash Course", channel: "Traversy Media", views: "1.2M views" },
                                { title: "Next.js 14 Full Course", channel: "CodeWithAntonio", views: "850k views" },
                                { title: "System Design Design Primer", channel: "NeetCode", views: "500k views" },
                            ].map((video, i) => (
                                <Card key={i} className="border-slate-200 overflow-hidden group cursor-pointer">
                                    <div className="h-40 bg-slate-200 relative">
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/5 group-hover:bg-black/10 transition-colors">
                                            <PlayCircle className="w-12 h-12 text-white opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all drop-shadow-lg" />
                                        </div>
                                    </div>
                                    <CardContent className="p-4">
                                        <h4 className="font-bold text-slate-900 line-clamp-2">{video.title}</h4>
                                        <div className="flex items-center justify-between mt-2 text-sm text-slate-500">
                                            <span>{video.channel}</span>
                                            <span>{video.views}</span>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </TabsContent>
                </Tabs>
            </main>
        </div>
    );
}
