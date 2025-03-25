import { useRouter } from "next/navigation";

export default function MatchDetails({ match, userId }) {
  const router = useRouter();

  const otherUser = match.user1.userId === userId ? match.user2 : match.user1;
  const learningSkill = match.user1.userId === userId ? match.skill1 : match.skill2;
  const teachingSkill = match.user1.userId === userId ? match.skill2 : match.skill1;

  const handleProfileRedirect = () => {
    router.push(`/profile/${otherUser.userId}`);
  };

  return (
    <div className="p-6 rounded-lg shadow-lg  text-gray-300">
      <h2 
        className="text-2xl font-semibold text-blue-400 hover:text-blue-300 cursor-pointer transition-all duration-300"
        onClick={handleProfileRedirect}
      >
        {otherUser.name} (@{otherUser.userName})
      </h2>

      <div className="mt-4">
        <p className="text-lg text-gray-400">
          <strong className="text-gray-200">You're learning:</strong> 
          <span className="ml-1 text-blue-300">{learningSkill}</span>
        </p>
        <p className="text-lg text-gray-400 mt-2">
          <strong className="text-gray-200">They're learning:</strong> 
          <span className="ml-1 text-blue-300">{teachingSkill}</span>
        </p>
      </div>
    </div>
  );
}
