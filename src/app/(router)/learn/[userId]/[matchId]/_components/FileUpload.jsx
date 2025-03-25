import { useState } from "react";
import { uploadFileToChat } from "../../../../../_utils/GlobalApi";

export default function FileUpload({ chatId, matchId, userId, refreshFiles }) {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [description, setDescription] = useState("");
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setFileName(selectedFile.name);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    const selectedFile = e.dataTransfer.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setFileName(selectedFile.name);
    }
  };

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
    <div className="p-5 border border-[#161b27] rounded-lg bg-[#161b27] shadow-md">
      <h3 className="text-lg font-semibold text-gray-200 mb-3">Upload File</h3>

      {/* Drag & Drop Area */}
      <div
        className={`relative flex flex-col items-center justify-center p-6 border-2 rounded-lg transition-all duration-300 ${
          dragActive ? "border-blue-800 bg-gray-800" : "border-gray-900 bg-gray-900"
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
      >
        {file ? (
          <p className="text-gray-300">{file.name}</p>
        ) : (
          <p className="text-gray-500">Drag & drop a file here or click to select</p>
        )}
        <input
          type="file"
          onChange={handleFileChange}
          className="absolute inset-0 opacity-0 cursor-pointer"
        />
      </div>

      {/* File Name Input */}
      <input
        type="text"
        placeholder="File Name"
        className="mt-3 w-full p-2 border border-gray-800 bg-gray-800 text-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
        value={fileName}
        onChange={(e) => setFileName(e.target.value)}
      />

      {/* Description Input */}
      <textarea
        placeholder="Description (optional)"
        className="mt-3 w-full p-2 border border-gray-800 bg-gray-800 text-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows="2"
      />

      {/* Upload Button */}
      <button
        className={`group w-full flex items-center justify-center gap-3 px-4 py-2 text-[18px] text-gray-400 bg-[#0b0f19] rounded-md transition-all ease-in-out duration-300 ${
          uploading
            ? "opacity-50 cursor-not-allowed"
            : "hover:bg-[#161b27] hover:text-gray-200 hover:shadow-lg hover:shadow-blue-900/50"
        }`}
        onClick={handleFileUpload}
        disabled={uploading}
      >
        <span className="hidden sm:block opacity-80 group-hover:opacity-100 transition-opacity duration-300">
          {uploading ? "Uploading..." : "Upload"}
        </span>
      </button>

          </div>
  );
}
