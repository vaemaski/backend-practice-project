//require('dotenv').config({path: '../.env'});

import dotenv from "dotenv"
dotenv.config({
    path:'../.env'
})

import mongoose from 'mongoose';
import { DB_NAME } from './constants.js';
import connectDB from './db/index.js';


connectDB()


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