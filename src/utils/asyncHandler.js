const asyncHandler = (requestHandler) => {
    return (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err))
    }
}  

export {asyncHandler}




// //func as arg and then again passing a func which is async too
// //const asyncHandler = (fn) =>async () => {}
    // //this is try catch handler
// const asyncHandler = (fn) => async (req, res, next) => {
//     try{
//         await fn(req, res, next) 
//         }
//     catch(error){
//         res.status(err.code || 500).json({
//             success: false,
//             message: err.message
//         })
//     }
// }