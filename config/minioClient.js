// import dotenv from 'dotenv'
// dotenv.config()
// import { Client } from 'minio';

// const minioClient = new Client({
//     endPoint: process.env.MINIO_ENDPOINT, // e.g., 'localhost'
//     port: parseInt(process.env.MINIO_PORT) || 9000,
//     useSSL: process.env.MINIO_USE_SSL === 'true', // true if using HTTPS
//     accessKey: process.env.MINIO_ACCESS_KEY,
//     secretKey: process.env.MINIO_SECRET_KEY,
// });

// export default minioClient;

import dotenv from 'dotenv';
import { Client } from 'minio';

dotenv.config();

const minioClient = new Client({
    endPoint: process.env.MINIO_ENDPOINT,
    port: parseInt(process.env.MINIO_PORT) || 9000,
    useSSL: process.env.MINIO_USE_SSL === 'true',
    accessKey: process.env.MINIO_ACCESS_KEY,
    secretKey: process.env.MINIO_SECRET_KEY,
});

// Helper function to generate presigned URL
export const getPresignedUrl = async (bucketName, objectName) => {
    try {
        return await minioClient.presignedGetObject(bucketName, objectName, 72 * 60 * 60); // 24 hour expiry
    } catch (error) {
        console.error('Error generating presigned URL:', error);
        throw error;
    }
};


export default minioClient;