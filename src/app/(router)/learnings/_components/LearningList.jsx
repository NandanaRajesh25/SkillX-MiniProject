import Link from "next/link";
import { useState } from "react";
import { checkOrCreateUserChat } from "@/app/_utils/GlobalApi"; // Import function

export default function LearningList({ matches, userId }) {
  const [loading, setLoading] = useState({});

  const handleLearnClick = async (match) => {
    setLoading((prev) => ({ ...prev, [match.id]: true }));

    try {
      console.log(`🔍 Checking UserChat for match ${match.id}...`);
      await checkOrCreateUserChat(match.id, match.user1.id, match.user2.id);
      console.log(`✅ UserChat verified/created for match ${match.id}`);

      // Redirect after ensuring UserChat exists
      window.location.href = `/learn/${userId}/${match.id}`;
    } catch (error) {
      console.error(`❌ Error handling learn button for match ${match.id}:`, error);
    }

    setLoading((prev) => ({ ...prev, [match.id]: false }));
  };

  return (
    <div className="mt-8">
      {matches.length === 0 ? (
        <p className="text-gray-500 text-lg">Nothing to learn for now. Add some skills, run some matches, and get started!</p>
      ) : (
        <ul className="space-y-4">
          {matches.map((match) => {
            const otherUser = match.user1.userId === userId ? match.user2 : match.user1;

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

                <div className="mt-4">
                  <button
                    className={`px-4 py-2 text-white font-medium rounded-md ${
                      loading[match.id] ? "bg-gray-400" : "bg-slate-600 hover:bg-slate-700"
                    } transition duration-300`}
                    onClick={() => handleLearnClick(match)}
                    disabled={loading[match.id]}
                  >
                    {loading[match.id] ? "Loading..." : "Learn"}
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
