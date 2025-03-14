import { useUser } from "@clerk/nextjs";

export default function ProfileView({ profile }) {
  const { user } = useUser();
  return (
    <div className="max-w-2xl mx-auto p-6 border rounded-md shadow-md">
      <h2 className="text-2xl font-semibold mb-4">Profile</h2>
      <p><strong>Username:</strong> {profile.userName}</p>
      <p><strong>Name:</strong> {profile.name}</p>
      {/* <p><strong>Email:</strong> {profile.email}</p> */}
      <p><strong>Skills:</strong> {profile.skillString || "Not provided"}</p>
      <p><strong>Language:</strong> {profile.language || "Not set"}</p>

      {user?.id === profile.userId && (
        <a href={`/profile/${profile.userId}/edit`}>
          <button className="mt-4 p-2 bg-slate-500 text-white rounded">Edit Profile</button>
        </a>
      )}
    </div>
  );
}
