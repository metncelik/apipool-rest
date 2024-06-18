import { Storage } from '@google-cloud/storage';
import { storageConfig } from '../config.js';
import sharp from 'sharp';

const storage = new Storage(storageConfig);

const bucket = storage.bucket('apipool-storage');


const uploadFile = async (file, destination) => {
    const newFile = bucket.file(destination);
    return newFile.save(file);
}

const uploadImage = async (base64, destination) => {
    const buffer = Buffer.from(base64, 'base64');
    const image = sharp(buffer).jpeg().resize(512, 512).toBuffer();
    return await uploadFile(image, destination);
}

const downloadFile = async (destination) => {
    const file = bucket.file(destination);
    const [exists] = await file.exists();
    if (!exists) return null;
    const fileBuffer = await file.download();
    return fileBuffer[0];
}

export { uploadImage, downloadFile, bucket };