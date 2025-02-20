import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { syncUserToHygraph, checkUsernameAvailability } from '../../../../_utils/GlobalApi';

export default function ProfileEditor() {
  const { user, isLoaded } = useUser();
  if (!isLoaded) return <p>Loading...</p>;

  const [editing, setEditing] = useState({ username: false, name: false, skills: false, language: false });
  const [formData, setFormData] = useState({
    username: user?.username || '',
    name: '',
    skills: '',
    language: 'English'
  });
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!user) return;

    setFormData({
      username: user.username || '',
      name: user.fullName || '',
      skills: '',
      language: 'English'
    });
  }, [user]);

  const handleSave = async () => {
    if (typeof window === "undefined") return;

    // Check if username is unique
    if (editing.username) {
      const isAvailable = await checkUsernameAvailability(formData.username);
      if (!isAvailable) {
        setErrorMessage("This username is already taken. Please choose a different one.");
        return;
      }
    }

    setErrorMessage(""); // Clear any previous errors

    const userData = {
      username: formData.username,
      email: user?.emailAddresses?.[0]?.emailAddress || "",
      name: formData.name,
      skills: formData.skills,
      userId: user.id, 
      language: formData.language,
    };

    try {
      const response = await syncUserToHygraph(userData);

      if (response?.upsertUserInfo) {
        setFormData({
          username: response.upsertUserInfo.userName,
          name: response.upsertUserInfo.name,
          skills: response.upsertUserInfo.skillString,
          language: response.upsertUserInfo.language,
        });
      }

      console.log("Profile saved successfully!");
    } catch (error) {
      console.error("Error saving profile:", error);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="flex flex-col items-center mb-8">
        <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center mb-4" />
        <div className="w-full space-y-4">
          {/* Username Field */}
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
          
          {/* Show Error Message if Username Exists */}
          {errorMessage && <p className="text-red-500">{errorMessage}</p>}

          {/* Name Field */}
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
                <span>{formData.name || 'Add your name'}</span>
                <button onClick={() => setEditing({ ...editing, name: true })} className="ml-2">📝</button>
              </div>
            )}
          </div>

          {/* Skills Field */}
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
                <span>{formData.skills || 'Add your skills'}</span>
                <button onClick={() => setEditing({ ...editing, skills: true })} className="ml-2">📝</button>
              </div>
            )}
          </div>

          {/* Language Field */}
          <div>
            <label className="font-semibold">Language:</label>
            {editing.language ? (
              <input
                value={formData.language}
                onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                className="w-full border p-2 rounded mt-2"
              />
            ) : (
              <div className="flex items-center">
                <span>{formData.language || 'Set your language'}</span>
                <button onClick={() => setEditing({ ...editing, language: true })} className="ml-2">📝</button>
              </div>
            )}
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            className="w-full p-3 bg-slate-500 text-white py-2 rounded-md hover:bg-slate-600"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
