import Link from "next/link";
import { useState } from "react";
import { updateMatchAcceptance } from "@/app/_utils/GlobalApi"; // Import update function

export default function MatchInboxList({ matches, userId, refreshMatches }) {
  const [loading, setLoading] = useState({}); // Track loading state for each match

  const handleAccept = async (matchId, isUser1) => {
    setLoading((prev) => ({ ...prev, [matchId]: true }));

    const field = isUser1 ? "accept1" : "accept2"; // Determine which field to update
    const success = await updateMatchAcceptance(matchId, field);

    if (success) {
      console.log(`✅ Match ${matchId} updated successfully!`);
      refreshMatches(); // Refresh the match list after updating
    } else {
      console.error(`❌ Failed to update match ${matchId}`);
    }

    setLoading((prev) => ({ ...prev, [matchId]: false }));
  };

  return (
    <div className="mt-8">
      {matches.length === 0 ? (
        <p className="text-gray-500 text-lg">No incoming connect requests yet.</p>
      ) : (
        <ul className="space-y-4">
          {matches.map((match) => {
            const isUser1 = match.user1.id === userId;
            const otherUser = isUser1 ? match.user2 : match.user1;
            const otherUserId = otherUser.userId; // Use `userId` for correct URL

            return (
              <li key={match.id} className="p-5 bg-white shadow-md rounded-lg border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  <span className="text-slate-600">{otherUser.userName}</span>
                </h3>

                <p className="text-slate-700 mt-2">
                  <strong className="text-gray-900">Skill Exchange:</strong> 
                  <span className="text-slate-500 ml-1">{match.skill1}</span> ↔ 
                  <span className="text-slate-500 ml-1">{match.skill2}</span>
                </p>

                <p className="text-gray-700 mt-1">
                  <strong className="text-gray-900">Match Score:</strong> 
                  <span className="ml-1 font-medium text-slate-500">{match.score.toFixed(2)}</span>
                </p>

                <div className="mt-4 flex gap-4">
                  <Link href={`/profile/${otherUserId}`} passHref>
                    <button className="px-4 py-2 bg-slate-600 text-white font-medium rounded-md hover:bg-slate-700 transition duration-300">
                      View Profile
                    </button>
                  </Link>

                  {/* Accept Button */}
                  <button
                    className={`px-4 py-2 text-white font-medium rounded-md ${
                      loading[match.id] ? "bg-gray-400" : "bg-slate-600 hover:bg-slate-700"
                    } transition duration-300`}
                    onClick={() => handleAccept(match.id, isUser1)}
                    disabled={loading[match.id]}
                  >
                    {loading[match.id] ? "Accepting..." : "Accept"}
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
