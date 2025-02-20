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
import { onRequest } from "firebase-functions/v2/https";
// Firebase Admin Auth
import { getAuth } from "firebase-admin/auth";

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
export const generateUploadURL = onRequest(
  { region: "us-west2" }, // Set region to us-west2
  async (req, res): Promise<void> => {
    logger.info("generateUploadURL function triggered");

    // Handle CORS Preflight Requests
    res.set("Access-Control-Allow-Origin", "*"); // Allow all origins
    res.set("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");

    if (req.method === "OPTIONS") {
      res.status(204).send(""); // Respond to preflight request
      return;
    }

    // Secure authentication: Extract and verify Firebase Auth token
    const authHeader = req.headers.authorization;
    console.log("Debugging - Received Auth Header:", authHeader);

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({ error: "Unauthorized: Missing or invalid token" });
      return;
    }

    let userId: string; // Declare userId outside of try block
    try {
      // Verify Firebase ID token
      const idToken = authHeader.split("Bearer ")[1];
      console.log("Extracted Token:", idToken);

      const decodedToken = await getAuth().verifyIdToken(idToken);
      console.log("Decoded Token:", decodedToken);

      userId = decodedToken.uid;
      logger.info(`User ${userId} authenticated for upload URL generation`);
    } catch (error) {
      logger.error("Token verification failed:", error);
      res.status(401).json({ error: "Unauthorized: Invalid token" });
      return;
    }

    try {
      const data = req.body;
      const bucket = storage.bucket(rawVideoBucketName);

      // Make sure file extension is provided
      if (!data.fileExtension) {
        res
          .status(400)
          .json({ error: "Missing required parameter: fileExtension" });
        return;
      }

      // Generate a unique filename
      const fileName = `${userId}-${Date.now()}.${data.fileExtension}`;

      // Get a v4 signed URL for uploading file
      const [url] = await bucket.file(fileName).getSignedUrl({
        version: "v4",
        action: "write",
        expires: Date.now() + 15 * 60 * 1000, // 15 minutes
      });

      logger.info(`Generated upload URL for ${fileName}`);

      res.json({ url, fileName });
    } catch (error) {
      logger.error("Error generating upload URL:", error);
      res.status(500).json({ error: "Failed to generate upload URL." });
    }
  },
);
