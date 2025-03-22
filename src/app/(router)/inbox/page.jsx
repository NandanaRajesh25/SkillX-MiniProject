"use client";
import { useState, useEffect } from "react";
import { fetchHalfConfirmedMatches } from "@/app/_utils/GlobalApi";
import { useAuth } from "@clerk/nextjs"; // Assuming Clerk is used for auth
import MatchInboxList from "./_components/MatchInboxList"; // Modular component

export default function InboxPage() {
  const { userId } = useAuth(); // Get logged-in user ID
  const [loading, setLoading] = useState(true);
  const [matches, setMatches] = useState([]);
  const [message, setMessage] = useState("Loading confirmed matches...");

  // ✅ Fetch Matches on Page Load
  useEffect(() => {
    if (!userId) {
      console.warn("⚠️ No userId found!");
      setMessage("User not logged in.");
      return;
    }

    console.log("🔍 Fetching confirmed matches for user:", userId);

    const loadMatches = async () => {
      try {
        const fetchedMatches = await fetchHalfConfirmedMatches(userId);
        console.log("📡 Confirmed matches fetched from Hygraph:", fetchedMatches);

        if (!fetchedMatches || fetchedMatches.length === 0) {
          setMessage("No confirmed matches found.");
        } else {
          setMatches(fetchedMatches);
          setMessage("");
        }
      } catch (error) {
        console.error("❌ Error fetching confirmed matches:", error);
        setMessage("Failed to load matches.");
      }
      setLoading(false);
    };

    loadMatches();
  }, [userId]);

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Inbox</h1>

      {message && <p className="mt-4 text-slate-600">{message}</p>}

      {/* ✅ Show Matches if Available */}
      {!loading && matches.length > 0 && <MatchInboxList matches={matches} userId={userId} />}
    </div>
  );
}
