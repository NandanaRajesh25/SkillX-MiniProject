import { Trash2 } from "lucide-react";

export default function SkillCard({ skill, onDelete }) {
  return (
    <div className="p-4 mb-2 border rounded-md shadow-sm flex justify-between items-center">
      <p className="text-lg font-medium">{skill.name}</p>
      {/* <button onClick={() => onDelete(skill.id)} className="text-slate-500 hover:text-slate-700">
        <Trash2 size={20} />
      </button> */}
    </div>
  );
}
