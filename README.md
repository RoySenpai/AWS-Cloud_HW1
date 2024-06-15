# Big Data & Cloud Computing Assignment 1
### For Computer Science B.S.c Ariel University
**By Roy Simanovich**

## Description
This assignment is about the basics of developing a cloud-based application. The application is a simple media player that can stream video files from an S3 bucket or a CloudFront distribution. The application is a Node.js server that uses the Express.js framework to serve the client-side code and the video files. The server uses the AWS SDK to interact with the S3 bucket and the CloudFront distribution. The client-side code is a simple HTML page that uses the video.js library to play the video files. The application is deployed on an AWS EC2 instance.

## Requirements
- AWS EC2 instance
- Node.js and npm installed
- Git installed
- S3 Bucket
- CloudFront CDN Distribution (Optional, only if you want to use it instead of the S3 bucket URL)

## How to use
1. Clone the repository:
```bash
git clone https://github.com/RoySenpai/AWS-Cloud_HW1.git
```

2. Install all the dependencies:
```bash
npm install
```

3. Change the `server.js` file with your S3 bucket URL or CloudFront URL:
```javascript
AWS.config.update({ region: 'us-east-1' }); // // Configure AWS SDK
const port = 80; // Application Port. For production its 80, for development its 3000.
const S3orCloudFront = 'CloudFront'; // Set to 'S3' or 'CloudFront'
const bucketName = 'yourBucketName'; // The S3 Bucket name
const cloudFrontDomain = 'https://youDomainName'; // CloudFront domain
const privateKeyPath = './key.pem'; // CloudFront private key location
const keyPairId = 'yourKeyPairID'; // CloudFront key pair ID
const cache_max_minutes = 60; // Cache policy: TTL in minutes
```

4. Run the API:
```bash
npm start
```

## License
This project is licensed under the GNU General Public License v3.0 - see the [LICENSE](LICENSE) file for details