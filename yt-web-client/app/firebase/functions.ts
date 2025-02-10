import { getFunctions, httpsCallable } from "firebase/functions";

const functions = getFunctions();

const generateUploadURL = httpsCallable(functions, "generateUploadUrl");

export async functiion uploadVideo(file: File) {
    // figure out the extension name and then pass it into our generateUploadURL
}