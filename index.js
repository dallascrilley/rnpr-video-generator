// Description: This is the main entry point for the application
// This application is designed to accept an image and audio file, then output a video file with the image looping until the end of the audio file and the audio playing in the background
// begin snippet: index.js
// Import the required modules
const express = require("express");
const multer = require("multer");
const ffmpeg = require("fluent-ffmpeg");
const fs = require("fs");


const app = express();

// Create a form with two file inputs (one for each file type - image and audio)
const form = `
<form method="post" enctype="multipart/form-data" action="/process-files">
  <label for="image">Image file:</label><br>
  <input type="file" id="image" name="files" accept="image/*"><br>
  <label for="audio">Audio file:</label><br>
  <input type="file" id="audio" name="files" accept="audio/*"><br><br>
  <input type="submit" value="Submit">
</form>
`;

app.get("/", (req, res) => {
  res.send(form);
});

const upload = multer({ dest: "uploads/" });

app.post("/process-files", upload.array("files"), (req, res) => {
  const files = req.files;
  console.log(`Received ${files.length} files:`);
  files.forEach((file) => {
    console.log(`  - ${file.originalname} (${file.size} bytes)`);
  });

  const command = ffmpeg();

  command.input(files[0].path).inputOptions(["-loop 1", "-t 1"]);
  command.input(files[1].path);

  const outputFileName = `output-${Date.now()}.mp4`;

	command
  .outputOptions([
    "-c:v libx264",
    "-c:a aac",
    "-strict experimental",
    "-framerate 1",
  ])
  .save(outputFileName)
  .on("error", (error) => {
    console.error(`Error processing files: ${error}`);
    res.send("Error processing files");
  })
  .on("end", () => {
    console.log("Finished processing");

    // Delete the hashed files
    files.forEach((file) => {
      fs.unlink(file.path, (error) => {
        if (error) {
          console.error(`Error deleting file: ${error}`);
        }
      });
    });

    res.send("Files processed successfully");
  });
});
//remove this for deployment
/*const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});*/
