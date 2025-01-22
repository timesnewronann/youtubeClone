import express from "express";
import Ffmpeg from "fluent-ffmpeg";

const app = express(); 
//initialize json for requests
app.use(express.json());


app.post("/process-video", (req,res) => {
    // Get path of the input video file from the request body 
    const inputFilePath = req.body.inputFilePath;
    const outputFilePath = req.body.outputFilePath;

    //error handling technique to check that this isn't undefined and the output file is not undefined
    if (!inputFilePath || !outputFilePath) {
        res.status(400).send("Bad Request: Missing file path."); //client gave us wrong parameters
    }

    //Converting the video
    Ffmpeg(inputFilePath)
    .outputOptions("-vf", "scale=-1:360") // 360 p resolution
    .on("end", () => {
        res.status(200).send("Video processing finished successfully.");
    })
    .on("error", (err) => {
        console.log(`An error occured: ${err.message}`);
        res.status(500).send(`Internal Server Error: ${err.message}`) // internal server error 
    })
    .save(outputFilePath);    
});

// set port 
const port = process.env.PORT || 3000; // standard way to provide port at run time 
//start server
app.listen(port, () => {
    console.log(`Video processing service listening at http://localhost:${port}`);
});