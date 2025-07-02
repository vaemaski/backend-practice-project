import {Router} from "express";
import { registerUser } from "../controllers/user.controller.js";
import {upload } from "../middlewares/multer.middleware.js"
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

export default router