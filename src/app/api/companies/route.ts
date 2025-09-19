import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  try {
    const dataPath = path.join(process.cwd(), "public", "data");
    const companies = fs.readdirSync(dataPath, { withFileTypes: true })
      .filter(dirent => {
        // Only include directories and exclude hidden folders
        return dirent.isDirectory() && !dirent.name.startsWith(".");
      })
      .map(dirent => dirent.name)
      .sort();

    return NextResponse.json(companies);
  } catch (error) {
    console.error("Error fetching companies:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
