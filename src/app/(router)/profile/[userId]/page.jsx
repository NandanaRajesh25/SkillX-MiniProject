// app/profile/[userId]/page.jsx
"use client";
import { useUser } from "@clerk/nextjs";
import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";
import ProfileSetupModal from "./_components/ProfileSetupModal";
//import ProfileEditor from "./_components/ProfileEditor";

export default function ProfilePage() {
  const { user } = useUser();
  const router = useRouter();
  const params = useParams();
  const userId = params.userId;
  const [showSetupModal, setShowSetupModal] = useState(true);

  useEffect(() => {
    if (!user && !userId) {
      router.push("/");
    }
  }, [user, userId, router]);

  if (!user) return <p>Loading...</p>;

  return (
    <div className="p-6">
      {showSetupModal && <ProfileSetupModal />}
      {/* <ProfileEditor /> */}
    </div>
  );
}