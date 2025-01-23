import express, {Request, Response} from "express";
import { convertVideo, deleteProcessedVideo, deleteRawVideo, downloadRawVideo, setupDirectories, uploadProcessedVideo } from "./storage";

//call setup directories 
setupDirectories();

const app = express(); 
//initialize json for requests
app.use(express.json());


app.post("/process-video", async(req,res):Promise<any> => {
    // Get the bucket and filename from the Cloud Pub/Sub message (message queue)
    let data;
    try {
        const message = Buffer.from(req.body.message.data,'base64').toString('utf-8');
        data = JSON.parse(message);
        if (!data.name){
            throw new Error('Invalid message payload received.');
        }
    } catch (error) {
        console.error(error);
        return res.status(400).send('Bad Request: missing filename.');
    }

    const inputFileName = data.name;
    const outputFileName = `processed-${inputFileName}`;
    
    //download the raw video from cloud storage
    await downloadRawVideo(inputFileName);

     // Convert the video to 360p
     try {
        await convertVideo(inputFileName, outputFileName);
     } catch (err){
        await Promise.all([
        deleteRawVideo(inputFileName),
        deleteProcessedVideo(outputFileName)
        ]);
        console.error(err);
        return res.status(500).send('Internal Server Error: video processing failed.');
     }

    //Upload the processed video to cloud storage
    await uploadProcessedVideo(outputFileName);

    await Promise.all([
        deleteRawVideo(inputFileName),
        deleteProcessedVideo(outputFileName)
    ]);

    return res.status(200).send('Processing Finished successfully');
});

// set port 
const port = process.env.PORT || 3000; // standard way to provide port at run time 
//start server
app.listen(port, () => {
    console.log(`Video processing service listening at http://localhost:${port}`);
});