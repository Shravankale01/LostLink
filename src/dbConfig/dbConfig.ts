
import mongoose from 'mongoose';

export async function connect() {
    try {
        // Check if MONGODB_URI exists
        if (!process.env.MONGODB_URI) {
            throw new Error('MONGODB_URI is not defined');
        }

        // Connection options
        const options = {
            bufferCommands: false,
            serverSelectionTimeoutMS: 10000,
            socketTimeoutMS: 45000,
        };

        // Check existing connection
        if (mongoose.connections[0].readyState) {
            return console.log('Using existing MongoDB connection');
        }

        // Create new connection
        const conn = await mongoose.connect(process.env.MONGODB_URI, options);
        console.log(`MongoDB connected: ${conn.connection.host}`);
        
        return conn;

    } catch (error: any) {
        console.error('MongoDB connection error:', error.message);
        // Don't throw error to prevent 500 response
        return null;
    }
}