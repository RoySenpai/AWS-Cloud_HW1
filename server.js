const express = require('express');
const AWS = require('aws-sdk');
const path = require('path');

const app = express();
const port = 3000;

// Configure AWS SDK
AWS.config.update({ region: 'us-east-1' }); // Update to your region
const s3 = new AWS.S3();

// Your S3 bucket name
const bucketName = 'roysim-videos-bucket';

// Function to list objects in the S3 bucket
const listS3Objects = async () => {
    const params = {
        Bucket: bucketName
    };

    try {
        const data = await s3.listObjectsV2(params).promise();
        return data.Contents.map(item => item.Key);
    } catch (error) {
        console.error('Error fetching S3 objects:', error);
        throw error;
    }
};

// Function to remove file extension
const removeFileExtension = (filename) => {
    return path.parse(filename).name;
};

// Serve the HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Route to get list of video files
app.get('/videoList', async (req, res) => {
    try {
        console.log('Got request to fetch video files');

        const files = await listS3Objects();
        const fileNamesWithoutExtension = files.map(removeFileExtension);

        console.log('Video files fetched successfully:', fileNamesWithoutExtension);
        
        res.send(JSON.stringify(fileNamesWithoutExtension));
    } catch (error) {
        res.status(500).json({ error: 'Error fetching video files' });
        console.error('Error fetching video files:', error);
    }
});

// Route to get a specific video file
app.get('/videos/:filename', async (req, res) => {
    const filename = req.params.filename;
    const fullFilename = `${filename}.mp4`; // Adding .mp4 extension to the filename

    const params = {
        Bucket: bucketName,
        Key: fullFilename
    };

    console.log('Got request to fetch video file:', fullFilename);

    try {
        const data = await s3.headObject(params).promise(); // Check if the file exists

        res.writeHead(200, {
            'Content-Type': data.ContentType,
            'Content-Length': data.ContentLength
        });

        const stream = s3.getObject(params).createReadStream();
        stream.pipe(res);

        console.log('Video file retrieved successfully:', fullFilename);
    } catch (error) {
        console.error('Error retrieving video file:', error);
        res.status(404).json({ error: 'Video file not found' });
    }
});

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});