import cloudinary from "../../config/cloudinary.js";

export async function uploadImage(file) {
  if (!file) return null;

  const result = await cloudinary.uploader.upload(file.path, {
    resource_type: "auto",
    folder: "noteflow",
  });

  return result;
}
