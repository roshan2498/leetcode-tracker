import { LeetCodeProblem, CompanyData } from "@/types";

export function parseCSV(csvText: string): LeetCodeProblem[] {
  const lines = csvText.trim().split("\n");
  
  return lines.slice(1).map(line => {
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
}

export async function loadCompanyData(companyName: string): Promise<CompanyData> {
  const timeframes = ["Thirty Days", "Three Months", "Six Months", "More Than Six Months", "All"];
  const problems: Record<string, LeetCodeProblem[]> = {};

  for (const timeframe of timeframes) {
    try {
      const response = await fetch(`/data/${companyName}/${timeframes.indexOf(timeframe) + 1}. ${timeframe}.csv`);
      if (response.ok) {
        const csvText = await response.text();
        problems[timeframe] = parseCSV(csvText);
      } else {
        problems[timeframe] = [];
      }
    } catch (error) {
      console.error(`Error loading ${timeframe} data for ${companyName}:`, error);
      problems[timeframe] = [];
    }
  }

  return {
    name: companyName,
    problems: {
      "Thirty Days": problems["Thirty Days"],
      "Three Months": problems["Three Months"],
      "Six Months": problems["Six Months"],
      "More Than Six Months": problems["More Than Six Months"],
      "All": problems["All"],
    },
  };
}

export function getDifficultyColor(difficulty: string): string {
  switch (difficulty.toLowerCase()) {
    case "easy":
      return "text-green-600 bg-green-100";
    case "medium":
      return "text-yellow-600 bg-yellow-100";
    case "hard":
      return "text-red-600 bg-red-100";
    default:
      return "text-gray-600 bg-gray-100";
  }
}

export function getStatusColor(status: string): string {
  switch (status) {
    case "completed":
      return "text-green-600 bg-green-100";
    case "in_progress":
      return "text-blue-600 bg-blue-100";
    case "not_started":
      return "text-gray-600 bg-gray-100";
    default:
      return "text-gray-600 bg-gray-100";
  }
}
