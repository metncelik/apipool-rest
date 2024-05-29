import { SERVER_URL } from "../config.js";
import { addNewModel, getPublicModels, getFullModel, queryModels, getUserModelsByID, deleteModelByID, getModelOutputs, getModelInputs, addModelInput, addModelOutput } from "../queries/modelsQueries.js";
import { uploadImage } from "../utils/cloudStorage.js";

export const getModels = async (req, res, next) => {
    try {
        const offset = req.query?.offset;
        if (!offset || isNaN(offset)) {
            return res.status(400).send({ message: "Invalid offset." });
        };

        const limit = req.query.limit;
        if (!limit || limit < 0 || limit > 21) {
            return res.status(400).send({ message: "Invalid limit." });
        };

        const models = await getPublicModels(offset, limit);
        let lastOffset = 0;
        if (models.length > 0) {
            lastOffset = models[models.length - 1].model_id;
        };
        res.send({ models: models, lastOffset: lastOffset });
    } catch (error) {
        next(error);
    }
};

export const getMyModels = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const models = await getUserModelsByID(userId);
        res.send({ models: models });
    } catch (error) {
        next(error);
    }
}

export const getModelsByAliasQuery = async (req, res, next) => {
    try {
        const aliasQuery = req.query?.alias;
        if (!aliasQuery) {
            return res.status(400).send({ message: "Please provide a alias query." });
        }
        const models = await queryModels('m.alias', aliasQuery);
        res.send({ models: models });
    } catch (error) {
        next(error);
    }
};

export const getModel = async (req, res, next) => {
    try {
        const alias = req.params?.alias;
        if (!alias)
            return res.status(400).send({ message: "Invalid model alias." });

        const model = await getFullModel(alias);
        console.log(model, alias);
        const modelInputs = await getModelInputs(model.model_id);
        const modelOutputs = await getModelOutputs(model.model_id);
        model.inputs = modelInputs;
        model.outputs = modelOutputs;
        if (!model)
            return res.status(404).send({ message: "Model not found." });
        res.send({ model: model });
    } catch (error) {
        next(error);
    }
};

export const addModel = async (req, res, next) => {
    try {
        const {model, image, inputs, outputs } = req.body;
        
        const imagePath = `models/images/${model.alias}`
        const imageExtension = ".jpeg";
        
        const userId = req.user.userId;
        model.imageURL = SERVER_URL + "/storage/" + imagePath;
        const modelID = await addNewModel(model, userId);
        
        await uploadImage(image, imagePath + imageExtension);
        
        for (const input of inputs) {
            console.log(input);
            await addModelInput(modelID, input);
        }
        for (const output of outputs) {
            await addModelOutput(modelID, output);
        }

        res.send({ message: "Model added.", modelID });
    } catch (error) {
        next(error);
    }
};

export const deleteModel = async (req, res, next) => {
    try {
        const modelID = req.params?.modelID;
        if (isNaN(modelID))
            return res.status(400).send({ message: "Invalid model id." });

        const model = await deleteModelByID(modelID, req.user.userId);
        res.send({ message: "Model deleted successfully." });
    } catch (error) {
        next(error);
    }
};
