import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  try {
    // First try to read companies from the data directory (for local/full server deployments)
    const dataPath = path.join(process.cwd(), "public", "data");
    
    if (fs.existsSync(dataPath)) {
      const companies = fs.readdirSync(dataPath, { withFileTypes: true })
        .filter(dirent => {
          // Only include directories and exclude hidden folders
          return dirent.isDirectory() && !dirent.name.startsWith(".");
        })
        .map(dirent => dirent.name)
        .sort();

      console.log(`📊 API: Found ${companies.length} companies from data directory`);
      return NextResponse.json(companies);
    }
    
    // Fallback: read from pre-generated companies.json (for serverless deployments like Vercel)
    const companiesJsonPath = path.join(process.cwd(), "public", "companies.json");
    
    if (fs.existsSync(companiesJsonPath)) {
      const companiesData = fs.readFileSync(companiesJsonPath, 'utf8');
      const companies = JSON.parse(companiesData);
      
      console.log(`📊 API: Found ${companies.length} companies from companies.json`);
      return NextResponse.json(companies);
    }
    
    // If neither source is available, return empty array
    console.warn("⚠️  API: No companies data found, returning empty array");
    return NextResponse.json([]);
    
  } catch (error) {
    console.error("❌ API Error fetching companies:", error);
    
    // Final fallback: try to return companies.json even if there was an error
    try {
      const companiesJsonPath = path.join(process.cwd(), "public", "companies.json");
      const companiesData = fs.readFileSync(companiesJsonPath, 'utf8');
      const companies = JSON.parse(companiesData);
      
      console.log(`📊 API: Fallback to companies.json with ${companies.length} companies`);
      return NextResponse.json(companies);
    } catch (fallbackError) {
      console.error("❌ API: Fallback also failed:", fallbackError);
      return NextResponse.json({ error: "Could not load companies data" }, { status: 500 });
    }
  }
}
