const express = require('express');
const AWS = require('aws-sdk');
const fs = require('fs');
const cors = require('cors');

const app = express();

// Some settings \\
AWS.config.update({ region: 'us-east-1' }); // // Configure AWS SDK
const port = 80; // Application Port. For production its 80, for development its 3000.
const S3orCloudFront = 'CloudFront'; // Set to 'S3' or 'CloudFront'
const bucketName = 'yourBucketName'; // The S3 Bucket name
const cloudFrontDomain = 'https://youDomainName'; // CloudFront domain
const privateKeyPath = './key.pem'; // CloudFront private key location
const keyPairId = 'yourKeyPairID'; // CloudFront key pair ID
const cache_max_minutes = 60; // Cache policy: TTL in minutes


// CACHE STUFF \\
const cache_timeout = 1000 * 60 * cache_max_minutes; // Cache timeout set to 60 minutes
let cache = null; // Cache to store signed URLs
let cache_created = Date.now(); // Cache created timestamp

// Create AWS S3 instance.
const s3 = new AWS.S3();

// Enable CORS to be able to access the API from anywhere.
app.use(cors());

// Main API:
// GET /videoList
// Response: 200 OK
// Content-Type: application/json
// [ { "filename": "myvideo.mp4", "url": "https://s3bucket-or-cloudfront-url/myvideo.mp4?<KEY>" } ] 
app.get('/videoList', async (req, res) => {
    try {
        if (cache && Date.now() - cache_created < cache_timeout) {
            res.json(cache);
            return;
        }

        const S3Objects = await s3.listObjectsV2({ Bucket: bucketName }).promise();

        const signedUrls = S3Objects.Contents.map((s3Object) => {
            const S3ObjectKey = s3Object.Key;
            const url = `${cloudFrontDomain}/${S3ObjectKey}`;

            // Presign the URL either using S3 or CloudFront
            const signedUrl = (() => {
                if (S3orCloudFront === 'S3') {
                    return s3.getSignedUrl('getObject', { Bucket: bucketName, Key: S3ObjectKey, Expires: 60 * cache_max_minutes });
                }

                const cloudFront = new AWS.CloudFront.Signer(keyPairId, fs.readFileSync(privateKeyPath, 'utf-8'));
                const timeInSeconds = Math.floor(new Date().getTime() / 1000);

                const policy = JSON.stringify({
                    Statement: [
                        {
                            Resource: url,
                            Condition: {
                                DateLessThan: { 'AWS:EpochTime': timeInSeconds + 60 * cache_max_minutes }, // 1 hour expiration
                                DateGreaterThan: { 'AWS:EpochTime': timeInSeconds } // Start time is now (immediate)
                            }
                        }
                    ]
                });

                return cloudFront.getSignedUrl({ 
			url, 
			policy,
		});
            })();

            return { filename: S3ObjectKey, url: signedUrl };
        });

        cache = signedUrls;
        cache_created = Date.now();
        res.json(signedUrls);

    } catch (err) {
        res.status(500).json({ error: 'Error fetching video files: ' + err });
        console.error('Error fetching video files:', err);
    }
});

// Used for development purposes, if you are on production, the client should be served by a web server, for example S3 Bucket with static website hosting.
app.use(express.static('client'));

app.listen(port);