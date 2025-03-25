"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { fetchUserInfoId, updateMatchAcceptance } from "@/app/_utils/GlobalApi";

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

    const isUser1 = match.user1.id === userInfoId;
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

  if (userInfoId === null) return <p>Loading matches...</p>;

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-semibold text-gray-200 mb-4">Possible Matches</h2>
      {matches.length === 0 ? (
        <p className="text-gray-600 text-lg">No matches found.</p>
      ) : (
        <ul className="space-y-4">
          {matches.map((match) => {
            const otherUser = match.user1.id === userInfoId ? match.user2 : match.user1;
            const otherUserId = otherUser.userId;

            return (
              <li key={match.id} className="flex items-center justify-between p-5 bg-[#0b0f19] shadow-md rounded-lg border border-black">
                {/* Left Section - Match Info */}
                <div>
                  <Link href={`/profile/${otherUserId}`} passHref>
                    <h3 className="text-lg font-semibold text-gray-800 cursor-pointer hover:underline">
                      <span className="text-gray-400">{otherUser.userName}</span>
                    </h3>
                  </Link>

                  <p className="text-gray-400 mt-2">
                    <strong className="text-gray-400">Skill Exchange:</strong>
                    <span className="text-gray-400 ml-1">{match.skill1}</span> ↔
                    <span className="text-gray-400 ml-1">{match.skill2}</span>
                  </p>
                  <p className="text-gray-400 mt-1">
                    <strong className="text-gray-400">Match Score:</strong>
                    <span className="ml-1 font-medium text-gray-400">{(match.score * 100).toFixed(2)}%</span>
                  </p>

                  <div className="mt-4 flex space-x-3">
                    {/* Connect Button */}
                    <button
                      onClick={() => handleConnect(match)}
                      className="relative flex items-center justify-start min-w-[40px] w-[40px] h-[40px] px-6 py-2 font-semibold text-white bg-[#0b0f19] rounded-full transition-all duration-700 ease-out group hover:w-40 hover:bg-blue-800"
                    >
                      {/* Circle stays on the left */}
                      <div className="absolute left-3 w-[25px] h-[25px] rounded-full transition-all duration-500 ease-out"></div>

                      {/* Text + Arrow (Aligned properly) */}
                      <span className="flex items-center space-x-2 pl-0 transition-all duration-700 ease-out">
                        <span className="text-gray-400">Connect</span>
                        <svg
                          className="w-[15px] h-[10px] transition-all duration-500 ease-out transform translate-x-0 group-hover:translate-x-1"
                          viewBox="0 0 13 10"
                        >
                          <path d="M1,5 L11,5" stroke="#000000" strokeWidth="2" strokeLinecap="round"></path>
                          <polyline points="8 1 12 5 8 9" stroke="#000000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></polyline>
                        </svg>
                      </span>
                    </button>
                  </div>
                </div>

                {/* Right Section - Profile Picture (Clickable) */}
                <Link href={`/profile/${otherUserId}`} passHref>
                  <div className="ml-4 flex-shrink-0 cursor-pointer">
                    <img
                      src={otherUser.imageUrl || "/default-profile.jpg"}
                      alt={otherUser.userName}
                      className="w-32 h-32 rounded-full border-4 border-gray-400 shadow-lg hover:scale-105 transition-transform duration-200"
                    />
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
