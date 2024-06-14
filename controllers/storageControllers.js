import { bucket } from "../utils/cloudStorage.js";



const getAPIImage = async (req, res, next) => {
    try {
        const { imageName } = req.params;
        if (!imageName) return res.status(400).send({ message: "Invalid api ID." });
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
}

export { getAPIImage };