export interface LeetCodeProblem {
  Difficulty: string;
  Title: string;
  Frequency: number;
  "Acceptance Rate": number;
  Link: string;
  Topics: string;
}

export interface CompanyData {
  name: string;
  problems: {
    "Thirty Days": LeetCodeProblem[];
    "Three Months": LeetCodeProblem[];
    "Six Months": LeetCodeProblem[];
    "More Than Six Months": LeetCodeProblem[];
    "All": LeetCodeProblem[];
  };
}

export interface ProgressStatus {
  not_started: number;
  in_progress: number;
  completed: number;
}

export interface UserProgress {
  problemId: string;
  company: string;
  difficulty: string;
  title: string;
  status: "not_started" | "in_progress" | "completed";
  completedAt?: Date;
}
