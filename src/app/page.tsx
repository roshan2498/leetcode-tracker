"use client";

import { Suspense } from "react";
import Dashboard from "@/components/Dashboard";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
        <Dashboard />
      </Suspense>
    </div>
  );
}
