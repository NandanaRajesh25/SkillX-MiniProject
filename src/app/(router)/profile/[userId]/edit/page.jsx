"use client";
import { useUser } from "@clerk/nextjs";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { fetchUserProfile } from "../../../../_utils/GlobalApi";  
import ProfileEditor from "../_components/ProfileEditor";

export default function EditProfilePage() {
  const { user, isLoaded } = useUser();
  const params = useParams();
  const router = useRouter();
  const userId = params.userId || user?.id;
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoaded) return;
    if (!user || !userId) {
      router.push("/");
      return;
    }

    const getProfile = async () => {
      setLoading(true);
      const profile = await fetchUserProfile(userId);
      setProfileData(profile);
      setLoading(false);
    };

    getProfile();
  }, [user, userId, isLoaded]);

  if (!isLoaded || loading) return <p>Loading...</p>;

  return (
    <div className="p-6">
      <ProfileEditor profileData={profileData} user={user} onProfileSaved={() => router.push(`/profile/${userId}`)} />
    </div>
  );
}
