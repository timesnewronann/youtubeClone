import express,{Request, Response} from "express";
import { convertVideo, deleteProcessedVideo, deleteRawVideo, downloadRawVideo, setupDirectories, uploadProcessedVideo } from "./storage";

//call setup directories 
setupDirectories();

const app = express(); 
//initialize json for requests
app.use(express.json());


app.post("/process-video", async (req: Request, res: Response): Promise<void> => {
    // Try block to handle operations that may throw errors
    try {
        //Parse the message
        const message = Buffer.from(req.body.message.data, 'base64').toString('utf-8');
        const data = JSON.parse(message);

        //Check if the needed data is give
        if (!data.name) {
            // Send a 400 bad request response and exit out
            console.error("Invalid message payload received.");
            res.status(400).send('Bad Request: missing filename.');
            return; // NO need to execute 
        }
        
        //Keep executing if no errors
        const inputFileName = data.name;
        const outputFileName = `processed-${inputFileName}`;
        
        // Download the raw video from cloud storage
        await downloadRawVideo(inputFileName);

        // Convert the video to 360p
        try {
            await convertVideo(inputFileName, outputFileName);
        } catch (err) {
            await Promise.all([deleteRawVideo(inputFileName), deleteProcessedVideo(outputFileName)]);
            console.error(err);
            res.status(500).send('Internal Server Error: video processing failed.');
            return;
        }

        // Upload the processed video to cloud storage
        await uploadProcessedVideo(outputFileName);

        await Promise.all([deleteRawVideo(inputFileName), deleteProcessedVideo(outputFileName)]);

        res.status(200).send('Processing Finished successfully');
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});


// set port 
const port = process.env.PORT || 3000; // standard way to provide port at run time 
//start server
app.listen(port, () => {
    console.log(`Video processing service listening at http://localhost:${port}`);
});