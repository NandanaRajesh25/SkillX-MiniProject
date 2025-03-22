"use client";
import { useState, useEffect } from "react";
import { fetchUserMatches } from "@/app/_utils/GlobalApi";
import { matchUsers } from "@/app/matching/matchUsers";
import { useAuth } from "@clerk/nextjs"; // Assuming Clerk is used for auth
import MatchList from "./_components/MatchList"; // Modular component to display matches

export default function DashboardPage() {
  const { userId } = useAuth(); // Get logged-in user ID
  const [loading, setLoading] = useState(false);
  const [matches, setMatches] = useState([]);
  const [message, setMessage] = useState("Loading matches...");

  // ✅ Fetch Matches on Page Load
  useEffect(() => {
    if (!userId) {
      console.warn("⚠️ No userId found!");
      setMessage("User not logged in.");
      return;
    }

    console.log("🔍 Fetching matches for user:", userId);

    const loadMatches = async () => {
      setLoading(true);
      try {
        const fetchedMatches = await fetchUserMatches(userId);
        console.log("📡 Matches fetched from Hygraph:", fetchedMatches);

        if (!fetchedMatches || fetchedMatches.length === 0) {
          setMessage("No matches found.");
        } else {
          setMatches(fetchedMatches);
          setMessage("");
        }
      } catch (error) {
        console.error("❌ Error fetching matches:", error);
        setMessage("Failed to load matches.");
      }
      setLoading(false);
    };

    loadMatches();
  }, [userId]);

  // ✅ Handle Skill Matching
  const handleMatchUsers = async () => {
    setLoading(true);
    setMessage("Running skill matching...");
    console.log("🚀 Running skill matching...");
    
    await matchUsers();
    
    console.log("✅ Matching complete! Reloading matches...");
    setMessage("Matching complete! Fetching updated matches...");

    // Fetch updated matches after running the matchUsers function
    const updatedMatches = await fetchUserMatches(userId);
    console.log("📡 Updated matches fetched:", updatedMatches);

    if (updatedMatches.length === 0) {
      setMessage("No new matches found.");
    } else {
      setMatches(updatedMatches);
      setMessage("");
    }

    setLoading(false);
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>

      <button
        className={`px-4 py-2 text-white rounded ${loading ? "bg-gray-400" : "bg-slate-600 hover:bg-slate-700"}`}
        onClick={handleMatchUsers}
        disabled={loading}
      >
        {loading ? "Matching..." : "Run Skill Matching"}
      </button>

      {message && <p className="mt-4 text-slate-600">{message}</p>}

      {/* ✅ Pass userId to MatchList */}
      {matches.length > 0 && <MatchList matches={matches} userId={userId} />}
    </div>
  );
}
