import { deleteSkillRequirement } from "../../../_utils/GlobalApi";
import SkillCard from "./SkillCard";

export default function SkillList({ skills, userId, onSkillDeleted }) {
  const handleDelete = async (skillId) => {
    if (!skillId) {
      console.error("❌ Error: skillId is missing!");
      return;
    }

    const success = await deleteSkillRequirement(userId, skillId);
    if (success) {
      onSkillDeleted(skillId);
    }
  };

  return (
    <div className="mt-4 space-y-3">
      {skills.length > 0 ? (
        skills.map((skill) => (
          <SkillCard key={skill.id} skill={skill} onDelete={handleDelete} />
        ))
      ) : (
        <p className="text-gray-400 text-center animate-fadeIn">✨ Add some skills to start your learning journey!</p>
      )}
    </div>
  );
}
