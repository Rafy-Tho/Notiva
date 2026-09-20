import cloudinary from "../../config/cloudinary.js";

export async function uploadImage(file) {
  if (!file) return null;

  try {
    const result = await cloudinary.uploader.upload(file.path, {
      resource_type: "auto",
      folder: "noteflow",
    });

    return result;
  } catch (err) {
    console.error("Upload error:", err.message);
    throw err;
  }
}
