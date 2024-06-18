import { X_SERVICE_URL } from "../config.js";
import { updateAPIByIdOrAlias } from "../queries/apisQueries.js";
import { bucket, uploadImage } from "../utils/cloudStorage.js";

export const getAPIImage = async (req, res, next) => {
    try {
        const { imageName } = req.params;
        const destination = `apis/images/${imageName}`
        const image = bucket.file(destination);
        const [exists] = await image.exists();
        if (!exists) return res.status(404).send({ message: "Image not found." });
        image.createReadStream()
            .on('error', (err) => {
                console.error(err);
                res.status(500).send('An error occurred');
            })
            .on('response', (response) => {
                res.set('Content-Type', 'image/jpeg');
                res.set('Cache-Control', 'public, max-age=7776000');
            })
            .pipe(res);
    } catch (error) {
        next(error);
    }
};

export const uploadAPIImage = async (req, res, next) => {
    try {
        const base64 = req.body.image;
        if (!base64) return res.status(400).send({ message: "Image is required." });
        const { apiAlias } = req.params;
        if (!apiAlias) return res.status(400).send({ message: "API alias is required." });
        const imagePath = `apis/images/${apiAlias}`
        const imageExtension = ".jpeg";
        const destination = imagePath + imageExtension;
        await uploadImage(base64, destination);
        const imageURL = X_SERVICE_URL + "/storage/" + destination;
        await updateAPIByIdOrAlias(apiAlias, { imageURL: imageURL }, false);
        res.send({ imageURL });
    } catch (error) {
        next(error);
    }
};