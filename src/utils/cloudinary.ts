import toast from "react-hot-toast";

/**
 * Uploads a file to Cloudinary unsigned upload preset, organizing it into folders based on item type and category.
 * @param file The file to upload.
 * @param itemType The type of item (e.g. outfit, furniture, voice, accessory, theme, costume, consumable).
 * @param subCategory Optional sub-category (e.g. "avatar" for costume skins, or "icon" for normal thumbnail).
 */
export async function uploadToCloudinary(
  file: File,
  itemType: string,
  subCategory?: string
): Promise<string | null> {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const preset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !preset) {
    toast.error("Vui lòng cấu hình Cloudinary trong file .env!");
    return null;
  }

  // Determine subfolder dynamically based on type
  // e.g. shiba_town/outfit/icon, shiba_town/costume/avatar, etc.
  let folder = "shiba_town";
  const cleanType = itemType ? itemType.trim().toLowerCase() : "misc";
  folder += `/${cleanType}`;

  if (subCategory) {
    folder += `/${subCategory.trim().toLowerCase()}`;
  }

  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", preset);
    formData.append("folder", folder);

    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      throw new Error("Lỗi khi tải ảnh lên Cloudinary");
    }

    const data = await res.json();
    if (data.secure_url) {
      return data.secure_url;
    } else {
      throw new Error("Không lấy được đường dẫn ảnh");
    }
  } catch (err: any) {
    console.error(err);
    toast.error(err.message || "Tải ảnh thất bại!");
    return null;
  }
}
