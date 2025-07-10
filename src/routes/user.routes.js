import {Router} from "express";
import { changeCurrentPassword, getCurrentUser, getUserChannelProfile, getWatchHistory, loginUser, logoutUser, refreshAccessToken, registerUser, updateAccountDetails, updateUserAvatar, updateUserCoverImage } from "../controllers/user.controller.js";
import {upload } from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { JsonWebTokenError } from "jsonwebtoken";
const router = Router()


 
router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount :1
        },
        {
            name: "coverImage",
            maxCount:1
        }
    ]),
    registerUser)  
//----claude code----
// Add logging middleware
// router.use((req, res, next) => {
//     console.log(`User route hit: ${req.method} ${req.path}`);
//     next();
// });

// router.route("/register").post((req, res) => {
//     console.log("Register route handler called");
//     registerUser(req, res);
// });



router.route("/login").post(loginUser)
router.route("/logout").post(verifyJWT, logoutUser)
router.route("/refresh-token").post(refreshAccessToken)
router.route("/change-password").post(verifyJWT, changeCurrentPassword)
router.route("/current-user").get(verifyJWT, getCurrentUser)
router.route("/update-acc-detaails").patch(updateAccountDetails)
router.route("/avatar").patch(verifyJWT, upload.single("avatar"), updateUserAvatar)
router.route("/cover-Image").patch(verifyJWT, upload.single("coverImage"), updateUserCoverImage)
router.route("/c/:username").get(verifyJWT, getUserChannelProfile)
router.route("/history").get(verifyJWT, getWatchHistory)
export default router