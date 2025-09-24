import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { FALLBACK_COMPANIES } from "@/lib/companies";

export async function GET() {
  console.log("🔍 Companies API called");
  
  try {
    // For Vercel, try multiple paths to find the data
    const possiblePaths = [
      path.join(process.cwd(), "public", "companies.json"),
      path.join(process.cwd(), ".next", "static", "chunks", "companies.json"),
      "./public/companies.json",
      "public/companies.json",
      "/var/task/public/companies.json"
    ];
    
    console.log("🔍 Current working directory:", process.cwd());
    console.log("🔍 Trying paths:", possiblePaths);
    
    for (const filePath of possiblePaths) {
      try {
        if (fs.existsSync(filePath)) {
          console.log(`✅ Found companies.json at: ${filePath}`);
          const companiesData = fs.readFileSync(filePath, 'utf8');
          const companies = JSON.parse(companiesData);
          
          if (Array.isArray(companies) && companies.length > 0) {
            console.log(`📊 Returning ${companies.length} companies from ${filePath}`);
            return NextResponse.json(companies);
          } else {
            console.warn(`⚠️  Empty or invalid data in ${filePath}:`, companies);
          }
        } else {
          console.log(`❌ File not found: ${filePath}`);
        }
      } catch (pathError) {
        console.warn(`⚠️  Error accessing ${filePath}:`, pathError instanceof Error ? pathError.message : String(pathError));
      }
    }
    
    // Try to read from data directory as backup
    console.log("🔍 Trying data directory fallback...");
    const dataPath = path.join(process.cwd(), "public", "data");
    
    if (fs.existsSync(dataPath)) {
      console.log(`✅ Data directory exists: ${dataPath}`);
      const companies = fs.readdirSync(dataPath, { withFileTypes: true })
        .filter(dirent => {
          const isValid = dirent.isDirectory() && !dirent.name.startsWith(".");
          if (!isValid) {
            console.log(`⏭️  Skipping: ${dirent.name}`);
          }
          return isValid;
        })
        .map(dirent => dirent.name)
        .sort();

      if (companies.length > 0) {
        console.log(`📊 Generated ${companies.length} companies from data directory`);
        return NextResponse.json(companies);
      }
    } else {
      console.warn(`❌ Data directory not found: ${dataPath}`);
    }
    
    // If all else fails, return the hardcoded companies list
    console.warn("⚠️  Using emergency fallback companies list");
    console.log(`📊 Returning ${FALLBACK_COMPANIES.length} companies from fallback list`);
    
    return NextResponse.json(FALLBACK_COMPANIES);
    
  } catch (error) {
    console.error("❌ Critical error in companies API:", error);
    
    // Final emergency response - still return the companies
    console.warn("⚠️  Critical error, but returning fallback companies anyway");
    return NextResponse.json(FALLBACK_COMPANIES);
  }
}
