import mongoose from "mongoose";
import dotenv from 'dotenv';

dotenv.config();

const URL = process.env.MONGODB_URI;

export const ConnectDB = async () => {
    try {
        await mongoose.connect(URL,);
        console.log(' DB Connected Successfully');
    } catch (error) {
        console.error(`Error while connecting DB: ${error.message}`);
        process.exit(1); // Fail fast if DB connection fails
    }
};
