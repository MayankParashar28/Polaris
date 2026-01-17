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
      case 'skill': return "bg-blue-100 text-blue-700 border-blue-200";
      case 'project': return "bg-purple-100 text-purple-700 border-purple-200";
      case 'practice': return "bg-amber-100 text-amber-700 border-amber-200";
      default: return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      className={cn(
        "group relative p-5 rounded-xl border-2 transition-all duration-300",
        isCompleted 
          ? "bg-emerald-50/50 border-emerald-100 hover:border-emerald-200" 
          : "bg-white border-border hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
      )}
    >
      <div className="flex items-start gap-4">
        <button
          onClick={handleToggle}
          disabled={isPending}
          className={cn(
            "mt-1 flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200",
            isCompleted 
              ? "bg-emerald-500 border-emerald-500 text-white" 
              : "border-muted-foreground/30 hover:border-primary text-transparent hover:bg-primary/5"
          )}
        >
          <Check className={cn("w-3.5 h-3.5", isCompleted ? "opacity-100" : "opacity-0")} strokeWidth={3} />
        </button>
        
        <div className="flex-1 space-y-2">
          <div className="flex items-center justify-between">
            <h4 className={cn(
              "font-display font-semibold text-lg transition-colors",
              isCompleted ? "text-emerald-900 line-through opacity-70" : "text-foreground"
            )}>
              {item.title}
            </h4>
            <span className={cn(
              "text-xs px-2.5 py-1 rounded-full font-medium border flex items-center gap-1.5",
              getCategoryColor(item.category)
            )}>
              {getIcon(item.category)}
              <span className="capitalize">{item.category}</span>
            </span>
          </div>
          
          <p className={cn(
            "text-sm leading-relaxed",
            isCompleted ? "text-emerald-800/60" : "text-muted-foreground"
          )}>
            {item.description}
          </p>
        </div>
      </div>
      
      {/* Connector line for visual timeline effect if implemented in list */}
      {/* <div className="absolute left-8 top-16 bottom-0 w-0.5 bg-border -z-10 group-last:hidden" /> */}
    </motion.div>
  );
}
