const { GetObjectCommand } = require('@aws-sdk/client-s3');
const fs = require('fs');
const { awsS3Client } = require('../config/s3client');

module.exports = {
    method: 'GET',
    path: '/api/users/{userId}/file',
    
    handler: async function (request, h){
        const fileName = request.query['file-name'];
        const appSource = request.query['app-source'];

        var params = {
            Bucket: process.env.AWS_S3_BUCKET, 
            Key: "/" + appSource + '/' + request.params.userId + "/" + fileName
        }

        try{
            const awsResp = await awsS3Client.send(new GetObjectCommand(params))
            console.log('AWS data fetch successful.');
            return h
                    .response(awsResp.Body)
                    .header('Content-Disposition', "attachment; filename=\"" + fileName + "\"")
                    .header('content-type', "image/" + fileName.split('.')[1])
                    .code(200)
        }
        catch(err){

            console.log(err);
            const respData = {
                'message': 'Unable to process the request.',
                'code': 'file_read'
            }

            return h
                .response(respData)
                .type('application/json')
                .header('content-type', 'application/json')
                .code(520)
        }
    }
}