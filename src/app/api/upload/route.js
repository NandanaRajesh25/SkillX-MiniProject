import { NextResponse } from "next/server";
import cloudinary from "../../_utils/cloudinary";

export async function POST(req) {
  try {
    const { file } = await req.json(); // Base64-encoded file

    const uploadedResponse = await cloudinary.uploader.upload(file, {
      resource_type: "auto", // Supports PDFs, DOCX, PPTX, images, etc.
      folder: "skillx_files", // Cloudinary folder
    });

    return NextResponse.json({ url: uploadedResponse.secure_url });
  } catch (error) {
    return NextResponse.json(
      { error: "File upload failed", details: error.message },
      { status: 500 }
    );
  }
}
