"use client";
import { useUser } from "@clerk/nextjs";
import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { fetchUserProfile } from "../../../_utils/GlobalApi";
import ProfileView from "./_components/ProfileView";
import ProfileNotFound from "./_components/ProfileNotFound";

export default function ProfilePage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const params = useParams();
  const userId = params.userId || user?.id;
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("User ID being checked:", userId); // Debugging Log

    if (!isLoaded) return;
    if (!user || !userId) {
      console.log("Redirecting to home...");
      router.push("/"); // Temporarily disable to debug
      return;
    }

    // Fetch user profile from Hygraph using userId
    const getProfile = async () => {
      setLoading(true);
      const profile = await fetchUserProfile(userId);
      console.log("Fetched profile data:", profile); // Debugging Log
      setProfileData(profile);
      setLoading(false);
    };

    getProfile();
  }, [user, userId, isLoaded]);

  if (!isLoaded || loading) return <p>Loading...</p>;

  console.log("Final Profile Data:", profileData); // Debugging Log

  return (
    <div className="p-6">
      {profileData ? (
        <ProfileView profile={profileData} />
      ) : (
        <ProfileNotFound userId={userId} />
      )}
    </div>
  );
}
