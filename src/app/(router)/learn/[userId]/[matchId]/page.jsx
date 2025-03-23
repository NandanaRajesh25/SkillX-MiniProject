"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { fetchMatchDetails, fetchChat } from "@/app/_utils/GlobalApi";
import MatchDetails from "./_components/MatchDetails";
import ChatBox from "./_components/ChatBox";

export default function LearnPage() {
  const { userId, matchId } = useParams();
  const [match, setMatch] = useState(null);
  const [chat, setChat] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const matchData = await fetchMatchDetails(matchId);
        setMatch(matchData);
        
        const chatData = await fetchChat(matchId);
        setChat(chatData);
      } catch (error) {
        console.error("Error loading learn page:", error);
      }
      setLoading(false);
    };

    loadData();
  }, [matchId]);

  if (loading) return <p className="text-center text-gray-600">Loading...</p>;
  if (!match) return <p className="text-center text-red-600">Match not found!</p>;

  return (
    <div className="flex h-screen">
      {/* Left Section - Match Details */}
      <div className="w-1/3 p-6 border-r">
        <MatchDetails match={match} userId={userId} />
      </div>

      {/* Right Section - Chat Interface */}
      <div className="w-2/3 p-6">
        <ChatBox chat={chat} matchId={matchId} userId={userId} />
      </div>
    </div>
  );
}
