"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useParams } from "next/navigation"; // Ensure useParams is imported
import { createUserProfile, syncUserToHygraph } from "../../../../_utils/GlobalApi";

export default function ProfileEditor() {
  const { user, isLoaded } = useUser();
  const { userId } = useParams(); // Get userId from URL

  if (!isLoaded) return <p>Loading...</p>;
  if (!userId) return <p>Error: User ID not found</p>; // Handle missing userId

  const [editing, setEditing] = useState({ username: false, name: false, skills: false });
  const [formData, setFormData] = useState({
    username: user?.username || "",
    name: "",
    skills: "",
  });

  const handleSave = async () => {
    if (typeof window === "undefined") return;

    const userData = {
      userId, // Include userId
      username: formData.username,
      email: user?.emailAddresses?.[0]?.emailAddress || "",
      name: formData.name,
      skills: formData.skills,
    };

    try {
      await syncUserToHygraph(user);
      await createUserProfile(userData);
      console.log("Profile created successfully");
    } catch (error) {
      console.error("Error saving profile:", error);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-xl font-semibold mb-4">Editing Profile for User ID: {userId}</h2>

      <div className="flex flex-col items-center mb-8">
        <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center mb-4" />
        <div className="w-full space-y-4">
          <div className="flex items-center justify-between">
            <label className="font-semibold">Username:</label>
            {editing.username ? (
              <input
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="border p-2 rounded"
              />
            ) : (
              <div className="flex items-center">
                <span>{formData.username}</span>
                <button onClick={() => setEditing({ ...editing, username: true })} className="ml-2">📝</button>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between">
            <label className="font-semibold">Name:</label>
            {editing.name ? (
              <input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="border p-2 rounded"
              />
            ) : (
              <div className="flex items-center">
                <span>{formData.name || "Add your name"}</span>
                <button onClick={() => setEditing({ ...editing, name: true })} className="ml-2">📝</button>
              </div>
            )}
          </div>

          <div>
            <label className="font-semibold">Skills:</label>
            {editing.skills ? (
              <textarea
                value={formData.skills}
                onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                className="w-full border p-2 rounded mt-2"
                rows="4"
              />
            ) : (
              <div className="flex items-center">
                <span>{formData.skills || "Add your skills"}</span>
                <button onClick={() => setEditing({ ...editing, skills: true })} className="ml-2">📝</button>
              </div>
            )}
          </div>

          <button
            onClick={handleSave}
            className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
          >
            Save Profile
          </button>
        </div>
      </div>
    </div>
  );
}
