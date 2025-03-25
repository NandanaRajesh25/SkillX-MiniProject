"use client";
import { useState, useEffect } from "react";
import { fetchUserMatches } from "@/app/_utils/GlobalApi";
import { matchUsers } from "@/app/matching/matchUsers";
import { useAuth } from "@clerk/nextjs";
import MatchList from "./_components/MatchList";

export default function DashboardPage() {
  const { userId } = useAuth();
  const [loading, setLoading] = useState(false);
  const [matches, setMatches] = useState([]);
  const [message, setMessage] = useState("Loading matches...");

  useEffect(() => {
    if (!userId) {
      setMessage("User not logged in.");
      return;
    }

    const loadMatches = async () => {
      setLoading(true);
      try {
        const fetchedMatches = await fetchUserMatches(userId);
        setMatches(fetchedMatches || []);
        setMessage(fetchedMatches.length ? "" : "No matches found.");
      } catch (error) {
        setMessage("Failed to load matches.");
      }
      setLoading(false);
    };

    loadMatches();
  }, [userId]);

  const handleMatchUsers = async () => {
    setLoading(true);
    setMessage("Running skill matching...");
    await matchUsers();
    const updatedMatches = await fetchUserMatches(userId);
    setMatches(updatedMatches);
    setMessage(updatedMatches.length ? "" : "No new matches found.");
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      {/* Dashboard Card */}
      <div className="bg-white bg-opacity-10 backdrop-blur-md p-6 rounded-xl shadow-lg w-full max-w-3xl">
        {/* <h1 className="text-2xl font-bold text-gray-500 mb-4 text-center">Dashboard</h1> */}

        {/* Match Button */}
        <button
          className={`w-full py-2 text-gray-300 font-medium rounded-lg transition duration-300 shadow-lg bg-gradient-to-r from-[#070a19] to-[#10121f] 
            ${loading ? "bg-[#0b0f19] cursor-not-allowed" : "hover:shadow-[0px_0px_15px_#2b3050,0px_0px_25px_#3a3f66] hover:text-gray-100 hover:from-[#20243a] hover:to-[#16182b] active:shadow-[0px_0px_20px_#32385a,0px_0px_35px_#464d7a] active:text-gray-50"}
          `}
          onClick={handleMatchUsers}
          disabled={loading}
        >
          {loading ? "Matching..." : "Run Skill Matching"}
        </button>


        {/* Message Display */}
        {message && <p className="mt-4 text-gray-300 text-center">{message}</p>}

        {/* Match List */}
        {matches.length > 0 && <MatchList matches={matches} userId={userId} />}
      </div>
    </div>
  );
}
