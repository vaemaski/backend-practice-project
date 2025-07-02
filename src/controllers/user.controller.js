import {asyncHandler} from "../utils/asyncHandler.js"
import {User} from "../models/user.model.js"  // Add this import
import {ApiError}  from "../utils/apiError.js"
import { uploadOnCloudinary} from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
// //     //get user credentials from frontend
// //     //validation- not empty
// //     //check if user alr exists :username/email
// //     //check avatar and images
// //     //upload them to cloudinary
// //     //create user obj - entry in db
// //     //remove password and refresh token field from resp
// //     //check for usr creation
// //     //return res
const registerUser = asyncHandler( async (req, res) => {
    
        console.log("Register function called");
        console.log("Request body:", req.body);
        
        const { email, password, username, fullName,} = req.body;
     
        if(
            [fullName, email, username, password].some((field) => 
            field?.trim()==="")
        ){
            throw new ApiError(400, "errrrrprrrrrrr")
        }

        //check if user already exists
        const existedUser = await User.findOne({
            $or: [{username}, {email}]
        })

        if(existedUser){
            throw new ApiError(409, "user already exists!!")
        }
        const avatarLocalPAth =  req.files?.avatar[0]?.path
        // console.log(avatarLocalPAth);
        //const coverImageLocalPath = req.files?.coverImage[0]?.path
        let coverImageLocalPath;
        if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.lengh > 0){
            coverImageLocalPath = req.files.coverImage[0].path
        }

        if(!avatarLocalPAth){
            throw new ApiError(400, "avatar req")
        }

        const avatar = await uploadOnCloudinary(avatarLocalPAth)
        const coverImage = await uploadOnCloudinary(coverImageLocalPath)

        


        if(!avatar){
            throw new ApiError(400, "avatar file req!!")
        }

        const user = await User.create({
            fullName,
            avatar: avatar.url,
            coverImage : coverImage?.url || "",
            email,
            password,
            username : username.toLowerCase()
        })

         const createdUser =  await User.findById(user._id).select("-password -refreshToken")
         if(!createdUser){
            throw new ApiError(500,"idk mahn server error")
         }   
         return res.status(201).json(
            new ApiResponse(200, createdUser,"user registered!!")
         )     
    
});

        



export {registerUser}