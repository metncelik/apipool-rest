import { Storage } from '@google-cloud/storage';
import { storageConfig } from '../config.js';
import sharp from 'sharp';

const storage = new Storage(storageConfig);

const bucket = storage.bucket('apipool-storage');


const uploadFile = async (buffer, destination) => {
    const image = sharp(buffer).jpeg().resize(512, 512).toBuffer();
    const newFile = bucket.file(destination);
    return newFile.save(image);
}

const uploadImage = async (base64, destination) => {
    const buffer = Buffer.from(base64, 'base64');
    return await uploadFile(buffer, destination);
}

const downloadFile = async (destination) => {
    const file = bucket.file(destination);
    const [exists] = await file.exists();
    if (!exists) return null;
    const fileBuffer = await file.download();
    return fileBuffer[0];
}

export { uploadImage, downloadFile, bucket };