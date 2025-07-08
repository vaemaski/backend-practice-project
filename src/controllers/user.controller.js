import {asyncHandler} from "../utils/asyncHandler.js"
import {User} from "../models/user.model.js"  // Add this import
import {ApiError}  from "../utils/apiError.js"
import { uploadOnCloudinary} from "../utils/cloudinary.js";
import jwt from "jsonwebtoken";
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose from "mongoose";
import { verifyJWT } from "../middlewares/auth.middleware.js";
// //     //get user credentials from frontend
// //     //validation- not empty
// //     //check if user alr exists :username/email
// //     //check avatar and images
// //     //upload them to cloudinary
// //     //create user obj - entry in db
// //     //remove password and refresh token field from resp
// //     //check for usr creation
// //     //return res

const generateAccessAndRefreshToken = async(userId) => {
    try{
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({validateBeforeSave : false})
        return {accessToken, refreshToken}
    }catch(error){
        throw new ApiError(500, "something went wrong while generating refresh token")
    }
}

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

const loginUser = asyncHandler( async (req, res) =>{
    //req body -> data
    //check user existence - username || email
    //find user
    //passwrd check
    //access, refresh token
    //send secure cookie

    const {email, password, username} =  req.body
    console.log(email, password, username);

    if(!username && !email){
        throw new ApiError(400, "incomplete")
    }

    const user = await User.findOne({
        $or : [{username} , {email}]
    })

    if(!user){
        throw new ApiError(400, "user does not exist")
    }

    const isPasswordValid =await user.isPasswordCorrect(password)

    if(!isPasswordValid){
        throw new ApiError(401, "invalid pass!!!!!!!!!!!!!!!!!1")
    }

    const {accessToken, refreshToken} = await generateAccessAndRefreshToken(user._id)

    

    const loggedInUser = await User.findById(user._id).select("-password -refreshtoken")
    //send cookie and info to user
    const options = {
        httpOnly : true,
        secure : true,
    }
    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken" , refreshToken, options)
    .json(
         new ApiResponse(
            200,
            {
                user : loggedInUser,
                accessToken,
                refreshToken
            },
            "user logged in successfully!!!!"
        )
    )
} )


//logout
const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,{
            $set : {
                refreshToken: undefined
            }
        },
        {
            new: true,
        }
    )

    const options = {
        httpOnly : true,
        secure : true,
    }

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(
        new ApiResponse(200, {}, "user logged out")
    )
})

const refreshAccessToken = asyncHandler( async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    try {
        if(!incomingRefreshToken){
        throw new ApiError(401, "Unauthorized request")
    }
     
    const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)

    const user = await User.findById(decodedToken?._id)

    if(!user){
        throw ApiError(401 , "invalid refresh tokennnn")
    }

    //match the token from user and db
    if(incomingRefreshToken != user?.refreshToken){
        throw new ApiError(401, "Refresh token expired or used")
    }

    const options = {
        httpOnly: true ,
        secure : true
    }
    const {accessToken, newrefreshToken} = await generateAccessAndRefreshToken(user._id)

    return res
    .status(200)
    .cookie("accessToken" , accessToken , options)
    .cookie("refreshToken", newrefreshToken , options)
    .json(
        new ApiResponse(
            200,
            {accessToken, refreshToken: newrefreshToken},
            "accesstoken refreshed"
        )
    )
    } catch (error) {
        throw new ApiError(401, "invalid refrewh token")
    }
})

const changeCurrentPassword = asyncHandler( async (req, res) => {
    const {oldPassword, newPassword} = req.body

    const user = await User.findById(req.user?._id)
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

    if(!isPasswordCorrect){
        throw new ApiError(400, "invalid pass")
    }
    
    user.password = newPassword
    await user.save({validateBeforeSave : false})

    return res
    .status(200)
    .json(new ApiResponse (200, {}, "password changed bitch"))

})

const getCurrentUser = asyncHandler( async (req, res) => {
    return res
    .status(200)
    .json(200, req.user, "user fetched")
})

const updateAccountDetails = asyncHandler(async (req, res) => {
    const {fullName, email} = req.body

    if(!fullName || !email){
        throw new ApiError(400, "all fields are req!!")
    }

    const user = User.findByIdAndUpdate(
        req.user?._id,
        {
            $set : {
                fullName : fullName,
                email : email
            }
        },
        {new : true}
    ).select("-password")

    return res
    .status(200)
    .json(new ApiResponse(200, user, "account details updated"))

})

const updateUserAvatar = asyncHandler(async (req, res) => {
    const localAvatarPath = req.file?.path

    if(!localAvatarPath){
        throw new ApiError(400, "avatar file missing")
    }

    const avatar = await uploadOnCloudinary(localAvatarPath)

    if(avatar.url){
        throw new ApiError(400, "error while uploading avatar")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set : {
                avatar: avatar.url
            }
        },
        {new : true}
    ).select("-password")

    return res
    .status(200)
    .json(new ApiResponse(200, {} , "account avatar updated"))

})

const updateUserCoverImage = asyncHandler(async (req, res) => {
    const localCoverImagePath = req.file?.path

    if(!localCoverImagePath){
        throw new ApiError(400, "image file missing")
    }

    const coverImage = await uploadOnCloudinary(localCoverImagePath)

    if(avatar.url){
        throw new ApiError(400, "error while uploading image")
    }

    const user  = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set : {
                coverImage: coverImage.url
            }
        },
        {new : true}
    ).select("-password")

    return res
    .status(200)
    .json(new ApiResponse(200, user , "account  cover updated"))

})
       
        



export {registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage
}