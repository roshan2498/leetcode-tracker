import { NextRequest, NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";

// Required for static export
export const dynamic = 'force-static';
export const revalidate = false;

const execAsync = promisify(exec);

export async function POST(request: NextRequest) {
  try {
    // Verify the webhook secret (optional but recommended)
    const secret = request.headers.get("x-webhook-secret");
    if (secret !== process.env.WEBHOOK_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("🔄 Webhook received, syncing LeetCode data...");

    // Run the sync script
    const { stdout, stderr } = await execAsync("./sync-leetcode-data.sh");
    
    if (stderr) {
      console.error("Sync error:", stderr);
      return NextResponse.json({ error: "Sync failed", details: stderr }, { status: 500 });
    }

    console.log("✅ Sync completed:", stdout);
    return NextResponse.json({ 
      success: true, 
      message: "LeetCode data synced successfully",
      output: stdout 
    });

  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ 
      error: "Internal server error", 
      details: error instanceof Error ? error.message : "Unknown error" 
    }, { status: 500 });
  }
}

// Optional: Add GET endpoint for manual sync
export async function GET() {
  return NextResponse.json({ 
    message: "LeetCode data sync webhook endpoint",
    usage: "Send POST request to sync data"
  });
}
