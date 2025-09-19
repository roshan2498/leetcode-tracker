"use client";

import { useState, useEffect, useCallback } from "react";
import { ProgressStatus, UserProgress } from "@/types";
import { TrendingUp, CheckCircle2, Clock, AlertCircle, BarChart3 } from "lucide-react";

interface ProgressStatsProps {
  selectedCompany: string;
}

export default function ProgressStats({ selectedCompany }: ProgressStatsProps) {
  const [stats, setStats] = useState<ProgressStatus>({
    not_started: 0,
    in_progress: 0,
    completed: 0,
  });

  const fetchProgress = useCallback(async () => {
    if (!selectedCompany) return;

    try {
      const response = await fetch("/api/progress");
      const progress: UserProgress[] = await response.json();
      
      const companyProgress = progress.filter(
        (p) => p.company === selectedCompany
      );

      const newStats = companyProgress.reduce(
        (acc: ProgressStatus, p: UserProgress) => {
          acc[p.status as keyof ProgressStatus]++;
          return acc;
        },
        { not_started: 0, in_progress: 0, completed: 0 }
      );

      setStats(newStats);
    } catch (error) {
      console.error("Error fetching progress:", error);
    }
  }, [selectedCompany]);

  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  // Listen for progress updates from other components
  useEffect(() => {
    const handleProgressUpdate = () => {
      fetchProgress();
    };

    // Listen for custom events when progress is updated
    window.addEventListener("progressUpdated", handleProgressUpdate);
    
    return () => {
      window.removeEventListener("progressUpdated", handleProgressUpdate);
    };
  }, [fetchProgress]);

  const total = stats.not_started + stats.in_progress + stats.completed;
  const completionRate = total > 0 ? (stats.completed / total) * 100 : 0;

  return (
    <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl shadow-2xl p-4 transition-all duration-300 hover:bg-white/10 sticky top-8">
      {/* Header */}
      <div className="flex items-center space-x-2 mb-4">
        <div className="p-1.5 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg shadow-lg">
          <BarChart3 className="w-4 h-4 text-white" />
        </div>
        <div>
          <h2 className="text-lg font-bold bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
            Neural Progress
          </h2>
          <div className="flex items-center space-x-1">
            <TrendingUp className="w-3 h-3 text-amber-400" />
            <span className="text-xs text-gray-300">Performance Analytics</span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {/* Completion Rate with animated progress bar */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs font-medium text-gray-300">Neural Completion</span>
            <span className="text-sm font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              {completionRate.toFixed(1)}%
            </span>
          </div>
          
          {/* Animated progress bar */}
          <div className="relative">
            <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden backdrop-blur-sm">
              <div
                className="h-full bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-400 rounded-full transition-all duration-1000 ease-out shadow-lg"
                style={{ 
                  width: `${completionRate}%`,
                  boxShadow: completionRate > 0 ? '0 0 15px rgba(6, 182, 212, 0.4)' : 'none'
                }}
              >
                <div className="h-full w-full bg-gradient-to-r from-white/20 to-transparent rounded-full animate-pulse"></div>
              </div>
            </div>
            {/* Glow effect */}
            <div 
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-emerald-400/20 via-cyan-400/20 to-blue-400/20 rounded-full blur-sm transition-all duration-1000"
              style={{ width: `${completionRate}%` }}
            ></div>
          </div>
        </div>
        
        {/* Compact Stats breakdown */}
        <div className="space-y-2">
          {/* Completed */}
          <div className="flex items-center justify-between p-2 bg-white/5 rounded-lg backdrop-blur-sm border border-emerald-500/20 hover:border-emerald-500/40 transition-all duration-300">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-medium text-emerald-300">Completed</span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="text-sm font-bold text-emerald-400">{stats.completed}</span>
              <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></div>
            </div>
          </div>

          {/* In Progress */}
          <div className="flex items-center justify-between p-2 bg-white/5 rounded-lg backdrop-blur-sm border border-blue-500/20 hover:border-blue-500/40 transition-all duration-300">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-blue-400" />
              <span className="text-xs font-medium text-blue-300">In Progress</span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="text-sm font-bold text-blue-400">{stats.in_progress}</span>
              <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse"></div>
            </div>
          </div>

          {/* Not Started */}
          <div className="flex items-center justify-between p-2 bg-white/5 rounded-lg backdrop-blur-sm border border-gray-500/20 hover:border-gray-500/40 transition-all duration-300">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-gray-400" />
              <span className="text-xs font-medium text-gray-300">Not Started</span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="text-sm font-bold text-gray-400">{stats.not_started}</span>
              <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-pulse"></div>
            </div>
          </div>

          {/* Total with special styling */}
          <div className="flex items-center justify-between p-3 bg-gradient-to-r from-white/10 to-white/5 rounded-lg backdrop-blur-sm border border-white/20 shadow-lg mt-3">
            <div className="flex items-center space-x-2">
              <div className="p-1 bg-gradient-to-br from-purple-400 to-pink-500 rounded-md">
                <BarChart3 className="w-3 h-3 text-white" />
              </div>
              <span className="text-xs font-bold text-white">Total Matrix</span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="text-lg font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                {total}
              </span>
              <div className="w-1.5 h-1.5 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
