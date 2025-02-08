const {
    S3Client,
    PutObjectCommand,
    GetObjectCommand,
    DeleteObjectCommand
} = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");


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


const getLoadURL= async (fileName, bucket) => {
    const command = new GetObjectCommand({
        Bucket: bucket,
        Key: fileName,
        ContentType: "application/octet-stream",
    });

    const signedUrl = await getSignedUrl(s3, command, { expiresIn: 86400 }); // 24 hours
    return signedUrl;
}

module.exports = { uploadToR2, getLoadURL, deleteFromR2 };
