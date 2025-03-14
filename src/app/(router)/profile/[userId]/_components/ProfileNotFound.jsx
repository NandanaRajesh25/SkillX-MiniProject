import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

export default function ProfileNotFound({ userId }) {
  const { user } = useUser();
  const router = useRouter();

  const isCurrentUser = user?.id === userId;

  return (
    <div className="max-w-2xl mx-auto p-6 border rounded-md shadow-md text-center">
      <h2 className="text-xl font-semibold mb-4">Profile Not Found</h2>
      <p>
        {isCurrentUser
          ? "You don't have a profile yet. Click below to create one."
          : "The requested profile does not exist."}
      </p>

      {isCurrentUser && (
        <button 
          onClick={() => router.push(`/profile/${userId}/edit`)}
          className="mt-4 p-2 bg-slate-500 text-white rounded"
        >
          Create Profile
        </button>
      )}
    </div>
  );
}
