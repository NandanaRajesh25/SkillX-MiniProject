import Link from "next/link";
import { useState } from "react";
import { checkOrCreateUserChat } from "@/app/_utils/GlobalApi";

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
        <p className="text-gray-400 text-lg text-center">
          Nothing to learn for now. Add some skills and find matches!
        </p>
      ) : (
        <ul className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {matches.map((match) => {
            const otherUser = match.user1.userId === userId ? match.user2 : match.user1;
            const otherUserId = otherUser.userId;
            const profilePic = otherUser.imageUrl || "/default-profile.jpg";

            return (
              <li
                key={match.id}
                className="p-5 bg-black backdrop-blur-lg text-white shadow-lg rounded-lg border border-black flex flex-col items-center text-center transition-all w-full aspect-square"
              >
                {/* Profile Picture */}
                <Link href={`/profile/${otherUserId}`} passHref>
                  <div className="w-32 h-32 rounded-full overflow-hidden border-2 border-white shadow-lg hover:scale-105 transition-transform duration-200 cursor-pointer">
                    <img
                      src={profilePic}
                      alt={otherUser.userName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </Link>

                {/* Match Details */}
                <div className="flex-grow mt-3">
                  <Link href={`/profile/${otherUserId}`} passHref>
                    <h3 className="text-lg font-semibold text-gray-300 cursor-pointer hover:underline">
                      {otherUser.userName}
                    </h3>
                  </Link>

                  <p className="mt-2 text-md text-gray-400">
                    <strong className="text-gray-400">Skill Exchange:</strong>
                    <br />
                    <span className="text-gray-300">{match.skill1}</span> ↔
                    <span className="text-gray-300">{match.skill2}</span>
                  </p>
                </div>

                {/* Learn Button */}
<button
  onClick={() => handleLearnClick(match)}
  disabled={loading[match.id]}
  className="group flex items-center justify-center gap-3 mt-4 p-3 text-[18px] text-gray-400 cursor-pointer rounded-md transition-all ease-in-out duration-300 bg-[#0b0f19] hover:bg-[#161b27] hover:text-gray-200 hover:shadow-lg hover:shadow-blue-900/50 disabled:opacity-50 disabled:cursor-not-allowed"
>
  {/* Text appears on hover */}
  <span className="hidden sm:block opacity-80 group-hover:opacity-100 transition-opacity duration-300">
    Teach & Learn!
  </span>
</button>

              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
