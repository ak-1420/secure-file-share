const express = require('express')
const { google } = require('googleapis')
const dotenv = require('dotenv')
const app = express()
const path = require('path')
const fs = require('fs')

const port = process.env.PORT || 3001

dotenv.config()


// intialize oAuth client

const oauth2Client = new google.auth.OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    process.env.REDIRECT_URI
)

// set credentials on oauth2Client

oauth2Client.setCredentials({
    refresh_token: process.env.REFRESH_TOKEN
})

// init google drive

const drive = google.drive({
    version:'v3',
    auth:oauth2Client
})


const filePath = path.join(__dirname , 'documents/ak_1420.pdf')


app.get('/' , (req , res) => {
    res.send('<center><h1>Secure File Share</h1></center>')
})

app.get('/upload' , async (req , res) => {

    // route to upload a file

     try {

         const result = await drive.files.create({
             requestBody:{
                 name:'ak-1420-resume.pdf',
                 mimeType: 'application/pdf',
                 parents:[process.env.FOLDER_PATH]
             },
             media:{
                 mimeType:'application/pdf',
                 body:fs.createReadStream(filePath)
             }
         })

         res.send(result.data)

     } catch (error) {
         res.send(error.message)
     }
})

app.get('/delete' , async (req , res) => {

    // route to delete a file
    try {
        
       const result = await drive.files.delete({
           fileId:'1_1unxJj4t0KOTCnA7IRCO017OIWyBimg'
       })

       res.send(result)

    } catch (error) {
        res.send(error.message)
    }
})

app.get('/share' ,async (req , res) =>{

    // route to share a file

    try{
        const fileId = '1cW7maPlmKL26UGXVsDw7QDiVEgvamxyH'

        // change file permission 
        // to only read
        await drive.files.update({
            fileId:fileId,
            requestBody:{
                copyRequiresWriterPermission:true
            }
        })
       
       //create a link
       
       await drive.permissions.create({
           fileId:fileId,
           requestBody:{
               role:'reader',
               type:'anyone'
           }
       })
    
      const result =  await drive.files.get({
          fileId:fileId,
          fields:'webViewLink'
      })

      res.send(result.data)

    } catch (error) {
        res.send(error.message)
    }
})



app.listen(port , () => {
    console.log(`app running on ${port}`)
})