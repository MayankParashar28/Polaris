import { PolarAngleAxis, PolarGrid, Radar, RadarChart, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

interface SkillData {
    subject: string;
    A: number; // Current Level
    fullMark: number;
}

interface SkillsRadarChartProps {
    data: SkillData[];
    className?: string;
}

export function SkillsRadarChart({ data, className }: SkillsRadarChartProps) {
    // Chart config for the tooltip
    const chartConfig = {
        A: {
            label: "Skill Level",
            color: "hsl(var(--primary))",
        },
    };

    return (
        <Card className={`border-none shadow-sm bg-white ${className}`}>
            <CardHeader className="pb-4">
                <CardTitle className="text-lg font-bold text-slate-900">Skill Competency Profile</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[300px] w-full">
                    <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart data={data} outerRadius={90}>
                                <PolarGrid stroke="#e2e8f0" strokeDasharray="3 3" />
                                <PolarAngleAxis
                                    dataKey="subject"
                                    tick={{ fill: "#64748b", fontSize: 12, fontWeight: 600 }}
                                />
                                <Radar
                                    name="Skill Level"
                                    dataKey="A"
                                    stroke="hsl(var(--primary))"
                                    fill="hsl(var(--primary))"
                                    fillOpacity={0.2}
                                />
                                <ChartTooltip
                                    cursor={false}
                                    content={<ChartTooltipContent />}
                                />
                            </RadarChart>
                        </ResponsiveContainer>
                    </ChartContainer>
                </div>
            </CardContent>
        </Card>
    );
}
