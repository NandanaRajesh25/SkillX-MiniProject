import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ProfileSetupModal() {
  const router = useRouter();
  
  const handleSetupProfile = () => {
    router.push(`/profile/${userId}`);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-bold mb-4">Welcome!</h2>
        <p className="mb-4">Set up your profile now to start learning</p>
        <button 
          onClick={handleSetupProfile}
          className="bg-slate-500 text-white px-4 py-2 rounded hover:bg-slate-600"
        >
          Set Up Profile
        </button>
      </div>
    </div>
  );
}