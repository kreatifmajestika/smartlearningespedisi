import { auth } from "./auth";
import { storage } from "./firebaseStorage";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export const uploadFile = async (path, file, metadata = {}) => {
  const user = auth.currentUser;
  if (!user) throw new Error("User not authenticated");

  // Tambahkan metadata owner
  const fullMetadata = {
    ...metadata,
    customMetadata: {
      ownerId: user.uid,
      ...metadata.customMetadata,
    },
  };

  const fileRef = ref(storage, `${path}/${user.uid}/${file.name}`);
  await uploadBytes(fileRef, file, fullMetadata);
  return getDownloadURL(fileRef);
};

export const deleteFile = async (fileUrl) => {
  // Implementasi delete file
};
