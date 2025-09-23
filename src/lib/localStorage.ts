import { UserProgress } from "@/types";

const PROGRESS_KEY = "leetcode_progress";

// Extended UserProgress with additional fields for local storage
interface LocalUserProgress extends Omit<UserProgress, 'completedAt'> {
  id: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string | null;
}

export const getProgressFromStorage = (): LocalUserProgress[] => {
  if (typeof window === "undefined") return [];
  
  try {
    const stored = localStorage.getItem(PROGRESS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error("Error reading progress from localStorage:", error);
    return [];
  }
};

export const saveProgressToStorage = (progress: LocalUserProgress[]): void => {
  if (typeof window === "undefined") return;
  
  try {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
  } catch (error) {
    console.error("Error saving progress to localStorage:", error);
  }
};

export const updateProgressInStorage = (updatedProgress: LocalUserProgress): LocalUserProgress[] => {
  const allProgress = getProgressFromStorage();
  
  // Find and update existing progress or add new
  const existingIndex = allProgress.findIndex(
    p => p.problemId === updatedProgress.problemId && p.company === updatedProgress.company
  );
  
  if (existingIndex >= 0) {
    allProgress[existingIndex] = updatedProgress;
  } else {
    allProgress.push(updatedProgress);
  }
  
  saveProgressToStorage(allProgress);
  return allProgress;
};

export const getProgressForCompany = (company: string): LocalUserProgress[] => {
  const allProgress = getProgressFromStorage();
  return allProgress.filter(p => p.company === company);
};

export const createProgress = (
  problemId: string,
  company: string,
  difficulty: string,
  title: string,
  status: "not_started" | "in_progress" | "completed"
): LocalUserProgress => {
  return {
    id: `${company}-${problemId}-${Date.now()}`,
    problemId,
    company,
    difficulty,
    title,
    status,
    completedAt: status === "completed" ? new Date().toISOString() : null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}; 