import React from 'react';
import { motion } from 'motion/react';

interface ChartData {
  label: string;
  value: number;
}

interface ActivityChartProps {
  data: ChartData[];
  color?: string;
  height?: number;
}

export const ActivityChart: React.FC<ActivityChartProps> = ({ 
  data, 
  color = '#0ea5e9', 
  height = 200 
}) => {
  if (data.length === 0) return null;

  const maxVal = Math.max(...data.map(d => d.value), 1);
  const padding = 40;
  const chartHeight = height - padding * 2;
  const chartWidth = 800; // Relative units
  const stepX = chartWidth / (data.length - 1 || 1);

  const points = data.map((d, i) => ({
    x: i * stepX,
    y: chartHeight - (d.value / maxVal) * chartHeight + padding
  }));

  const pathData = points.reduce((acc, p, i, arr) => {
    if (i === 0) return `M ${p.x},${p.y}`;
    // Cubic bezier for smoothness
    const prev = arr[i - 1];
    const cp1x = prev.x + (p.x - prev.x) / 2;
    const cp1y = prev.y;
    const cp2x = prev.x + (p.x - prev.x) / 2;
    const cp2y = p.y;
    return `${acc} C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p.x},${p.y}`;
  }, '');

  const areaPath = `${pathData} L ${points[points.length - 1].x},${height} L 0,${height} Z`;

  return (
    <div className="w-full relative group">
      <svg viewBox={`0 0 ${chartWidth} ${height}`} className="w-full h-auto overflow-visible">
        <defs>
          <linearGradient id="gradient-area" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.3" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((p, i) => (
          <line 
            key={i}
            x1="0" y1={padding + p * chartHeight} 
            x2={chartWidth} y2={padding + p * chartHeight} 
            stroke="currentColor" 
            strokeOpacity="0.05" 
            strokeWidth="1"
          />
        ))}

        <motion.path
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
          d={pathData}
          fill="none"
          stroke={color}
          strokeWidth="4"
          strokeLinecap="round"
        />

        <motion.path
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
          d={areaPath}
          fill="url(#gradient-area)"
        />

        {/* Data Points */}
        {points.map((p, i) => (
          <motion.circle
            key={i}
            initial={{ r: 0 }}
            animate={{ r: 4 }}
            whileHover={{ r: 6 }}
            transition={{ delay: 1 + i * 0.05 }}
            cx={p.x}
            cy={p.y}
            fill="white"
            stroke={color}
            strokeWidth="2"
            className="cursor-pointer"
          />
        ))}
      </svg>
      
      <div className="flex justify-between mt-4">
        {data.filter((_, i) => i % Math.ceil(data.length / 6) === 0).map((d, i) => (
          <span key={i} className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{d.label}</span>
        ))}
      </div>
    </div>
  );
};

export const StatusDonut: React.FC<{ pending: number; approved: number }> = ({ pending, approved }) => {
  const total = pending + approved || 1;
  const approvedPct = (approved / total) * 100;
  const pendingPct = (pending / total) * 100;
  
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  
  return (
    <div className="flex items-center gap-8">
      <div className="relative w-32 h-32">
        <svg viewBox="0 0 100 100" className="transform -rotate-90">
          <circle
            cx="50" cy="50" r={radius}
            fill="transparent"
            stroke="#f3f4f6"
            strokeWidth="12"
          />
          <motion.circle
            cx="50" cy="50" r={radius}
            fill="transparent"
            stroke="#10b981"
            strokeWidth="12"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: circumference - (approvedPct / 100) * circumference }}
            transition={{ duration: 1, ease: "easeOut" }}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-black text-gray-900">{Math.round(approvedPct)}%</span>
          <span className="text-[8px] font-bold text-gray-400 uppercase tracking-tighter">Approved</span>
        </div>
      </div>
      
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-emerald-500" />
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider leading-none">Completed</p>
            <p className="text-lg font-black text-gray-900">{approved}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-amber-500" />
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider leading-none">Pending</p>
            <p className="text-lg font-black text-gray-900">{pending}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
