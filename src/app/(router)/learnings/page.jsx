"use client";
import { useState, useEffect } from "react";
import { fetchConfirmedLearningMatches } from "@/app/_utils/GlobalApi";
import { useAuth } from "@clerk/nextjs"; // Assuming Clerk is used for auth
import LearningList from "./_components/LearningList"; // Modular component

export default function LearningsPage() {
  const { userId } = useAuth(); 
  const [loading, setLoading] = useState(true);
  const [matches, setMatches] = useState([]);
  const [message, setMessage] = useState("Loading confirmed learnings...");

  useEffect(() => {
    if (!userId) {
      console.warn("⚠️ No userId found!");
      setMessage("User not logged in.");
      return;
    }

    console.log("🔍 Fetching confirmed learning matches for user:", userId);

    const loadMatches = async () => {
      try {
        const fetchedMatches = await fetchConfirmedLearningMatches(userId);
        console.log("📡 Confirmed learning matches fetched:", fetchedMatches);

        if (!fetchedMatches || fetchedMatches.length === 0) {
          setMessage("No learnings found.");
        } else {
          setMatches(fetchedMatches);
          setMessage("");
        }
      } catch (error) {
        console.error("❌ Error fetching confirmed learnings:", error);
        setMessage("Failed to load learnings.");
      }
      setLoading(false);
    };

    loadMatches();
  }, [userId]);

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">My Learnings</h1>

      {message && <p className="mt-4 text-slate-600">{message}</p>}

      {!loading && matches.length > 0 && (
        <LearningList matches={matches} userId={userId} />
      )}
    </div>
  );
}
