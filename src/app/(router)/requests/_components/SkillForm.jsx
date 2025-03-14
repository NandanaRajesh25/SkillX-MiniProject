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
    <form onSubmit={handleSubmit} className="mb-4 p-4 border rounded">
      <input
        type="text"
        value={skillName}
        onChange={(e) => setSkillName(e.target.value)}
        placeholder="Enter skill to learn"
        className="p-2 border rounded w-full"
        required
      />
      <button type="submit" className="mt-2 p-2 bg-slate-500 text-white rounded w-full">
        Save
      </button>
    </form>
  );
}
