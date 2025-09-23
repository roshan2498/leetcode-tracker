"use client";

import { useState, useEffect } from "react";
import CompanySelector from "./CompanySelector";
import ProblemList from "./ProblemList";
import ProgressStats from "./ProgressStats";
// import ThemeToggle from "./ThemeToggle"; // Commented out for simplified client-side app
import { Zap, Brain } from "lucide-react";

export default function Dashboard() {
  const [selectedCompany, setSelectedCompany] = useState<string>("");
  const [companies, setCompanies] = useState<string[]>([]);

  // Load selected company from localStorage and fetch companies
  useEffect(() => {
    fetch("/api/companies")
      .then((res) => res.json())
      .then((data) => {
        setCompanies(data);
        
        // Try to restore from localStorage
        const savedCompany = localStorage.getItem("selectedCompany");
        
        if (savedCompany && data.includes(savedCompany)) {
          setSelectedCompany(savedCompany);
        } else if (data.length > 0) {
          setSelectedCompany(data[0]);
        }
      })
      .catch((error) => console.error("Error fetching companies:", error));
  }, []);

  // Save selected company to localStorage whenever it changes
  const handleCompanyChange = (company: string) => {
    setSelectedCompany(company);
    localStorage.setItem("selectedCompany", company);
  };

  const dotPattern = "data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.02'%3E%3Ccircle cx='7' cy='7' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E";
  const dotPatternLight = "data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.02'%3E%3Ccircle cx='7' cy='7' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-purple-100 to-slate-100 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900 relative overflow-hidden">
      {/* Background effects */}
      <div 
        className="absolute inset-0 opacity-40 dark:block hidden"
        style={{ backgroundImage: `url("${dotPattern}")` }}
      ></div>
      <div 
        className="absolute inset-0 opacity-40 dark:hidden block"
        style={{ backgroundImage: `url("${dotPatternLight}")` }}
      ></div>
      <div className="absolute top-0 left-1/4 w-72 h-72 bg-cyan-300 dark:bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 dark:opacity-10 animate-pulse"></div>
      <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-purple-300 dark:bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 dark:opacity-10 animate-pulse" style={{animationDelay: '2s'}}></div>
      
      {/* Glassmorphism header */}
      <header className="relative backdrop-blur-xl bg-white/80 dark:bg-white/5 border-b border-gray-200/30 dark:border-white/10 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-xl shadow-lg">
                <Brain className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  LeetCode Nexus
                </h1>
                <div className="flex items-center space-x-2 mt-1">
                  <Zap className="w-4 h-4 text-cyan-400" />
                  <span className="text-sm text-gray-600 dark:text-gray-300">Neural Problem Solver</span>
                </div>
              </div>
            </div>
            
            {/* Commented out theme toggle and profile options for simplified client-side app */}
            {/*
            <div className="flex items-center space-x-6">
              <ThemeToggle />
              
              <div className="flex items-center space-x-3 bg-white/60 dark:bg-white/5 backdrop-blur-sm rounded-2xl px-4 py-2 border border-gray-200/50 dark:border-white/10">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-cyan-400 via-purple-500 to-pink-500 p-0.5 shadow-lg ring-2 ring-cyan-300/30">
                  <div className="h-full w-full rounded-full bg-gray-900 dark:bg-gray-800 flex items-center justify-center text-white text-sm font-bold backdrop-blur-sm">
                    U
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    Local User
                  </div>
                  <div className="text-xs text-cyan-400">
                    Neural Pilot
                  </div>
                </div>
              </div>
            </div>
            */}
          </div>
        </div>
      </header>

      {/* Main content with enhanced styling */}
      <main className="relative max-w-7xl mx-auto py-8 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="space-y-8">
            {/* Top Section - Company Selector */}
            <div className="w-full">
              <CompanySelector
                companies={companies}
                selectedCompany={selectedCompany}
                onCompanyChange={handleCompanyChange}
              />
            </div>

            {/* Main Content Area */}
            {selectedCompany && (
              <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
                {/* Problem List - Takes most space */}
                <div className="xl:col-span-3">
                  <ProblemList company={selectedCompany} />
                </div>
                
                {/* Progress Stats - Sticky sidebar */}
                <div className="xl:col-span-1">
                  <div className="sticky top-8">
                    <ProgressStats selectedCompany={selectedCompany} />
                  </div>
                </div>
              </div>
            )}

            {/* Empty state when no company selected */}
            {!selectedCompany && (
              <div className="backdrop-blur-xl bg-white/80 dark:bg-white/5 border border-gray-200/30 dark:border-white/10 rounded-2xl shadow-2xl p-12 text-center">
                <div className="space-y-6">
                  <div className="w-24 h-24 mx-auto bg-gradient-to-br from-violet-400 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <Brain className="w-12 h-12 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold bg-gradient-to-r from-violet-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-3">
                      Neural Interface Ready
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300 text-lg mb-2">
                      Select a corporation to begin neural problem synthesis
                    </p>
                    <p className="text-gray-600 dark:text-gray-500 text-sm">
                      Choose from {companies.length} available corporate databases
                    </p>
                  </div>
                  <div className="flex items-center justify-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                      <span>Search & Filter</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
                      <span>Track Progress</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
                      <span>Neural Analytics</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
