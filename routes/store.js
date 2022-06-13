const { Upload } = require('@aws-sdk/lib-storage')
const fs = require('fs')
const path = require('path')
const { awsS3Client } = require('../config/s3client')

var handleAwsUpload = async function(data, fileName, appSource, userId){
    var params = {
        Bucket: process.env.AWS_S3_BUCKET,
        Body: data.file,
        Key: "/" + appSource + '/' + userId + "/" + fileName
    }
    
    const upload = new Upload({
        client: awsS3Client,
        params: params
    })
    await upload.done();
    console.log('Successfully uploaded file to AWS S3');
}

var getFileName = function(userId){
    try {
        const crypto = require('node:crypto');
        let fileName = crypto.createHmac('sha256', 'secret')
            .update('accounts' + userId + Date.now())
            .digest('hex');
        return fileName;
    } 
    catch (err) {
        console.log('crypto support is disabled!');
    }
    return null;
}

module.exports = {
    method: 'POST',
    path: '/api/users/{userId}/upload',
    
    handler: async function (request, h){
        const data = request.payload;
        const appSource = request.payload['app-source'];
        let fileName;

        try{
            if (!data.file) throw Error('Invalid file.');
            
            // generate file name based on userID, appSource and current Unix timestamp and create a hash gigest out of it.
            // the generated digest will be used as the file name.

            fileName = getFileName(request.params.userId);
            if (fileName == null) fileName = data.file.hapi.filename;

            let extension = data.file.hapi.filename.split('.')[1];
            fileName = fileName + '.' + extension;
            
        
            // AWS upload handling.
            await handleAwsUpload(data, fileName, appSource, request.params.userId);

            // if successfull (without error), return success response.            
            return h
            .response({
                'file-name': fileName,
                'message': 'Successfully uploaded file',
                'code': 'file_upload'
            })
            .type('application/json')
            .header('content-type', 'application/json')
            .code(200)
        }
        catch(err){
            
            console.log('Exception occurred.');
            console.log(err);
                        
            return h
                .response({
                    'message': 'Unable to process the request. Please try again after sometime.',
                    'code': 'file_upload'
                })
                .type('application/json')
                .header('content-type', 'application/json')
                .code(520)
        }
    },
    
    options: {
        payload: {
            maxBytes: 209715200,
            output: 'stream',
            parse: true,
            multipart: true 
        }
    }
}
