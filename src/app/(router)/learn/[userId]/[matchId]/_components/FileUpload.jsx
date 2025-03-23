import { useState, useEffect } from "react";  // Add this import
import { uploadFileToChat } from "../../../../../_utils/GlobalApi";

export default function FileUpload({ chatId, matchId, userId, refreshFiles }) {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [description, setDescription] = useState("");
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async () => {
    if (!file) return;
    setUploading(true);

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = async () => {
      const base64File = reader.result.split(",")[1];

      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ file: `data:${file.type};base64,${base64File}` }),
      });

      const data = await res.json();
      if (!res.ok) {
        console.error("❌ Upload failed:", data);
        setUploading(false);
        return;
      }

      console.log("✅ File uploaded to Cloudinary:", data.url);

      console.log(chatId, data.url, fileName, description);
      const success = await uploadFileToChat(chatId, data.url, fileName, description);
      if (success) {
        console.log("✅ File attached to chat in Hygraph!");
        refreshFiles();
        setFile(null);
        setFileName("");
        setDescription("");
      } else {
        console.error("❌ Failed to store file in Hygraph.");
      }

      setUploading(false);
    };
  };

  return (
    <div className="p-4 border rounded-lg bg-gray-100">
      <h3 className="text-lg font-semibold">Upload File</h3>
      <input type="file" onChange={(e) => setFile(e.target.files[0])} className="mt-2 w-full" />
      <input 
        type="text"
        placeholder="File Name"
        className="mt-2 w-full p-2 border rounded-md"
        value={fileName}
        onChange={(e) => setFileName(e.target.value)}
      />
      <textarea
        placeholder="Description"
        className="mt-2 w-full p-2 border rounded-md"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <button
        className={`mt-3 px-4 py-2 rounded-md text-white ${uploading ? "bg-gray-400" : "bg-slate-600 hover:bg-slate-700"}`}
        onClick={handleFileUpload}
        disabled={uploading}
      >
        {uploading ? "Uploading..." : "Upload"}
      </button>
    </div>
  );
}
