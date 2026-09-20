import cloudinary from "../../config/cloudinary.js";
import { BadRequestError } from "../../common/errors/errors.js";

export async function uploadImage(file) {
  if (!file) return null;

  if (!file.mimetype.match(/^(image\/(jpeg|png|gif|webp|svg\+xml|avif))$/)) {
    throw new BadRequestError("Invalid file type. Only images are allowed.");
  }

  if (file.size > 10 * 1024 * 1024) {
    throw new BadRequestError("File size must be less than 10MB");
  }

  try {
    const result = await cloudinary.uploader.upload(file.path, {
      resource_type: "image",
      folder: "noteflow",
      format: "auto",
      quality: "auto:good",
    });

    return result;
  } catch {
    throw new BadRequestError("File upload failed");
  }
}
