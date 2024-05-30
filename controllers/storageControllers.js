import { bucket } from "../utils/cloudStorage.js";

const getEndpointImage = async (req, res, next) => {
    try {
        const { endpointId } = req.params;
        if (!endpointId) return res.status(400).send({ message: "Invalid endpoint ID." });
        const destination = `endpoints/images/${endpointId}.jpeg`
        const image = bucket.file(destination);
        const [exists] = await image.exists();
        if (!exists) return null;
        image.createReadStream()
            .on('error', (err) => {
                console.error(err);
                res.status(500).send('An error occurred');
            })
            .on('response', (response) => {
                console.log("hebele");
                res.set('Content-Type', 'image/jpeg');
            })
            .pipe(res);
    } catch (error) {
        next(error);
    }
}

export { getEndpointImage };