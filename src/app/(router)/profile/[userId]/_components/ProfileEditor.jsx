import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { syncUserToHygraph, checkUsernameAvailability } from "../../../../_utils/GlobalApi";

export default function ProfileEditor({ profileData, user, onProfileSaved }) {
  const router = useRouter();

  const [editing, setEditing] = useState({ username: false, name: false, skills: false, language: false });
  const [formData, setFormData] = useState({
    username: profileData?.userName || user?.username || "",
    name: profileData?.name || user?.fullName || "",
    skills: profileData?.skillString || "",
    language: profileData?.language || "English",
  });
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (profileData) {
      setFormData({
        username: profileData.userName,
        name: profileData.name,
        skills: profileData.skillString,
        language: profileData.language,
      });
    } else if (user) {
      setFormData({
        username: user.username || "",
        name: user.fullName || "",
        skills: "",
        language: "English",
      });
    }
  }, [profileData, user]);

  const handleSave = async () => {
    if (typeof window === "undefined") return;

    if (editing.username) {
      const isAvailable = await checkUsernameAvailability(formData.username);
      if (!isAvailable) {
        setErrorMessage("This username is already taken. Please choose a different one.");
        return;
      }
    }

    setErrorMessage("");

    const userData = {
      username: formData.username,
      email: user?.emailAddresses?.[0]?.emailAddress || "",
      name: formData.name,
      skills: formData.skills,
      userId: user.id,
      language: formData.language,
    };

    try {
      await syncUserToHygraph(userData);
      console.log("Profile saved successfully!");
      onProfileSaved(); // Redirect to profile page
    } catch (error) {
      console.error("Error saving profile:", error);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-xl font-semibold mb-4">Edit Profile</h2>
      {errorMessage && <p className="text-red-500">{errorMessage}</p>}

      {/* Username Field */}
      <input
        value={formData.username}
        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
        className="border p-2 rounded w-full mb-4"
      />

      {/* Name Field */}
      <input
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        className="border p-2 rounded w-full mb-4"
      />

      {/* Skills Field */}
      <textarea
        value={formData.skills}
        onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
        className="border p-2 rounded w-full mb-4"
      />

      {/* Language Field */}
      <input
        value={formData.language}
        onChange={(e) => setFormData({ ...formData, language: e.target.value })}
        className="border p-2 rounded w-full mb-4"
      />

      {/* Save Button */}
      <button onClick={handleSave} className="w-full p-3 bg-blue-500 text-white rounded-md">
        Save
      </button>
    </div>
  );
}
