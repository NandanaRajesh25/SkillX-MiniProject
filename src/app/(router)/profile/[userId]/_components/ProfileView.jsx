import { useUser } from "@clerk/nextjs";

export default function ProfileView({ profile }) {
  const { user } = useUser();

  return (
    <div className="flex justify-center min-h-screen">
      <div className="relative w-[350px] h-[450px] rounded-2xl overflow-hidden shadow-lg cursor-pointer transition-all duration-500 hover:shadow-2xl hover:-translate-y-3 group">
        
        {/* Profile Image Section */}
        <div className="absolute top-0 left-0 w-[350px] h-[450px] bg-black transition-transform duration-700 group-hover:-translate-y-24">
          <img
            src={profile.imageUrl || "/default-profile.jpg"}
            alt="Profile Picture"
            className="w-[350px] h-[450px] object-cover opacity-100 transition-opacity duration-500 group-hover:opacity-40"
          />
        </div>

        {/* Profile Details (Hidden Initially, Visible on Hover) */}
        <div className="absolute bottom-[-75px] left-0 w-full bg-black text-center p-6 transition-all duration-500 group-hover:bottom-0">
          <h2 className="text-xl font-semibold text-white">{profile.name}</h2>
          <p className="text-gray-400">@{profile.userName}</p>
          <p className="text-gray-300"><strong>Language:</strong> {profile.language || "Not set"}</p>
          <p className="text-gray-300 mt-2"><strong>Skills:</strong> {profile.skillString || "Not provided"}</p>

          {/* Edit Profile Button */}
          {user?.id === profile.userId && (
            <div className="flex justify-center"> {/* Center alignment */}
              <a href={`/profile/${profile.userId}/edit`}>
                <button 
                  className="group flex gap-3 mt-4 p-3 text-[18px] items-center text-gray-400 cursor-pointer rounded-md transition-all ease-in-out duration-300 bg-[#0b0f19] hover:bg-[#161b27] hover:text-gray-200 hover:shadow-lg hover:shadow-blue-900/50"
                >
                  {/* Text Appears on Hover (Optional) */}
                  <span className="hidden sm:block opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    Edit Profile
                  </span>
                </button>
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
