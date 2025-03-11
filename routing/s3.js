const {
    S3Client,
    PutObjectCommand,
    DeleteObjectCommand
} = require("@aws-sdk/client-s3");


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

    //console.log("Uploading to R2:", fileName, mimeType, bucket);
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
    //console.log("Upload successful:", result);
    return result;
}


const deleteFromR2 = async (fileName, bucket) => {
    const key = fileName.replace(`/images/${bucket}/`, "", 1);
    //console.log("Deleting from R2:", key);
    const params = {
        Bucket: bucket,
        Key: key
    };

    const command = new DeleteObjectCommand(params);
    const result = await s3.send(command);
    return result
}


module.exports = { uploadToR2, deleteFromR2, s3 };