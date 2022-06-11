# my-fss

A file storage manager for my application cluster in k8s.

## Prerequisite:
Create a .env file and set values for the following keys:
1. AWS_REGION=
2. AWS_ACCESS_KEY_ID=
3. AWS_ACCESS_SECRET=
4. AWS_S3_BUCKET=

## Rest APIs:
1. For storing files via storage service:\
   [  
        &nbsp;&nbsp;method: POST\
        &nbsp;&nbsp;endpoint: /api/users/{userID}/upload\
        &nbsp;&nbsp;payload:\
        &nbsp;&nbsp;{\
          &nbsp;&nbsp;&nbsp;&nbsp;file: {uploadFile},\
          &nbsp;&nbsp;&nbsp;&nbsp;app-source: {appSource}\
        &nbsp;&nbsp;}\
   ]
2. For reading files via storage service:\
  [  
    &nbsp;&nbsp;method: GET\
    &nbsp;&nbsp;endpoint: /api/users/{userID}/file?file-name={fileName}&app-source={appSource}\
  ]
