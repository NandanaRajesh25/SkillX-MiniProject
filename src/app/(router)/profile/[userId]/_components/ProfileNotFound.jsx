import { useRouter } from "next/navigation";

export default function ProfileNotFound({ userId }) {
  const router = useRouter();

  return (
    <div className="max-w-2xl mx-auto p-6 border rounded-md shadow-md text-center">
      <h2 className="text-xl font-semibold mb-4">No Profile Found</h2>
      <p>You don't have a profile yet. Click below to create one.</p>
      <button 
        onClick={() => router.push(`/profile/${userId}/edit`)}
        className="mt-4 p-2 bg-green-500 text-white rounded"
      >
        Create Profile
      </button>
    </div>
  );
}
