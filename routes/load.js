const { GetObjectCommand } = require('@aws-sdk/client-s3');
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

            console.log('Exception in file reading from AWS S3 bucket');
            console.log(err);

            return h
                .response({
                    'message': 'Unable to process the request. Please try again after sometime.',
                    'code': 'file_read'
                })
                .type('application/json')
                .header('content-type', 'application/json')
                .code(520)
        }
    }
}