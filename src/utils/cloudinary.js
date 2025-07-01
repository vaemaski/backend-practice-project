import {v2 as cloudinary} from "cloudinary"
import fs from "fs"



    // Configuration
    cloudinary.config({ 
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
        api_key:  process.env.CLOUDINARY_API_KEY, 
        api_secret: process.env.CLOUDINARY_API_SECRET // Click 'View API Keys' above to copy your API secret
    }) 

const uploadOnCloud = async (localFilePath) => {
    try{
        if (!localFilePath) return null
        //uploading file
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type : "auto"
        })
        console.log("file is uploaded on cloudinary", response.url);
    } catch(error){
        fs.unlinkSync(localFilePath) //remove the locally saved temp file as op failed
    }
}

export {uploadOnCloud}




