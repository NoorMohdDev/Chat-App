import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import 'dotenv/config';

// Configuration is done automatically by reading .env when imported
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;

    // Upload the file to Cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });
    
    // Unlink (delete) the locally saved temporary file after successful upload
    fs.unlinkSync(localFilePath);
    
    return response;
  } catch (error) {
    // If the upload failed, still remove the locally saved temporary file
    fs.unlinkSync(localFilePath);
    console.error("Error uploading to Cloudinary:", error);
    return null;
  }
};

export { uploadOnCloudinary };