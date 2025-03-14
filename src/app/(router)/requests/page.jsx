"use client";
import { useState, useEffect } from "react";
import SkillForm from "./_components/SkillForm";
import SkillList from "./_components/SkillList";
import { fetchSkillRequests, addSkillRequest } from "../../_utils/GlobalApi";
import { useUser } from "@clerk/nextjs";

export default function SkillRequestsPage() {
  const { user } = useUser();
  const [skillRequests, setSkillRequests] = useState([]);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (user) {
      fetchSkillRequests(user.id).then(setSkillRequests);
    }
  }, [user]);

  const handleAddSkill = async (skillName) => {
    if (!user) return;
    const newSkill = await addSkillRequest(user.id, skillName);
    if (newSkill) {
      setSkillRequests([...skillRequests, newSkill]);
      setShowForm(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 border rounded-md shadow-md">
      <h2 className="text-2xl font-semibold mb-4">Skill Requests</h2>

      <button 
        onClick={() => setShowForm(!showForm)} 
        className="mb-4 p-2 bg-slate-500 text-white rounded"
      >
        {showForm ? "Cancel" : "Add New Requirement"}
      </button>

      {showForm && <SkillForm onSave={handleAddSkill} />}

      <SkillList skills={skillRequests} />
    </div>
  );
}
