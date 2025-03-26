import { Trash2 } from "lucide-react";

export default function SkillCard({ skill, onDelete }) {
  return (
    <div className="p-4 mb-2 rounded-lg shadow-md flex justify-between items-center bg-gray-900 bg-opacity-70 backdrop-blur-md text-white transition-all duration-300 hover:bg-opacity-80">
      <p className="text-lg font-medium text-gray-200">{skill.name}</p>

      {/* Delete Button */}
      <button 
        onClick={() => onDelete(skill.id)} 
        className="p-2 rounded-md transition-all duration-300 text-gray-500 hover:text-gray-700 hover:scale-110 active:scale-95"
      >
        <Trash2 size={20} />
      </button>
    </div>
  );
}
