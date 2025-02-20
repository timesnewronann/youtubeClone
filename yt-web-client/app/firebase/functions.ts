import { getFunctions, httpsCallable } from "firebase/functions";
import { getAuth } from "firebase/auth";

const functions = getFunctions();
const auth = getAuth(); // get the current firebase auth instance

export async function uploadVideo(file: File, userUid: string) {
  // Get firebase authentication token from the currently logged-in user
  const user = auth.currentUser;

  if (!user) {
    throw new Error("User is not authenticated");
  }

  // Get the firebase authentication token
  const token = await user.getIdToken();
  // debgugging
  console.log("Debugging - Firebase Auth Token:", token);
  if (!token) {
    throw new Error("Failed to retrieve Firebase Auth token");
  }

  // Request a signed upload URL from Firebase
  const response = await fetch(
    "https://us-west2-yt-clone-80b84.cloudfunctions.net/generateUploadURL",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, // send token in the authorization header
      },
      body: JSON.stringify({
        auth: { uid: userUid }, // Pass the user's UID
        fileExtension: file.name.split(".").pop(),
      }),
    }
  );

  // If the request fails, throw an error
  if (!response.ok) {
    throw new Error("Failed to get upload URL");
  }

  // Get the signed upload URL from the response
  const { url, fileName } = await response.json();

  // Upload the file to Google Cloud Storage using the signed URL
  await fetch(url, {
    method: "PUT",
    body: file,
    headers: {
      "Content-Type": file.type,
    },
  });

  console.log("File uploaded successfully:", fileName);
}
