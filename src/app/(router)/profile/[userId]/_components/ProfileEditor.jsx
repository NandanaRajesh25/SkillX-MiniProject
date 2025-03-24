import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { syncUserToHygraph, checkUsernameAvailability, uploadToCloudinary, uploadProfilePictureToHygraph } from "../../../../_utils/GlobalApi";

export default function ProfileEditor({ profileData, user, onProfileSaved }) {
  const router = useRouter();

  const [editing, setEditing] = useState({ username: false, name: false, skills: false, language: false });
  const [formData, setFormData] = useState({
    username: profileData?.userName || user?.username || "",
    name: profileData?.name || user?.fullName || "",
    skills: profileData?.skillString || "",
    language: profileData?.language || "English",
    imageUrl: profileData?.imageUrl || user?.imageUrl || "", // Profile Picture URL
  });

  const [errorMessage, setErrorMessage] = useState("");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (profileData) {
      setFormData({
        username: profileData.userName,
        name: profileData.name,
        skills: profileData.skillString,
        language: profileData.language,
        imageUrl: profileData.imageUrl,
      });
    } else if (user) {
      setFormData({
        username: user.username || "",
        name: user.fullName || "",
        skills: "",
        language: "English",
        imageUrl: user.imageUrl || "",
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
      imageUrl: formData.imageUrl, // Store the profile picture URL
    };

    try {
      await syncUserToHygraph(userData);
      console.log("✅ Profile saved successfully!");
      onProfileSaved();
    } catch (error) {
      console.error("❌ Error saving profile:", error);
    }
  };

  const handleProfilePictureUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
  
    setUploading(true);
  
    // 1️⃣ Upload to Cloudinary
    const uploadResponse = await uploadToCloudinary(file);
    if (uploadResponse) {
      const newImageUrl = uploadResponse.secure_url;
      setFormData({ ...formData, imageUrl: newImageUrl });
      console.log("✅ Profile picture uploaded to Cloudinary:", newImageUrl);
  
      // 2️⃣ Save to Hygraph
      const hygraphResponse = await uploadProfilePictureToHygraph(user.id, newImageUrl);
      if (hygraphResponse) {
        console.log("✅ Profile picture saved in Hygraph!");
      } else {
        console.error("❌ Failed to update profile picture in Hygraph.");
      }
    } else {
      console.error("❌ Profile picture upload failed.");
    }
  
    setUploading(false);
  };  

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-xl font-semibold mb-4">Edit Profile</h2>
      {errorMessage && <p className="text-red-500">{errorMessage}</p>}

      {/* Profile Picture Upload */}
      <label className="block font-medium text-gray-700 mb-1">Profile Picture</label>
      <div className="flex items-center gap-4 mb-4">
        <img
          src={formData.imageUrl || "/default-profile.png"}
          alt="Profile"
          className="w-20 h-20 rounded-full border"
        />
        <input type="file" onChange={handleProfilePictureUpload} className="border p-2 rounded-md" />
      </div>

      {/* Username Field */}
      <label className="block font-medium text-gray-700 mb-1">Username</label>
      <input
        value={formData.username}
        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
        className="border p-2 rounded w-full mb-4"
        placeholder="Enter your username"
      />

      {/* Name Field */}
      <label className="block font-medium text-gray-700 mb-1">Full Name</label>
      <input
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        className="border p-2 rounded w-full mb-4"
        placeholder="Enter your full name"
      />

      {/* Skills Field */}
      <label className="block font-medium text-gray-700 mb-1">Skills</label>
      <textarea
        value={formData.skills}
        onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
        className="border p-2 rounded w-full mb-4"
        placeholder="List your skills (e.g., JavaScript, Python, UI/UX Design)"
      />

      {/* Language Field */}
      <label className="block font-medium text-gray-700 mb-1">Preferred Language</label>
      <input
        value={formData.language}
        onChange={(e) => setFormData({ ...formData, language: e.target.value })}
        className="border p-2 rounded w-full mb-4"
        placeholder="Enter your preferred language"
      />

      <button onClick={handleSave} className="w-full p-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition">
        {uploading ? "Uploading..." : "Save"}
      </button>
    </div>
  );
}
