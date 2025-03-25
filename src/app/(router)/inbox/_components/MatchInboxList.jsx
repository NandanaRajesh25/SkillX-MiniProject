import Link from "next/link";
import { useState } from "react";
import { completeAcceptMatch } from "@/app/_utils/GlobalApi";

export default function MatchInboxList({ matches, userId, refreshMatches }) {
  const [loading, setLoading] = useState({});

  const handleAccept = async (matchId) => {
    setLoading((prev) => ({ ...prev, [matchId]: true }));
    console.log(`🔄 Accepting match: ${matchId}`);

    const success = await completeAcceptMatch(matchId);

    if (success) {
      console.log(`✅ Match ${matchId} fully accepted!`);
      setTimeout(() => {
        refreshMatches();
      }, 500);
    } else {
      console.error(`❌ Failed to fully accept match ${matchId}`);
    }

    setLoading((prev) => ({ ...prev, [matchId]: false }));
  };

  return (
    <div className="mt-8">
      {matches.length === 0 ? (
        <p className="text-gray-400 text-lg text-center">
          No incoming connect requests yet.
        </p>
      ) : (
        <ul className="grid grid-cols-2 gap-6">
          {matches.map((match) => {
            const otherUser =
              match.user1.userId === userId ? match.user2 : match.user1;
            const otherUserId = otherUser.userId;
            const profilePic = otherUser.imageUrl || "/default-profile.jpg";

            return (
              <li
                key={match.id}
                className="p-5 bg-black backdrop-blur-lg text-white shadow-lg rounded-lg border border-white/20 flex items-center transition-all"
              >
                {/* Profile Picture */}
                <Link href={`/profile/${otherUserId}`} passHref>
                  <div className="mr-4 flex-shrink-0 cursor-pointer">
                    <img
                      src={profilePic}
                      alt={otherUser.userName}
                      className="w-32 h-32 rounded-full border-2 border-black shadow-lg hover:scale-105 transition-transform duration-200"
                    />
                  </div>
                </Link>

                {/* Match Details */}
                <div className="flex-grow">
                  <Link href={`/profile/${otherUserId}`} passHref>
                    <h3 className="text-lg font-semibold text-gray-300 cursor-pointer hover:underline">
                      {otherUser.userName}
                    </h3>
                  </Link>

                  <p className="mt-2">
                    <strong className="text-gray-400">Skill Exchange:</strong>
                    <span className="text-gray-300 ml-1">{match.skill1}</span> ↔
                    <span className="text-gray-300 ml-1">{match.skill2}</span>
                  </p>

                  <p className="mt-1">
                    <strong className="text-gray-400">Match Score:</strong>
                    <span className="ml-1 font-medium text-gray-300">
                      {match.score.toFixed(2)}
                    </span>
                  </p>

                  <div className="mt-4 flex gap-4">
                    {/* Accept Button with Glassmorphism */}
                    <button
                      onClick={() => handleAccept(match.id)}
                      disabled={loading[match.id]}
                      className={`relative flex items-center justify-start min-w-[40px] w-[40px] h-[40px] px-6 py-2 font-semibold text-white rounded-full backdrop-blur-md transition-all duration-700 ease-out group hover:w-40 hover:bg-blue-800 ${
                        loading[match.id] ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                    >
                      {/* Circle stays on the left */}
                      <div className="absolute left-3 w-[25px] h-[25px] rounded-full transition-all duration-500 ease-out"></div>

                      {/* Text + Check Icon */}
                      <span className="flex items-center space-x-2 pl-0 transition-all duration-700 ease-out">
                        <span className="text-gray-300">
                          {loading[match.id] ? "Accepting..." : "Accept"}
                        </span>
                        <svg
                          className="w-[15px] h-[10px] transition-all duration-500 ease-out transform translate-x-0 group-hover:translate-x-1"
                          viewBox="0 0 13 10"
                        >
                          <path
                            d="M1,5 L11,5"
                            stroke="#000000"
                            strokeWidth="2"
                            strokeLinecap="round"
                          ></path>
                          <polyline
                            points="8 1 12 5 8 9"
                            stroke="#000000"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          ></polyline>
                        </svg>
                      </span>
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
