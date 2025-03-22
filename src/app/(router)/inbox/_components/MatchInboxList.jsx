import Link from "next/link";

export default function MatchInboxList({ matches, userId }) {
  return (
    <div className="mt-8">
      {/* <h2 className="text-2xl font-semibold text-gray-800 mb-4">Confirmed Matches</h2> */}

      {matches.length === 0 ? (
        <p className="text-gray-500 text-lg">No incoming connect requests yet.</p>
      ) : (
        <ul className="space-y-4">
          {matches.map((match) => {
            const otherUser = match.user1.id === userId ? match.user2 : match.user1;
            const otherUserId = otherUser.userId; // Use user-defined ID for URL

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

                <div className="mt-4">
                  <Link href={`/profile/${otherUserId}`} passHref>
                    <button className="px-4 py-2 bg-slate-600 text-white font-medium rounded-md hover:bg-slate-700 transition duration-300">
                      View Profile
                    </button>
                  </Link>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
