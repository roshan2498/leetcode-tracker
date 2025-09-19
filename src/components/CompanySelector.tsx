"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { Search, X, Building2, Sparkles, ChevronDown, ChevronUp } from "lucide-react";

interface CompanySelectorProps {
  companies: string[];
  selectedCompany: string;
  onCompanyChange: (company: string) => void;
}

export default function CompanySelector({
  companies,
  selectedCompany,
  onCompanyChange,
}: CompanySelectorProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Advanced fuzzy search with scoring
  const filteredCompanies = useMemo(() => {
    if (!searchTerm) return companies;
    
    const searchLower = searchTerm.toLowerCase();
    
    return companies
      .map(company => {
        const companyLower = company.toLowerCase();
        let score = 0;
        
        // Exact match bonus
        if (companyLower === searchLower) score += 1000;
        
        // Starts with bonus
        if (companyLower.startsWith(searchLower)) score += 500;
        
        // Contains bonus
        if (companyLower.includes(searchLower)) score += 100;
        
        // Word boundary bonus
        const words = companyLower.split(/[\s\-_]/);
        words.forEach(word => {
          if (word.startsWith(searchLower)) score += 200;
          if (word === searchLower) score += 300;
        });
        
        // Character proximity bonus (fuzzy matching)
        let charIndex = 0;
        let consecutiveMatches = 0;
        for (let i = 0; i < companyLower.length && charIndex < searchLower.length; i++) {
          if (companyLower[i] === searchLower[charIndex]) {
            charIndex++;
            consecutiveMatches++;
            score += consecutiveMatches * 2; // Bonus for consecutive character matches
          } else {
            consecutiveMatches = 0;
          }
        }
        
        // Only include if all characters found
        if (charIndex === searchLower.length) {
          return { company, score };
        }
        
        return null;
      })
      .filter(Boolean)
      .sort((a, b) => b!.score - a!.score)
      .map(item => item!.company);
  }, [companies, searchTerm]);

  // Clear search when company changes
  useEffect(() => {
    setSearchTerm("");
    setHighlightedIndex(-1);
  }, [selectedCompany]);

  // Reset highlighted index when filtered companies change
  useEffect(() => {
    setHighlightedIndex(-1);
  }, [filteredCompanies]);

  const clearSearch = () => {
    setSearchTerm("");
    setHighlightedIndex(-1);
    searchInputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      clearSearch();
      setIsExpanded(false);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex(prev => 
        prev < filteredCompanies.length - 1 ? prev + 1 : 0
      );
      setIsExpanded(true);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex(prev => 
        prev > 0 ? prev - 1 : filteredCompanies.length - 1
      );
      setIsExpanded(true);
    } else if (e.key === "Enter" && highlightedIndex >= 0) {
      e.preventDefault();
      onCompanyChange(filteredCompanies[highlightedIndex]);
      setIsExpanded(false);
    } else if (e.key === "Tab") {
      setIsExpanded(false);
    }
  };

  const handleCompanySelect = (company: string) => {
    onCompanyChange(company);
    setIsExpanded(false);
    setSearchTerm("");
  };

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
    if (!isExpanded) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  };

  // Scroll highlighted item into view
  useEffect(() => {
    if (highlightedIndex >= 0 && listRef.current) {
      const highlightedElement = listRef.current.children[highlightedIndex] as HTMLElement;
      if (highlightedElement) {
        highlightedElement.scrollIntoView({
          block: 'nearest',
          behavior: 'smooth'
        });
      }
    }
  }, [highlightedIndex]);

  const highlightSearchTerm = (text: string, searchTerm: string) => {
    if (!searchTerm) return text;
    
    const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="bg-cyan-400/30 text-cyan-200 rounded px-1">
          {part}
        </mark>
      ) : part
    );
  };

  return (
    <div className="backdrop-blur-xl bg-white/80 dark:bg-white/5 border border-gray-200/30 dark:border-white/10 rounded-2xl shadow-2xl p-6 transition-all duration-300 hover:bg-white/90 dark:hover:bg-white/10">
      {/* Header */}
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-xl shadow-lg">
          <Building2 className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
            Company Hub
          </h2>
          <div className="flex items-center space-x-1">
            <Sparkles className="w-3 h-3 text-emerald-400" />
            <span className="text-xs text-gray-600 dark:text-gray-300">Select Target Corporation</span>
          </div>
        </div>
      </div>

      {/* Selected Company Display */}
      <div className="mb-4">
        <button
          onClick={toggleExpanded}
          className="w-full flex items-center justify-between p-4 bg-white/60 dark:bg-white/5 border border-gray-200/50 dark:border-white/20 rounded-xl hover:bg-white/80 dark:hover:bg-white/10 hover:border-gray-300/50 dark:hover:border-white/30 transition-all duration-300 group"
        >
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-cyan-400 rounded-full animate-pulse"></div>
            <span className="text-gray-900 dark:text-gray-100 font-medium truncate">
              {selectedCompany || "Select Corporation"}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-xs text-cyan-400 bg-cyan-400/10 px-2 py-1 rounded-lg">
              Active
            </span>
            {isExpanded ? (
              <ChevronUp className="w-4 h-4 text-gray-600 dark:text-gray-400 group-hover:text-gray-800 dark:group-hover:text-gray-200 transition-colors" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-600 dark:text-gray-400 group-hover:text-gray-800 dark:group-hover:text-gray-200 transition-colors" />
            )}
          </div>
        </button>
      </div>

      {/* Expandable Search Section */}
      <div className={`transition-all duration-300 overflow-hidden ${
        isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
      }`}>
        {/* Enhanced Search Input */}
        <div className="relative mb-4">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          </div>
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Neural search... (↑↓ navigate, Enter select, ESC close)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsExpanded(true)}
            className="block w-full pl-12 pr-12 py-3 border border-gray-300/50 dark:border-white/20 rounded-xl leading-5 bg-white/60 dark:bg-white/5 backdrop-blur-sm text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 transition-all duration-300 shadow-lg"
          />
          {searchTerm && (
            <button
              onClick={clearSearch}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors duration-200"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Company List with Keyboard Navigation */}
        <div 
          ref={listRef}
          className="space-y-1 max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-cyan-400/50 scrollbar-track-transparent"
        >
          {filteredCompanies.length === 0 ? (
            <div className="text-center py-6">
              <div className="text-gray-600 dark:text-gray-400 mb-2">
                {searchTerm ? "No corporations found matching your neural scan" : "No corporations available"}
              </div>
              <div className="text-xs text-gray-500">
                {searchTerm ? `"${searchTerm}" not detected in database` : "Neural scan complete"}
              </div>
            </div>
          ) : (
            <>
              {filteredCompanies.map((company, index) => (
                <button
                  key={company}
                  onClick={() => handleCompanySelect(company)}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group ${
                    selectedCompany === company
                      ? "bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-cyan-600 dark:text-cyan-300 border border-cyan-400/30 shadow-lg shadow-cyan-500/10"
                      : highlightedIndex === index
                      ? "bg-white/70 dark:bg-white/15 text-gray-900 dark:text-white border border-gray-300/50 dark:border-white/30 shadow-lg"
                      : "text-gray-700 dark:text-gray-300 hover:bg-white/60 dark:hover:bg-white/10 hover:text-gray-900 dark:hover:text-white border border-transparent hover:border-gray-300/30 dark:hover:border-white/20"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="truncate">
                      {highlightSearchTerm(company, searchTerm)}
                    </span>
                    <div className="flex items-center space-x-2">
                      {selectedCompany === company && (
                        <>
                          <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                          <span className="text-xs text-cyan-400">Current</span>
                        </>
                      )}
                      {highlightedIndex === index && selectedCompany !== company && (
                        <span className="text-xs text-gray-500 dark:text-gray-400">Press Enter</span>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </>
          )}
        </div>

        {/* Search Results Summary */}
        {searchTerm && (
          <div className="mt-4 flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 bg-white/60 dark:bg-white/5 rounded-lg px-3 py-2 backdrop-blur-sm">
            <span>Neural Scan Results</span>
            <span className="text-cyan-400 font-medium">
              {filteredCompanies.length} / {companies.length} corporations
            </span>
          </div>
        )}

        {/* Quick Access Shortcuts */}
        <div className="mt-4 flex flex-wrap gap-2">
          {['Google', 'Microsoft', 'Amazon', 'Apple', 'Meta'].filter(company => 
            companies.includes(company) && company !== selectedCompany
          ).slice(0, 3).map(company => (
            <button
              key={company}
              onClick={() => handleCompanySelect(company)}
              className="px-3 py-1 text-xs bg-white/60 dark:bg-white/5 hover:bg-white/80 dark:hover:bg-white/10 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 rounded-lg border border-gray-200/50 dark:border-white/10 hover:border-gray-300/50 dark:hover:border-white/20 transition-all duration-200"
            >
              {company}
            </button>
          ))}
          {companies.filter(company => 
            ['Google', 'Microsoft', 'Amazon', 'Apple', 'Meta'].includes(company) && company !== selectedCompany
          ).length > 3 && (
            <span className="px-3 py-1 text-xs text-gray-500">
              +{companies.filter(company => 
                ['Google', 'Microsoft', 'Amazon', 'Apple', 'Meta'].includes(company) && company !== selectedCompany
              ).length - 3} more
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
