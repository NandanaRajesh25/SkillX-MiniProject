"use client";
import { matchUsers } from "@/app/matching/matchUsers";
import { useState } from "react";

export default function DashboardPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleMatchUsers = async () => {
    setLoading(true);
    setMessage("Running skill matching...");
    await matchUsers();
    setMessage("Matching complete!");
    setLoading(false);
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <button
        className={`px-4 py-2 text-white rounded ${loading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"}`}
        onClick={handleMatchUsers}
        disabled={loading}
      >
        {loading ? "Matching..." : "Run Skill Matching"}
      </button>
      {message && <p className="mt-4 text-green-600">{message}</p>}
    </div>
  );
}
