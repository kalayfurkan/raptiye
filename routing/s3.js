const {
    S3Client,
    PutObjectCommand,
    GetObjectCommand,
    DeleteObjectCommand
} = require("@aws-sdk/client-s3");
//const { getSignedUrl } = require("@aws-sdk/s3-request-presigner"); //use if you are using presigned URL


const s3 = new S3Client({
    endpoint: process.env.CLOUDFLARE_ENDPOINT,
    credentials: {
        accessKeyId: process.env.ACCESS_KEY_ID,
        secretAccessKey: process.env.SECRET_ACCESS_KEY,
    },
    region: "auto",
    signatureVersion: "v4",
});



const uploadToR2 = async (fileBuffer, fileName, mimeType, bucket) => {
    // Set up S3 params
    const params = {
        Bucket: bucket,
        Key: fileName,
        Body: fileBuffer,
        ContentType: mimeType || "application/octet-stream"
    };

    const command = new PutObjectCommand(params);
    const result = await s3.send(command);
    // Upload using putObject
    console.log("Upload successful:", result);
    return result;
}


const deleteFromR2 = async (fileName, bucket) => {
    const params = {
        Bucket: bucket,
        Key: fileName
    };

    const command = new DeleteObjectCommand(params);
    const result = await s3.send(command);
    console.log("Delete successful:", result);
    return result
}


/* const getLoadURL= async (fileName, bucket) => { // Get a signed URL for the object
    const command = new GetObjectCommand({
        Bucket: bucket,
        Key: fileName,
        ContentType: "application/octet-stream",
    });

    const signedUrl = await getSignedUrl(s3, command, { expiresIn: 86400 }); // 24 hours
    return signedUrl;
} */

const getLoadURL = async (fileName, bucket) => {
    try {
        const command = new GetObjectCommand({
            Bucket: bucket,
            Key: fileName
        });

        console.log("Getting object:", fileName);

        const response = await s3.send(command);

        // Convert the ReadableStream to a Buffer
        const chunks = [];
        for await (const chunk of response.Body) {
            chunks.push(chunk);
        }
        const buffer = Buffer.concat(chunks);

        // Determine the content type (if available)
        const contentType = response.ContentType || 'application/octet-stream';

        // Construct a data URL
        const dataURL = `data:${contentType};base64,${buffer.toString('base64')}`;
        return dataURL;
    } catch (error) {
        console.error("Error getting object:", error);
        throw error; // Re-throw the error so the caller can handle it
    }
};

module.exports = { uploadToR2, getLoadURL, deleteFromR2, s3 };