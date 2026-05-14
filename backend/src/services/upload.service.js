import cloudinary from "../config/cloudinary.js";

export async function uploadImage(file) {
  if (!file) {
    const e = new Error("No file uploaded");
    e.status = 400;
    throw e;
  }
  const result = await new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "uploads" },
      (error, result) => (error ? reject(error) : resolve(result)),
    );
    stream.end(file.buffer);
  });

  return { secure_url: result.secure_url };
}
