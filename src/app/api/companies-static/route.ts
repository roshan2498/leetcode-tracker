import { NextResponse } from "next/server";
import { FALLBACK_COMPANIES } from "@/lib/companies";

// Static companies endpoint that doesn't rely on file system
export async function GET() {
  console.log("🔍 Static companies API called");
  console.log(`📊 Returning ${FALLBACK_COMPANIES.length} companies from static list`);
  
  return NextResponse.json(FALLBACK_COMPANIES);
} 