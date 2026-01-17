import { motion } from "framer-motion";

interface GaugeProps {
  value: number;
  label?: string;
  size?: "sm" | "md" | "lg";
}

export function Gauge({ value, label = "Score", size = "md" }: GaugeProps) {
  // Clamp value between 0 and 100
  const percentage = Math.min(Math.max(value, 0), 100);
  
  // Calculate dimensions based on size
  const dimensions = {
    sm: { w: 120, stroke: 8, font: "text-2xl" },
    md: { w: 180, stroke: 12, font: "text-4xl" },
    lg: { w: 240, stroke: 16, font: "text-5xl" },
  }[size];

  // Circle properties
  const radius = (dimensions.w - dimensions.stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  // Determine color based on score
  const getColor = (score: number) => {
    if (score >= 80) return "text-emerald-500";
    if (score >= 50) return "text-amber-500";
    return "text-rose-500";
  };

  const colorClass = getColor(percentage);

  return (
    <div className="flex flex-col items-center justify-center relative">
      <div className="relative" style={{ width: dimensions.w, height: dimensions.w }}>
        {/* Background Circle */}
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx={dimensions.w / 2}
            cy={dimensions.w / 2}
            r={radius}
            className="text-gray-100 dark:text-gray-800"
            strokeWidth={dimensions.stroke}
            fill="none"
            stroke="currentColor"
          />
          {/* Progress Circle */}
          <motion.circle
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            cx={dimensions.w / 2}
            cy={dimensions.w / 2}
            r={radius}
            className={colorClass}
            strokeWidth={dimensions.stroke}
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeDasharray={circumference}
          />
        </svg>
        
        {/* Value Display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span 
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className={`${dimensions.font} font-bold font-display text-foreground`}
          >
            {percentage}%
          </motion.span>
          <span className="text-muted-foreground text-sm font-medium uppercase tracking-wider">{label}</span>
        </div>
      </div>
    </div>
  );
}
