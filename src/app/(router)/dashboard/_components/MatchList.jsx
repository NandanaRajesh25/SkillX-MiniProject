"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { fetchUserInfoId } from "@/app/_utils/GlobalApi"; // Import function
import { updateMatchAcceptance } from "@/app/_utils/GlobalApi";

export default function MatchList({ matches, userId }) {
  const [userInfoId, setUserInfoId] = useState(null);
  const [updatingMatchId, setUpdatingMatchId] = useState(null);

  useEffect(() => {
    const getUserInfo = async () => {
      const id = await fetchUserInfoId(userId);
      setUserInfoId(id);
    };

    getUserInfo();
  }, [userId]);

  const handleConnect = async (match) => {
    if (!userInfoId) return;

    setUpdatingMatchId(match.id);

    const isUser1 = match.user1.id === userInfoId; // Correct comparison
    const updateField = isUser1 ? "accept1" : "accept2";

    console.log(`🔄 Updating match ${match.id}: Setting ${updateField} to true`);

    const success = await updateMatchAcceptance(match.id, updateField);

    if (success) {
      console.log(`✅ Match ${match.id} updated successfully`);
    } else {
      console.error(`❌ Failed to update match ${match.id}`);
    }

    setUpdatingMatchId(null);
  };

  if (userInfoId === null) return <p>Loading matches...</p>; // Wait until userInfoId is available

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">Possible Matches</h2>

      {matches.length === 0 ? (
        <p className="text-gray-500 text-lg">No matches found.</p>
      ) : (
        <ul className="space-y-4">
          {matches.map((match) => {
            const otherUser = match.user1.id === userInfoId ? match.user2 : match.user1;
            const otherUserId = otherUser.userId;

            return (
              <li key={match.id} className="p-5 bg-white shadow-md rounded-lg border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  <span className="text-slate-600">{otherUser.userName}</span>
                </h3>

                <p className="text-gray-700 mt-2">
                  <strong className="text-gray-900">Skill Exchange:</strong>
                  <span className="text-slate-500 ml-1">{match.skill1}</span> ↔
                  <span className="text-slate-500 ml-1">{match.skill2}</span>
                </p>

                <p className="text-gray-700 mt-1">
                  <strong className="text-gray-900">Match Score:</strong>
                  <span className="ml-1 font-medium text-slate-500">{match.score.toFixed(2)}</span>
                </p>

                <div className="mt-4 flex space-x-3">
                  {/* View Profile Button */}
                  <Link href={`/profile/${otherUserId}`} passHref>
                    <button className="px-4 py-2 bg-slate-600 text-white font-medium rounded-md hover:bg-slate-700 transition duration-300">
                      View Profile
                    </button>
                  </Link>

                  {/* Connect Button */}
                  <button
                    className={`px-4 py-2 text-white font-medium rounded-md transition duration-300 ${
                      updatingMatchId === match.id
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-slate-600 hover:bg-slate-700"
                    }`}
                    onClick={() => handleConnect(match)}
                    disabled={updatingMatchId === match.id}
                  >
                    {updatingMatchId === match.id ? "Connecting..." : "Connect"}
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
