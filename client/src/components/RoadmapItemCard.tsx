import { useState } from "react";
import { Check, Circle, BookOpen, Wrench, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import type { RoadmapItem } from "@shared/schema";
import { useUpdateRoadmapStatus } from "@/hooks/use-resumes";
import { motion } from "framer-motion";

interface RoadmapItemCardProps {
  item: RoadmapItem;
  index: number;
}

export function RoadmapItemCard({ item, index }: RoadmapItemCardProps) {
  const { mutate: updateStatus, isPending } = useUpdateRoadmapStatus();

  const isCompleted = item.status === "completed";
  const isInProgress = item.status === "in_progress";

  const handleToggle = () => {
    // Cycle: pending -> in_progress -> completed -> pending (or simplified pending -> completed)
    // For simplicity, let's toggle between completed and pending
    const newStatus = isCompleted ? "pending" : "completed";
    updateStatus({ id: item.id, status: newStatus });
  };

  const getIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'skill': return <Wrench className="w-4 h-4" />;
      case 'project': return <Trophy className="w-4 h-4" />;
      case 'practice': return <BookOpen className="w-4 h-4" />;
      default: return <Circle className="w-4 h-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'skill': return "bg-blue-50 text-blue-600 border-blue-100 shadow-sm";
      case 'project': return "bg-indigo-50 text-indigo-600 border-indigo-100 shadow-sm";
      case 'practice': return "bg-cyan-50 text-cyan-600 border-cyan-100 shadow-sm";
      default: return "bg-slate-50 text-slate-400 border-slate-100";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      className={cn(
        "group relative p-8 rounded-[2.5rem] border transition-all duration-300",
        isCompleted
          ? "bg-emerald-50/50 border-emerald-200/50 shadow-sm"
          : "glass-card border-white shadow-xl shadow-indigo-500/5 hover:border-primary/20 hover:shadow-2xl hover:shadow-indigo-500/10"
      )}
    >
      <div className="flex items-start gap-6">
        <button
          onClick={handleToggle}
          disabled={isPending}
          className={cn(
            "mt-1 flex-shrink-0 w-9 h-9 rounded-[1.1rem] border-2 flex items-center justify-center transition-all duration-300",
            isCompleted
              ? "bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/20"
              : "bg-white border-slate-200 hover:border-primary text-transparent hover:bg-primary/5"
          )}
        >
          {isPending ? (
            <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          ) : (
            <Check className={cn("w-5 h-5", isCompleted ? "opacity-100" : "opacity-0")} strokeWidth={4} />
          )}
        </button>

        <div className="flex-1 space-y-4">
          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
            <h4 className={cn(
              "font-display font-bold text-2xl transition-all duration-300 tracking-tight",
              isCompleted ? "text-emerald-600/40 line-through" : "text-slate-900"
            )}>
              {item.title}
            </h4>
            <span className={cn(
              "text-[10px] px-4 py-1.5 rounded-full font-bold border flex items-center gap-2 uppercase tracking-[0.2em] w-fit shadow-xs",
              getCategoryColor(item.category)
            )}>
              {getIcon(item.category)}
              {item.category}
            </span>
          </div>

          <p className={cn(
            "text-base leading-relaxed font-light",
            isCompleted ? "text-emerald-600/40" : "text-slate-500"
          )}>
            {item.description}
          </p>
        </div>
      </div>

      {!isCompleted && (
        <div className="absolute top-1/2 -right-1 w-2 h-12 bg-primary/20 rounded-l-full blur-sm opacity-0 group-hover:opacity-100 transition-opacity" />
      )}
    </motion.div>
  );
}
