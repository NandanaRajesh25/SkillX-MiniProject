export default function MatchDetails({ match, userId }) {
    const otherUser = match.user1.userId === userId ? match.user2 : match.user1;
    const learningSkill = match.user1.userId === userId ? match.skill1 : match.skill2;
    const teachingSkill = match.user1.userId === userId ? match.skill2 : match.skill1;
  
    return (
      <div className="p-4 bg-gray-50 rounded-lg">
        <h2 className="text-xl font-bold">{otherUser.name} (@{otherUser.userName})</h2>
        <p className="text-gray-600 mt-2">
          <strong>You're learning:</strong> {learningSkill}
        </p>
        <p className="text-gray-600">
          <strong>They're learning:</strong> {teachingSkill}
        </p>
      </div>
    );
  }
  