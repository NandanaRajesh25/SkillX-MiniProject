"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";  // Importing useParams from next/navigation
import { fetchMatchDetails, fetchChat, fetchFiles } from "@/app/_utils/GlobalApi";
import MatchDetails from "./_components/MatchDetails";
import ChatBox from "./_components/ChatBox";
import FileUpload from "./_components/FileUpload";
import FileList from "./_components/FileList";

export default function LearnPage() {
  const { userId, matchId } = useParams();  // Use useParams to get the parameters from the URL

  const [mounted, setMounted] = useState(false);
  const [match, setMatch] = useState(null);
  const [chat, setChat] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sentFiles, setSentFiles] = useState([]);
  const [receivedFiles, setReceivedFiles] = useState([]);

  useEffect(() => {
    setMounted(true);  // Mark component as mounted

    const loadData = async () => {
      try {
        const matchData = await fetchMatchDetails(matchId);
        setMatch(matchData);

        const chatData = await fetchChat(matchId);
        setChat(chatData);

        const filesData = await fetchFiles(matchId);
        if (filesData) {
          const loggedUserFiles = filesData.filter(file => file.uploadedBy.userId === userId);
          const otherUserFiles = filesData.filter(file => file.uploadedBy.userId !== userId);

          setSentFiles(loggedUserFiles);
          setReceivedFiles(otherUserFiles);
        }
      } catch (error) {
        console.error("Error loading learn page:", error);
      }
      setLoading(false);
    };

    loadData();
  }, [matchId, userId]);

  if (loading) return <p className="text-center text-gray-600">Loading...</p>;
  if (!match) return <p className="text-center text-red-600">Match not found!</p>;

  return (
    <div className="flex h-screen">
      <div className="w-1/3 p-6 border-r space-y-6">
        <MatchDetails match={match} userId={userId} />

        <FileUpload chatId={chat?.id} matchId={matchId} userId={userId} refreshFiles={() => fetchFiles(matchId)} />

        <FileList title="Your Uploaded Files" files={sentFiles} />
        <FileList title="Files Shared With You" files={receivedFiles} />
      </div>

      <div className="w-2/3 p-6 border-r space-y-6">
        <ChatBox chat={chat} matchId={matchId} userId={userId} />
        <FileUpload chatId={chat?.id} matchId={matchId} userId={userId} refreshFiles={() => fetchFiles(matchId)} />
      </div>
    </div>
  );
}
