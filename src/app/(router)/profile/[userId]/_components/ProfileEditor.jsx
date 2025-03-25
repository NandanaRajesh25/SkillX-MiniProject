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
    imageUrl: profileData?.imageUrl || user?.imageUrl || "",
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
      imageUrl: formData.imageUrl,
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
    <div className="flex justify-center items-center min-h-screen">
      <div className="relative w-[350px] bg-black rounded-2xl overflow-hidden shadow-lg transition-all duration-500 hover:shadow-2xl hover:-translate-y-3 group">
        
        {/* Profile Image Section */}
        <div className="relative">
          <img
            src={formData.imageUrl || "/default-profile.jpg"}
            alt="Profile Picture"
            className="w-full h-[180px] object-cover opacity-100 transition-opacity duration-500 group-hover:opacity-50"
          />
          <label className="absolute bottom-2 right-2 bg-black/60 p-2 text-white text-sm rounded-md cursor-pointer hover:bg-gray-700">
            Upload
            <input type="file" onChange={handleProfilePictureUpload} className="hidden" />
          </label>
        </div>

        {/* Profile Details Form */}
        <div className="p-6 text-center">
          {errorMessage && <p className="text-red-500">{errorMessage}</p>}

          {/* Username Field */}
          <input
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            className="w-full bg-[#222] text-white text-center p-2 rounded-md mb-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Username"
            title="Enter your unique username"
          />

          {/* Name Field */}
          <input
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full bg-[#222] text-white text-center p-2 rounded-md mb-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Full Name"
            title="Enter your full name"
          />

          {/* Skills Field */}
          <textarea
            value={formData.skills}
            onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
            className="w-full bg-[#222] text-white text-center p-2 rounded-md mb-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Skills (e.g., JavaScript, UI/UX Design)"
            title="List your skills separated by commas"
          />

          {/* Language Field */}
          <input
            value={formData.language}
            onChange={(e) => setFormData({ ...formData, language: e.target.value })}
            className="w-full bg-[#222] text-white text-center p-2 rounded-md mb-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Preferred Language"
            title="Enter your preferred language"
          />

          {/* Save Button */}
          <button
            onClick={handleSave}
            className="w-full mt-4 p-3 text-[18px] bg-[#0b0f19] text-gray-400 cursor-pointer rounded-md transition-all ease-in-out duration-300 hover:bg-[#161b27] hover:text-gray-200 hover:shadow-lg hover:shadow-blue-900/50"
          >
            {uploading ? "Uploading..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
