import { useState } from "react";

export default function SkillForm({ onSave }) {
  const [skillName, setSkillName] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (skillName.trim()) {
      onSave(skillName);
      setSkillName("");
    }
  };

  return (
    <form 
      onSubmit={handleSubmit} 
      className="mb-4 p-4 border border-gray-700 rounded-lg shadow-md bg-gray-900 bg-opacity-70 backdrop-blur-md text-white"
    >
      {/* Input Field */}
      <input
        type="text"
        value={skillName}
        onChange={(e) => setSkillName(e.target.value)}
        placeholder="Enter skill to learn"
        className="p-3 w-full bg-gray-800 border border-gray-600 rounded-md outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 text-white placeholder-gray-400"
        required
      />

      {/* Save Button */}
      <button 
        type="submit" 
        className="mt-3 w-full p-3 rounded-md bg-blue-600 text-white font-semibold transition-all duration-300 hover:bg-blue-700 active:scale-95"
      >
        Save
      </button>
    </form>
  );
}
