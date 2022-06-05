const { PutObjectCommand } = require('@aws-sdk/client-s3')
const fs = require('fs')
const path = require('path')
const { awsS3Client } = require('../config/s3client')

var handleAwsUpload = async function(filePath, appSource, userId){
    var params = {
        Bucket: process.env.AWS_S3_BUCKET,
        Body: fs.createReadStream(filePath),
        Key: "/" + appSource + '/' + userId + "/" + path.basename(filePath)
    }


    try{
        const awsResp = await awsS3Client.send(new PutObjectCommand(params));
        console.log('Successfully uploaded file to AWS S3');
        return true;
    }
    catch(err){
        console.log(err);
    }
    finally{
        fs.unlink(filePath, (err) => {
            if (err) console.log('Error while removing files asynchronously' + err);
            return;
        });
    }

    return false;
}

const prepareAndUpload = async function(data, fileName, extension, appSource, userId){
    
    const filePath = "./tmp/" + fileName + '.' + extension;
    
    var fileStream = fs.createWriteStream(filePath);
    
    fileStream.on('error', (err) => {
        console.error(err);
        return "Unsuccessful";
    });

    fileStream.on('open', function(fd){
        data.file.pipe(fileStream);
    })

    return new Promise((resolve, reject) => {
        fileStream.on('finish', async () => {
            try{
                await handleAwsUpload(filePath, appSource, userId)
                resolve('Success')
            }
            catch(err){
                reject('Error occurred');
            }
        })
    })
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
            if (data.file) {
            
                // create a /tmp/ folder if it doesn't exist in the root of the project dir. 
                
                if (!fs.existsSync( "./tmp/")){
                    fs.mkdirSync("./tmp/");
                }
                
    
                // generate file name based on userID, appSource and current Unix timestamp and create a hash gigest out of it.
                // the generated digest will be used as the file name.
    
                fileName = getFileName(request.params.userId);
                if (fileName == null) fileName = data.file.hapi.filename;
    
                let extension = data.file.hapi.filename.split('.')[1];
                
          
                //create a copy of the uploaded file under "/tmp/" folder and use it for AWS upload.
                try{
                    await prepareAndUpload(data, fileName, extension, appSource, request.params.userId);
    
                    const respData = {
                        'file-name': fileName+'.'+extension,
                        'message': 'Successfully uploaded file',
                        'code': 'file_upload'
                    }
                    
                    return h
                    .response(respData)
                    .type('application/json')
                    .header('content-type', 'application/json')
                    .code(200)
                }
                catch(err){
                    throw Error('Exception occurred')
                }
            } 
            else{
                throw Error('Exception occurred.')
            }
        }
        catch(err){
            const respData = {
                'message': 'Invalid file',
                'code': 'file_upload'
            }
            
            return h
                .response(respData)
                .type('application/json')
                .header('content-type', 'application/json')
                .code(420)
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
