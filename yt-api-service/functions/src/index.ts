//Let's us listen to user authentication events
import { beforeUserCreated } from "firebase-functions/v2/identity";
// Firebase Admin SDK
import { initializeApp } from "firebase-admin/app";
// let's us store user profiles
import { Firestore } from "firebase-admin/firestore";
// Logging for debugging
import * as logger from "firebase-functions/logger";
// Google Cloud Storage
import { Storage } from "@google-cloud/storage";
// Callable function for frontend requests
import { onCall } from "firebase-functions/v2/https";

initializeApp();
const firestore = new Firestore();
const storage = new Storage(); // same as video-processing service

const rawVideoBucketName = "timesnewronan-yt-raw-videos";

// Functions -> Runs when a user signs up, storing user info in Firebase
// Rename `event` to `userEvent` to avoid conflicts
export const createUser = beforeUserCreated(
  { region: "us-west2" },
  async (userEvent): Promise<void> => {
    logger.info(
      "beforeUserCreated Trigger Fired. User Data:",
      JSON.stringify(userEvent, null, 2),
    );
    if (!userEvent.data) {
      logger.error("ERROR: userEvent.data is undefined!");
      throw new Error("Missing user data in beforeUserCreated event");
    }

    const userInfo = {
      uid: userEvent.data.uid,
      email: userEvent.data.email,
      photoUrl: userEvent.data.photoURL || "",
    };

    try {
      await firestore.collection("users").doc(userInfo.uid).set(userInfo);
      logger.info(`User Created: ${JSON.stringify(userInfo)}`);
    } catch (error) {
      logger.error(`Firestore write failed: ${error instanceof Error}`);
      throw new Error("Firestore write failed");
    }
  },
);

// Generates a signed URL for authenticated users
// to upload videos to Google Cloud Storage.
export const generateUploadURL = onCall(
  { maxInstances: 1 },
  async (request) => {
    // Check if the user is authenticated
    if (!request.auth) {
      throw new Error("User must be authenticated to generate an upload URL.");
    }
    try {
      const auth = request.auth;
      const data = request.data;
      const bucket = storage.bucket(rawVideoBucketName);

      // Make sure that the fileExtension is provided
      if (!data.fileExtension) {
        throw new Error("Missing required parameter: fileExtension");
      }

      // Generate a unique filename
      const fileName = `${auth.uid} -${Date.now()}.${data.fileExtension}`;

      // Get a v4 signed url for uploading file
      const [url] = await bucket.file(fileName).getSignedUrl({
        version: "v4",
        action: "write",
        expires: Date.now() + 15 * 60 * 1000, // URL will only be valid for 15 minutes
      });

      logger.info(`Generated upload URL for ${fileName}`);

      return { url, fileName };
    } catch (error) {
      logger.error("Error generating upload URL:", error);
      throw new Error("Failed to generate upload URL.");
    }
  },
);
