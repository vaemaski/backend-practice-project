import {v2 as cloudinary} from "cloudinary"
import fs from "fs"



    // Configuration
    cloudinary.config({ 
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
        api_key:  process.env.CLOUDINARY_API_KEY, 
        api_secret: process.env.CLOUDINARY_API_SECRET // Click 'View API Keys' above to copy your API secret
    }) 

const uploadOnCloudinary = async (localFilePath) => {
    try{
        if (!localFilePath) return null
        //uploading file
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type : "auto"
        })
        //file has been uploaded
      
        console.log("file is uploaded on cloudinary",  response.secure_url);
        
        fs.unlinkSync(localFilePath) //cleANUP after successful upload
                
        return {
            url : response.secure_url,
            public_id : response.public_id
        };
    } catch(error){
        if (fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath); // ✅ safety check before deleting
        }
        console.error("Cloudinary upload error:", error);
        return null;
    }
}

export {uploadOnCloudinary}




