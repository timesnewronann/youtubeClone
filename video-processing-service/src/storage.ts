// 1. Google Cloud storage file interactions
// 2. Local File Interactions 

import {Storage} from '@google-cloud/storage';
import fs from 'fs';
import Ffmpeg from 'fluent-ffmpeg';
import { dir } from 'console';

// creating an instance of Google Cloud Storage 
const storage = new Storage();

// hardcoded strings 
// download from this bucket 
const rawVideoBucketName = "timesnewronan-yt-raw-videos";
// upload from the bucket 
const processesdVideoBucketName = "timesnewronan-yt-processed-videos";

// download videos put into this folder 
const localRawVideoPath = "./raw-videos";
// process videos place into this folder
const localProcessedVideoPath = "./processed-videos";


/**
 * Creates the local directories for raw and processed video files
 */
export function setupDirectories() {

}

/**
 * @param rawVideoName - The name of the file to convert from {@link localRawVideoPath}
 * @param processedVideoName - The name of the file to convert to {@link localProcessedVideoPath}
 * @returns A promise that resolves when the video has been converted
 */
export function convertVideo(rawVideoName: string, processedVideoName: string){
     //Converting the video
     return new Promise<void>((resolve, reject) => {
        Ffmpeg(`${localRawVideoPath}/${rawVideoName}`)
        .outputOptions("-vf", "scale=-1:360") // 360 p resolution
        .on("end", () => {
            console.log("Video processing finished successfully.");
            resolve();
        })
        .on("error", (err) => {
            console.log(`An error occured: ${err.message}`); 
            reject(err);
        })
        .save(`${localProcessedVideoPath}/${processedVideoName}`);  
     });
}

/**
 * @param fileName - The name of the file to download from the 
 * {@link rawVideoBucketName} bucket into the {@link localRawVideoPath} folder.
 * @returns A promise that resolves when the file has been downloaded.
 */
export async function downloadRawVideo(fileName: string) {
    // blocks anything under from running until we finish downloading the rawVideo 
    await storage.bucket(rawVideoBucketName)
    .file(fileName)
    .download({destination: `${localRawVideoPath}/${fileName}`});

    console.log(
        `gs://${rawVideoBucketName}/${fileName} downloaded to ${localRawVideoPath}/${fileName}.`
    );
}

/**
 * @param fileName - The name of the file to upload from the 
 * {@link localProcessedVideoPath} folder into the {@link processesdVideoBucketName}
 * @returns A promise that resolves when the file has been uploaded
 */
export async function uploadProcessedVideo(fileName:string) {
    const bucket = storage.bucket(processesdVideoBucketName); 
    
    // uploading the file 
    await bucket.upload(`${localProcessedVideoPath}/${fileName}`, {
        destination:fileName
    });

    console.log(
        `gs://${processesdVideoBucketName}/${fileName} uploaded to ${localProcessedVideoPath}/${fileName}.`
    );

    // set the file to be public 
    // every video that's been processed is going to be public 
    await bucket.file(fileName).makePublic();
}

/**
 * @param fileName - The name of the file to delete from the
 * {@link localRawVideoPath} folder.
 * @returns A promise that resolves when the file has been deleted.
 */
export function deleteRawVideo(fileName:string){
    return deleteFile(`${localRawVideoPath}/${fileName}`);
}

/**
 * @param fileName - The name of the file to delete from the 
 * {@link localProcessedVideoPath} folder.
 * @returns A promise that resolves when the file has been deleted.
 */
export function deleteProcessedVideo(fileName:string){
    return deleteFile(`${localProcessedVideoPath}/${fileName}`);
}

/**
 * @param filePath - The path of the file to delete.
 * @returns A promise that resolves when the file has been deleted.
 */
function deleteFile(filePath: string): Promise<void> {
    return new Promise((resolve, reject) => {
        // check if the files exist
        if(fs.existsSync(filePath)){
            //delete the file
            fs.unlink(filePath, (err) => {
                if (err) {
                    //delete was unsuccessful
                    console.log(`Failed to delete file at ${filePath}, err`);
                    reject(err);
                } else {
                    console.log(`File deleted at ${filePath}`);
                    resolve();
                }
            })
        } else{
            console.log(`File not found at ${filePath}, skipping the delete.`);
            resolve()
        }
    })
}

/**
 * Ensures a director exists, creating it if necessary.
 * @param {string} dirPath - The directory path to check.
 */
function ensureDirectoryExistence(dirPath: string){
    if(!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, {recursive: true}); // recusrive: true enables creating nesed directories
        console.log(`Directory created at ${dirPath}`);
    }
}