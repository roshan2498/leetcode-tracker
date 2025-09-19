"use client";

import { useState, useEffect, useMemo } from "react";
import { CompanyData, UserProgress } from "@/types";
import { getDifficultyColor, getStatusColor } from "@/lib/utils";
import { 
  Calendar, 
  Clock, 
  Target, 
  ExternalLink, 
  Zap, 
  Search, 
  X, 
  ChevronLeft, 
  ChevronRight,
  Filter,
  SortAsc,
  SortDesc
} from "lucide-react";

interface ProblemListProps {
  company: string;
}

export default function ProblemList({ company }: ProblemListProps) {
  const [companyData, setCompanyData] = useState<CompanyData | null>(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>("All");
  const [userProgress, setUserProgress] = useState<UserProgress[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Pagination and search states
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"title" | "frequency" | "acceptance">("frequency");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const timeframes = ["Thirty Days", "Three Months", "Six Months", "More Than Six Months", "All"];

  // Load selected timeframe from localStorage on component mount
  useEffect(() => {
    const savedTimeframe = localStorage.getItem("selectedTimeframe");
    if (savedTimeframe && timeframes.includes(savedTimeframe)) {
      setSelectedTimeframe(savedTimeframe);
    }
  }, []);

  // Save timeframe to localStorage when it changes
  const handleTimeframeChange = (timeframe: string) => {
    setSelectedTimeframe(timeframe);
    localStorage.setItem("selectedTimeframe", timeframe);
    setCurrentPage(1); // Reset to first page when changing timeframe
  };

  // Reset page when search/filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, difficultyFilter, statusFilter, sortBy, sortOrder]);

  useEffect(() => {
    if (!company) return;

    setLoading(true);
    
    // Helper function to parse CSV
    const parseCSV = (csvText: string) => {
      const lines = csvText.trim().split("\n");
      return lines.slice(1).map((line) => {
        const values = line.split(",");
        return {
          Difficulty: values[0],
          Title: values[1],
          Frequency: parseFloat(values[2]),
          "Acceptance Rate": parseFloat(values[3]),
          Link: values[4],
          Topics: values[5] || "",
        };
      });
    };

    // Load all timeframe files
    const timeframeFiles = {
      "Thirty Days": "1. Thirty Days.csv",
      "Three Months": "2. Three Months.csv", 
      "Six Months": "3. Six Months.csv",
      "More Than Six Months": "4. More Than Six Months.csv",
      "All": "5. All.csv"
    };

    const filePromises = Object.entries(timeframeFiles).map(([timeframe, filename]) =>
      fetch(`/data/${company}/${filename}`)
        .then((res) => {
          if (!res.ok) {
            throw new Error(`Failed to load ${filename}`);
          }
          return res.text();
        })
        .then((csvText) => [timeframe, parseCSV(csvText)])
        .catch((error) => {
          console.warn(`Could not load ${filename} for ${company}:`, error);
          return [timeframe, []]; // Return empty array if file doesn't exist
        })
    );

    Promise.all([
      Promise.all(filePromises).then((results) => {
        const problems = Object.fromEntries(results);
        return { 
          name: company, 
          problems
        };
      }),
      fetch("/api/progress")
        .then((res) => res.json())
        .then((progress: UserProgress[]) => progress.filter((p) => p.company === company))
    ])
      .then(([data, progress]) => {
        setCompanyData(data);
        setUserProgress(progress);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error loading data:", error);
        setLoading(false);
      });
  }, [company]);

  const updateProgress = async (problemId: string, status: string) => {
    const problem = companyData?.problems[selectedTimeframe as keyof typeof companyData.problems]?.find(
      (p) => p.Title === problemId
    );
    
    if (!problem) return;

    try {
      const response = await fetch("/api/progress", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          problemId: problem.Title,
          company,
          difficulty: problem.Difficulty,
          title: problem.Title,
          status,
        }),
      });

      if (response.ok) {
        const updatedProgress = await response.json();
        setUserProgress((prev) => {
          const filtered = prev.filter((p) => p.problemId !== problemId);
          return [...filtered, updatedProgress];
        });
        
        // Dispatch custom event to notify other components
        window.dispatchEvent(new CustomEvent("progressUpdated"));
      }
    } catch (error) {
      console.error("Error updating progress:", error);
    }
  };

  const getProblemStatus = (title: string): string => {
    const progress = userProgress.find((p) => p.problemId === title);
    return progress?.status || "not_started";
  };

  // Filter and search logic
  const filteredAndSortedProblems = useMemo(() => {
    const problems = companyData?.problems[selectedTimeframe as keyof typeof companyData.problems] || [];
    
    let filtered = problems.filter((problem) => {
      // Search filter
      const searchMatch = searchTerm === "" || 
        problem.Title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        problem.Topics.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Difficulty filter
      const difficultyMatch = difficultyFilter === "all" || 
        problem.Difficulty.toLowerCase() === difficultyFilter.toLowerCase();
      
      // Status filter
      const status = getProblemStatus(problem.Title);
      const statusMatch = statusFilter === "all" || status === statusFilter;
      
      return searchMatch && difficultyMatch && statusMatch;
    });

    // Sort
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case "title":
          aValue = a.Title.toLowerCase();
          bValue = b.Title.toLowerCase();
          break;
        case "frequency":
          aValue = a.Frequency;
          bValue = b.Frequency;
          break;
        case "acceptance":
          aValue = a["Acceptance Rate"];
          bValue = b["Acceptance Rate"];
          break;
        default:
          return 0;
      }
      
      if (sortOrder === "asc") {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return filtered;
  }, [companyData, selectedTimeframe, searchTerm, difficultyFilter, statusFilter, sortBy, sortOrder, userProgress]);

  // Pagination logic
  const totalPages = Math.ceil(filteredAndSortedProblems.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProblems = filteredAndSortedProblems.slice(startIndex, endIndex);

  const clearFilters = () => {
    setSearchTerm("");
    setDifficultyFilter("all");
    setStatusFilter("all");
    setCurrentPage(1);
  };

  if (loading) {
    return (
      <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl shadow-2xl p-8 transition-all duration-300">
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <div className="animate-spin w-12 h-12 border-4 border-cyan-400/30 border-t-cyan-400 rounded-full"></div>
          <div className="text-gray-300 font-medium">Scanning neural networks...</div>
          <div className="text-xs text-gray-500">Loading problem matrix</div>
        </div>
      </div>
    );
  }

  if (!companyData) {
    return (
      <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl shadow-2xl p-8 transition-all duration-300">
        <div className="text-center text-gray-400 space-y-2">
          <Target className="w-16 h-16 mx-auto text-gray-500" />
          <div className="text-lg font-medium">No data matrix found</div>
          <div className="text-sm">Corporation {company} not in neural database</div>
        </div>
      </div>
    );
  }

  return (
    <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl shadow-2xl transition-all duration-300">
      {/* Header */}
      <div className="p-6 border-b border-white/10 bg-gradient-to-r from-white/5 to-white/10 rounded-t-2xl">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-gradient-to-br from-violet-400 to-purple-500 rounded-xl shadow-lg">
            <Target className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-violet-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              {company} Neural Matrix
            </h2>
            <div className="flex items-center space-x-2">
              <Zap className="w-4 h-4 text-violet-400" />
              <span className="text-sm text-gray-300">Problem Synthesis Database</span>
            </div>
          </div>
        </div>

        {/* Timeframe selector */}
        <div className="flex flex-wrap gap-2 mb-6">
          {timeframes.map((timeframe) => (
            <button
              key={timeframe}
              onClick={() => handleTimeframeChange(timeframe)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                selectedTimeframe === timeframe
                  ? "bg-gradient-to-r from-violet-500/30 to-purple-500/30 text-violet-300 border border-violet-400/40 shadow-lg shadow-violet-500/10"
                  : "text-gray-400 hover:bg-white/10 hover:text-gray-200 border border-transparent hover:border-white/20"
              }`}
            >
              <div className="flex items-center space-x-2">
                <Clock className="w-3 h-3" />
                <span>{timeframe}</span>
              </div>
            </button>
          ))}
        </div>

        {/* Enhanced Search and Filter Bar */}
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Neural search problems, topics... (ESC to clear)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === "Escape" && setSearchTerm("")}
              className="block w-full pl-12 pr-12 py-3 border border-white/20 rounded-xl leading-5 bg-white/5 backdrop-blur-sm text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 transition-all duration-300 shadow-lg"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-200 transition-colors duration-200"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>

          {/* Filters and Sort */}
          <div className="flex flex-wrap gap-4 items-center">
            {/* Difficulty Filter */}
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={difficultyFilter}
                onChange={(e) => setDifficultyFilter(e.target.value)}
                className="backdrop-blur-sm bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 transition-all duration-300"
              >
                <option value="all" className="bg-gray-800">All Difficulties</option>
                <option value="easy" className="bg-gray-800">Easy</option>
                <option value="medium" className="bg-gray-800">Medium</option>
                <option value="hard" className="bg-gray-800">Hard</option>
              </select>
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="backdrop-blur-sm bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 transition-all duration-300"
            >
              <option value="all" className="bg-gray-800">All Status</option>
              <option value="not_started" className="bg-gray-800">Not Started</option>
              <option value="in_progress" className="bg-gray-800">In Progress</option>
              <option value="completed" className="bg-gray-800">Completed</option>
            </select>

            {/* Sort Options */}
            <div className="flex items-center space-x-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as "title" | "frequency" | "acceptance")}
                className="backdrop-blur-sm bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 transition-all duration-300"
              >
                <option value="frequency" className="bg-gray-800">Sort by Frequency</option>
                <option value="title" className="bg-gray-800">Sort by Title</option>
                <option value="acceptance" className="bg-gray-800">Sort by Acceptance</option>
              </select>
              
              <button
                onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                className="p-2 backdrop-blur-sm bg-white/10 border border-white/20 rounded-lg text-gray-200 hover:text-white hover:bg-white/20 transition-all duration-300"
              >
                {sortOrder === "asc" ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
              </button>
            </div>

            {/* Items per page */}
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="backdrop-blur-sm bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 transition-all duration-300"
            >
              <option value={10} className="bg-gray-800">10 per page</option>
              <option value={25} className="bg-gray-800">25 per page</option>
              <option value={50} className="bg-gray-800">50 per page</option>
              <option value={100} className="bg-gray-800">100 per page</option>
            </select>

            {/* Clear Filters */}
            {(searchTerm || difficultyFilter !== "all" || statusFilter !== "all") && (
              <button
                onClick={clearFilters}
                className="px-4 py-2 bg-gradient-to-r from-red-500/20 to-pink-500/20 hover:from-red-500/30 hover:to-pink-500/30 text-red-300 rounded-lg border border-red-500/30 hover:border-red-400/50 transition-all duration-300 text-sm"
              >
                Clear Filters
              </button>
            )}
          </div>

          {/* Results Summary */}
          <div className="flex items-center justify-between text-sm text-gray-400 bg-white/5 rounded-lg px-4 py-2 backdrop-blur-sm">
            <span>
              Showing {startIndex + 1}-{Math.min(endIndex, filteredAndSortedProblems.length)} of {filteredAndSortedProblems.length} problems
            </span>
            <span className="text-cyan-400">
              Page {currentPage} of {totalPages}
            </span>
          </div>
        </div>
      </div>

      {/* Problems list */}
      <div className="p-6">
        <div className="space-y-4">
          {currentProblems.map((problem, index) => {
            const status = getProblemStatus(problem.Title);
            return (
              <div
                key={startIndex + index}
                className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl p-5 hover:bg-white/10 hover:border-white/20 transition-all duration-300 group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-3">
                    {/* Problem title and badges */}
                    <div className="flex items-center space-x-3 flex-wrap gap-2">
                      <h3 className="text-lg font-semibold text-gray-100 group-hover:text-white transition-colors">
                        {problem.Title}
                      </h3>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${getDifficultyColor(
                          problem.Difficulty
                        )}`}
                      >
                        {problem.Difficulty}
                      </span>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${getStatusColor(status)}`}
                      >
                        {status.replace("_", " ")}
                      </span>
                    </div>

                    {/* Problem stats */}
                    <div className="flex items-center space-x-6 text-sm text-gray-400">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>Frequency: {problem.Frequency}%</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Target className="w-4 h-4" />
                        <span>Success: {(problem["Acceptance Rate"] * 100).toFixed(1)}%</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Zap className="w-4 h-4" />
                        <span>Topics: {problem.Topics}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-3 ml-4">
                    <a
                      href={problem.Link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group/link flex items-center space-x-2 text-cyan-400 hover:text-cyan-300 transition-colors duration-200"
                    >
                      <span className="text-sm font-medium">Launch</span>
                      <ExternalLink className="w-4 h-4 group-hover/link:rotate-12 transition-transform duration-300" />
                    </a>
                    
                    <select
                      value={status}
                      onChange={(e) => updateProgress(problem.Title, e.target.value)}
                      className="backdrop-blur-sm bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 transition-all duration-300"
                    >
                      <option value="not_started" className="bg-gray-800">Not Started</option>
                      <option value="in_progress" className="bg-gray-800">In Progress</option>
                      <option value="completed" className="bg-gray-800">Completed</option>
                    </select>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="p-2 backdrop-blur-sm bg-white/10 border border-white/20 rounded-lg text-gray-200 hover:text-white hover:bg-white/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              {/* Page numbers */}
              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                        currentPage === pageNum
                          ? "bg-gradient-to-r from-cyan-500/30 to-purple-500/30 text-cyan-300 border border-cyan-400/40"
                          : "text-gray-400 hover:bg-white/10 hover:text-gray-200 border border-transparent hover:border-white/20"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="p-2 backdrop-blur-sm bg-white/10 border border-white/20 rounded-lg text-gray-200 hover:text-white hover:bg-white/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Quick jump to page */}
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-400">Jump to:</span>
              <input
                type="number"
                min={1}
                max={totalPages}
                value={currentPage}
                onChange={(e) => {
                  const page = parseInt(e.target.value);
                  if (page >= 1 && page <= totalPages) {
                    setCurrentPage(page);
                  }
                }}
                className="w-16 px-2 py-1 backdrop-blur-sm bg-white/10 border border-white/20 rounded-lg text-sm text-gray-200 text-center focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 transition-all duration-300"
              />
            </div>
          </div>
        )}

        {filteredAndSortedProblems.length === 0 && (
          <div className="text-center py-12 space-y-3">
            <Target className="w-16 h-16 mx-auto text-gray-500" />
            <div className="text-gray-400 font-medium">
              {searchTerm || difficultyFilter !== "all" || statusFilter !== "all" 
                ? "No problems match your filters"
                : "No problems in this timeframe"
              }
            </div>
            <div className="text-xs text-gray-500">
              {searchTerm || difficultyFilter !== "all" || statusFilter !== "all"
                ? "Try adjusting your search criteria"
                : "Neural scan returned empty matrix"
              }
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
