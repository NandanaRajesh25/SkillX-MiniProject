import { deleteSkillRequest } from "../../../_utils/GlobalApi";
import SkillCard from "./SkillCard";

export default function SkillList({ skills, userId, onSkillDeleted }) {
  const handleDelete = async (skillId) => {
    if (!skillId) {
      console.error("❌ Error: skillId is missing!");
      return;
    }

    const success = await deleteSkillRequest(userId, skillId);
    if (success) {
      onSkillDeleted(skillId); // Update UI
    }
  };

  return (
    <div>
      <h3 className="text-xl font-semibold mb-2">Your Skill Requirements</h3>
      {skills.length > 0 ? (
        skills.map((skill) => <SkillCard key={skill.id} skill={skill} onDelete={handleDelete} />)
      ) : (
        <p className="text-gray-500">No skill requests added yet.</p>
      )}
    </div>
  );
}
