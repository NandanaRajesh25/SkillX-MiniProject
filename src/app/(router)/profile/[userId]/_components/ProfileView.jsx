import { useUser } from "@clerk/nextjs";

export default function ProfileView({ profile }) {
  const { user } = useUser();

  return (
    <div className="max-w-2xl mx-auto p-6 border rounded-md shadow-md bg-white">
      {/* Profile Picture */}
      <div className="flex flex-col items-center">
        <img
          src={profile.imageUrl || "/default-profile.jpeg"}
          alt="Profile Picture"
          className="w-32 h-32 rounded-full border-4 border-gray-300 shadow-md"
        />
        <h2 className="text-2xl font-semibold mt-4">{profile.name}</h2>
        <p className="text-gray-600">@{profile.userName}</p>
      </div>

      {/* Profile Details */}
      <div className="mt-6 space-y-2 text-center">
        {/* <p><strong>Email:</strong> {profile.email}</p> */}
        <p><strong>Skills:</strong> {profile.skillString || "Not provided"}</p>
        <p><strong>Language:</strong> {profile.language || "Not set"}</p>
      </div>

      {/* Edit Profile Button */}
      {user?.id === profile.userId && (
        <div className="mt-6 flex justify-center">
          <a href={`/profile/${profile.userId}/edit`}>
            <button className="p-2 px-4 bg-slate-500 text-white rounded-md hover:bg-slate-600 transition">
              Edit Profile
            </button>
          </a>
        </div>
      )}
    </div>
  );
}
