"use client";
import { useState, useEffect } from "react";
import { fetchHalfConfirmedMatches } from "@/app/_utils/GlobalApi";
import { useAuth } from "@clerk/nextjs"; 
import MatchInboxList from "./_components/MatchInboxList"; 

export default function InboxPage() {
  const { userId } = useAuth(); 
  const [loading, setLoading] = useState(true);
  const [matches, setMatches] = useState([]);
  const [message, setMessage] = useState("Loading connection requests...");

  const loadMatches = async () => {
    if (!userId) {
      console.warn("⚠️ No userId found!");
      //setMessage("User not logged in.");
      return;
    }

    console.log("🔍 Fetching connection requests for user:", userId);
    setLoading(true);

    try {
      const fetchedMatches = await fetchHalfConfirmedMatches(userId);
      console.log("📡 Connection requests fetched:", fetchedMatches);

      if (fetchedMatches.length === 0) {
        setMatches([]); // ✅ Ensure state updates
        setMessage("No connection requests found.");
      } else {
        setMatches([...fetchedMatches]); // ✅ Force state update
        setMessage("");
      }
    } catch (error) {
      console.error("❌ Error fetching connection requests:", error);
      setMessage("Failed to load connection requests.");
    }

    setLoading(false);
  };

  useEffect(() => {
    if (userId) {
      loadMatches();
    }
  }, [userId]);

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Inbox</h1>

      {message && <p className="mt-4 text-slate-600">{message}</p>}

      {!loading && matches.length > 0 && (
        <MatchInboxList matches={matches} userId={userId} refreshMatches={loadMatches} />
      )}
    </div>
  );
}
