"use client";
import { useState, useEffect } from "react";
import SkillForm from "./_components/SkillForm";
import SkillList from "./_components/SkillList";
import { fetchSkillRequests, addSkillRequest } from "../../_utils/GlobalApi";
import { useUser } from "@clerk/nextjs";

export default function SkillRequestsPage() {
  const { user, isLoaded } = useUser();
  const [skillRequests, setSkillRequests] = useState([]);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (isLoaded && user) {
      fetchSkillRequests(user.id).then(setSkillRequests);
    }
  }, [isLoaded, user]);

  const handleAddSkill = async (skillName) => {
    if (!user) return;
    const newSkill = await addSkillRequest(user.id, skillName);
    if (newSkill) {
      setSkillRequests([...skillRequests, newSkill]);
      setShowForm(false);
    }
  };

  const handleDeleteSkill = (skillId) => {
    setSkillRequests((prevSkills) => prevSkills.filter((skill) => skill.id !== skillId));
  };

  if (!isLoaded) {
    return <p className="text-gray-400 text-center animate-pulse">Loading...</p>;
  }

  if (!user) {
    return <p className="text-red-500 text-center">User not found. Please log in.</p>;
  }

  return (
    <div className="max-w-2xl mx-auto p-6 rounded-lg shadow-lg bg-gray-900 bg-opacity-60 backdrop-blur-md text-white">
      <h2 className="text-2xl font-semibold mb-4 text-gray-200">What do you want to learn?</h2>

      {/* Add Skill Button */}
      <button
  onClick={() => setShowForm(!showForm)}
  className={`group flex w-full items-center justify-center gap-3 px-4 py-3 text-[18px] font-semibold rounded-md bg-[#0b0f19] transition-all ease-in-out duration-300
    ${showForm ? "bg-blue-900 text-gray-400 hover:bg-gray-700 hover:text-gray-300" 
               : "bg-blue:850 text-gray-200 hover:bg-blue-950 hover:text-white hover:shadow-lg hover:shadow-blue-900/50"}`}
>
  <span className="hidden sm:block opacity-80 group-hover:opacity-100 transition-opacity duration-300">
    {showForm ? "Cancel" : "➕ Add skill"}
  </span>
</button>


      {/* Smooth Form Animation */}
      {showForm && (
        <div className="animate-fadeIn">
          <SkillForm onSave={handleAddSkill} />
        </div>
      )}

      {/* Skill List */}
      <SkillList skills={skillRequests} userId={user?.id} onSkillDeleted={handleDeleteSkill} />
    </div>
  );
}
