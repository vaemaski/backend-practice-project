//require('dotenv').config({path: '../.env'});

import dotenv from "dotenv"
dotenv.config({
    path:'../.env'
})

import mongoose from 'mongoose';
import { DB_NAME } from './constants.js';
import connectDB from './db/index.js';
import { app } from "./app.js";


connectDB()
.then(()=>{
    app.listen(process.env.PORT || 8000)
    console.log(`server s running zt port ${process.env.PORT}`)
})
.catch((err)=> {
    console.log('error found!!', err)
})


/*   thru iffi directly connenting on index file
import express from 'express';


const app = express()


///one way to connect to db-
// function connectDB(){}
// connectDB


//better with iffi
;( async () => {
    try{
        await mongoose.connect(`${process.env.MONGO_URI}/${DB_NAME}`)
        app.on('error', (error)=>{
            console.log('ERR:', error)
            throw error
        })
        app.listen(process.env.PORT,() => {
            console.log(`app is listening on port ${process.env.PORT}`)
        })
    } catch (error){
        console.error('error:', error);
        throw error;
    }
})()
*/