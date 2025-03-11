const express = require('express');
const router = express.Router();
const allMiddlewares = require('../middlewares.js');
const { s3 } = require('./s3.js');
const { GetObjectCommand } = require("@aws-sdk/client-s3");


router.get('/images/:bucketName/:imageName', async (req, res) => {
    try {
        //console.log("Requesting image:", req.params.imageName, "from bucket:", req.params.bucketName);
        const imageName = req.params.imageName;
        const bucketName = req.params.bucketName;

        const command = new GetObjectCommand({
            Bucket: bucketName,
            Key: imageName,
        });

        const response = await s3.send(command);

        // Set the Content-Type header based on the image type (e.g., image/jpeg, image/png)
        res.setHeader('Content-Type', response.ContentType || 'image/jpeg'); // Adjust the default if needed

        // Stream the image data directly to the response
        response.Body.pipe(res);

    } catch (error) {
        console.error(error);
        res.status(500).send('Bir hata oluştu.');
    }
});



module.exports = router;