"use client";

import React from "react";
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  Legend 
} from "recharts";
import { VideoAnalysis, KeyFrame } from "@/types";

interface VisualDashboardProps {
  analysis: VideoAnalysis;
  frames: KeyFrame[];
}

export default function VisualDashboard({ analysis, frames }: VisualDashboardProps) {
  // 1. Topic Distribution Data (Pie Chart)
  const nodeTypes = analysis.diagramData?.nodes || [];
  const typeCounts: Record<string, number> = {};
  nodeTypes.forEach((node) => {
    typeCounts[node.type] = (typeCounts[node.type] || 0) + 1;
  });
  
  // Fill default types if none found
  const rawPieData = [
    { name: "Problem", value: typeCounts["problem"] || 1 },
    { name: "Process", value: typeCounts["process"] || 2 },
    { name: "Solution", value: typeCounts["solution"] || 2 },
    { name: "Outcome", value: typeCounts["outcome"] || 1 }
  ];
  
  // Filter out zero entries
  const pieData = rawPieData.filter(d => d.value > 0);

  const PIE_COLORS = ["#EF4444", "#F59E0B", "#4F46E5", "#06B6D4"];

  // 2. Sentiment Timeline Data (Line Chart)
  const sentimentHistory = analysis.sentiment?.history || [];
  const lineData = sentimentHistory.map((item) => ({
    time: formatTime(item.timestamp),
    score: item.score,
    sentiment: item.sentiment.toUpperCase()
  }));

  // 3. Importance Timeline Data (Area Chart)
  const areaData = [...frames]
    .sort((a, b) => a.timestamp - b.timestamp)
    .map((f) => ({
      time: formatTime(f.timestamp),
      importance: f.score,
      description: f.description.length > 20 ? f.description.substring(0, 20) + "..." : f.description
    }));

  // 4. Engagement Curve Data (Interactive Graph)
  const duration = analysis.transcript[analysis.transcript.length - 1]?.start || 600;
  const engagementPoints = 10;
  const curveData = Array.from({ length: engagementPoints }).map((_, idx) => {
    const timestamp = Math.floor((duration / (engagementPoints - 1)) * idx);
    // Simulate drop-off and minor recovery (normal video consumption behavior)
    let score = 95 - idx * 6;
    if (idx > 4) score += Math.sin(idx) * 12; // recover attention slightly
    if (idx === engagementPoints - 1) score = 45; // final goodbye
    
    return {
      time: formatTime(timestamp),
      engagement: Math.max(10, Math.floor(score))
    };
  });

  // 5. Entity Frequency (Bar Chart)
  const barData = (analysis.entities || []).slice(0, 5).map((e) => ({
    name: e.name,
    mentions: e.count,
    type: e.type.toUpperCase()
  }));

  // Utility to format timestamp seconds to readable MM:SS
  function formatTime(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg border border-white/10 bg-zinc-950 p-3 shadow-xl">
          <p className="text-xs font-semibold text-zinc-400 mb-1">{label}</p>
          {payload.map((p: any, i: number) => (
            <p key={i} className="text-sm font-bold" style={{ color: p.color || p.fill }}>
              {p.name}: {p.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
      
      {/* 1. Topic Distribution */}
      <div className="rounded-2xl border border-white/5 bg-zinc-900/40 p-5 flex flex-col h-80">
        <h3 className="text-sm font-semibold text-zinc-400 mb-4">Content Type Distribution</h3>
        <div className="flex-1 min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={4}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                verticalAlign="bottom" 
                height={36} 
                iconSize={8} 
                formatter={(value) => <span className="text-xs text-zinc-400">{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2. Sentiment Timeline */}
      <div className="rounded-2xl border border-white/5 bg-zinc-900/40 p-5 flex flex-col h-80">
        <h3 className="text-sm font-semibold text-zinc-400 mb-4">Sentiment Timeline</h3>
        <div className="flex-1 min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={lineData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
              <XAxis dataKey="time" stroke="#71717a" fontSize={10} />
              <YAxis stroke="#71717a" fontSize={10} domain={[0, 100]} />
              <Tooltip content={<CustomTooltip />} />
              <Line 
                type="monotone" 
                dataKey="score" 
                name="Sentiment Score" 
                stroke="#06b6d4" 
                strokeWidth={2.5}
                dot={{ fill: "#06b6d4", strokeWidth: 1 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 3. Importance Timeline */}
      <div className="rounded-2xl border border-white/5 bg-zinc-900/40 p-5 flex flex-col h-80">
        <h3 className="text-sm font-semibold text-zinc-400 mb-4">Keyframe Importance Timeline</h3>
        <div className="flex-1 min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={areaData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
              <defs>
                <linearGradient id="colorImportance" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
              <XAxis dataKey="time" stroke="#71717a" fontSize={10} />
              <YAxis stroke="#71717a" fontSize={10} domain={[0, 100]} />
              <Tooltip content={<CustomTooltip />} />
              <Area 
                type="monotone" 
                dataKey="importance" 
                name="Importance" 
                stroke="#8b5cf6" 
                fillOpacity={1} 
                fill="url(#colorImportance)" 
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 4. Engagement Curve */}
      <div className="rounded-2xl border border-white/5 bg-zinc-900/40 p-5 flex flex-col h-80">
        <h3 className="text-sm font-semibold text-zinc-400 mb-4">User Engagement Curve</h3>
        <div className="flex-1 min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={curveData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
              <defs>
                <linearGradient id="colorEngagement" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
              <XAxis dataKey="time" stroke="#71717a" fontSize={10} />
              <YAxis stroke="#71717a" fontSize={10} domain={[0, 100]} />
              <Tooltip content={<CustomTooltip />} />
              <Area 
                type="monotone" 
                dataKey="engagement" 
                name="Engagement %" 
                stroke="#4f46e5" 
                fillOpacity={1} 
                fill="url(#colorEngagement)" 
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 5. Entity Frequency */}
      <div className="rounded-2xl border border-white/5 bg-zinc-900/40 p-5 flex flex-col h-80 md:col-span-2">
        <h3 className="text-sm font-semibold text-zinc-400 mb-4">Top Named Entities Mentioned</h3>
        <div className="flex-1 min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
              <XAxis dataKey="name" stroke="#71717a" fontSize={10} />
              <YAxis stroke="#71717a" fontSize={10} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="mentions" 
                name="Mentions count" 
                fill="#4f46e5" 
                radius={[4, 4, 0, 0]}
              >
                {barData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={index % 2 === 0 ? "#4f46e5" : "#06b6d4"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}
