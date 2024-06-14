import { X_SERVICE_URL } from "../config.js";
import {
    addNewAPI, getPublicAPIs,
    getFullAPI, queryAPIs,
    getUserAPIsByID, deleteAPIByID,
    getAPIOutputs, getAPIInputs,
    addAPIInput, addAPIOutput,
    addAPIProvider, addRunpodAPI,
    getRunpodAccountByEmail, asignCategoryToAPI,
    getInputRelations, addInputRealtion,
    getStabilityAccountByEmail,
    addStabilityAPI,
    getAPIInputId
} from "../queries/apisQueries.js";
import { uploadImage } from "../utils/cloudStorage.js";

export const getAPIs = async (req, res, next) => {
    try {
        const offset = req.query?.offset;
        if (!offset || isNaN(offset)) {
            return res.status(400).send({ message: "Invalid offset." });
        };

        const limit = req.query.limit;
        if (!limit || limit < 0 || limit > 21) {
            return res.status(400).send({ message: "Invalid limit." });
        };

        const apis = await getPublicAPIs(offset, limit);
        let lastOffset = 0;
        if (apis.length > 0) {
            lastOffset = apis[apis.length - 1].api_id;
        };

        res.set('Cache-Control', 'public, max-age=18000');
        res.send({ apis: apis, lastOffset: lastOffset });
    } catch (error) {
        next(error);
    }
};

export const getMyAPIs = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const apis = await getUserAPIsByID(userId);
        res.send({ apis: apis });
    } catch (error) {
        next(error);
    }
}

export const getAPIsByQuery = async (req, res, next) => {
    try {
        const aliasQuery = req.query?.alias;
        if (!aliasQuery) {
            return res.status(400).send({ message: "Please provide a alias query." });
        }
        const apis = await queryAPIs(aliasQuery);

        res.set('Cache-Control', 'public, max-age=18000');
        res.send({ apis: apis });
    } catch (error) {
        next(error);
    }
};

export const getAPI = async (req, res, next) => {
    try {
        const alias = req.params?.alias;
        if (!alias)
            return res.status(400).send({ message: "Invalid api alias." });

        const api = await getFullAPI(alias);
        if (!api)
            return res.status(404).send({ message: "API not found." });
        const apiInputs = await getAPIInputs(api.api_id);
        for (const input of apiInputs) {
            input.relations = await getInputRelations(input.input_id);
        }

        const apiOutputs = await getAPIOutputs(api.api_id);
        api.inputs = apiInputs;
        api.outputs = apiOutputs;
        if (!api)
            return res.status(404).send({ message: "API not found." });

        res.set('Cache-Control', 'public, max-age=18000');
        res.send({ api: api });
    } catch (error) {
        next(error);
    }
};

export const addAPI = async (req, res, next) => {
    try {
        const { api, image, inputs, outputs, providers } = req.body;
        if (/^[a-z](?:[a-z0-9\-]{6,25})$/.test(api.alias) === false)
            return res.status(400).send({ message: "Model alias must be between 6 and 25 characters and start with a lowercase letter, and can contain just lowercase letters hypens(\"-\") and numbers" });
        const imagePath = `apis/images/${api.alias}`
        const imageExtension = ".jpeg";

        const userId = req.user.userId;
        api.imageURL = X_SERVICE_URL + "/storage/" + imagePath + imageExtension;
        const apiId = await addNewAPI(api, userId);
        try {
            await asignCategoryToAPI(apiId, api.categoryId);

            await uploadImage(image, imagePath + imageExtension);

            for (const input of inputs) {
                await addAPIInput(apiId, input);
            }

            for (const output of outputs) {
                await addAPIOutput(apiId, output);
            }

            for (const provider of providers) {
                const apiProviderId = await addAPIProvider(apiId, provider.title)
                if (provider.title === "runpod") {
                    const rpAccount = await getRunpodAccountByEmail(provider.email);
                    await addRunpodAPI(apiProviderId, provider.endpointId, rpAccount.account_id);
                } else if (provider.title === "stability") {
                    const sbAccount = await getStabilityAccountByEmail(provider.email);
                    console.log(sbAccount, "sbAccount");
                    await addStabilityAPI(apiProviderId, provider.modelId, sbAccount.account_id);
                }
            }

            res.send({ message: "API added.", apiId });

        } catch (error) {
            deleteAPIByID(apiId, userId);
            throw error;
        }
    } catch (error) {
        next(error);
    }
};

export const addApiInputs = async (req, res, next) => {
    try {
        const { apiId, inputs } = req.body;
        for (const input of inputs) {
            await addAPIInput(apiId, input);
        }
        res.send({ message: "Inputs added." });
    } catch (error) {
        next(error);
    }
};

export const addInputRealtions = async (req, res, next) => {
    try {
        const { apiAlias, relations } = req.body;
        for (const relation of relations) {
            relation.inputId = await getAPIInputId(apiAlias, relation.inputTitle);
            relation.relatedInputId = await getAPIInputId(apiAlias, relation.relatedInputTitle);
            console.log(relation, "relation");
            await addInputRealtion(relation);
        }
        res.send({ message: "Relations added." });
    } catch (error) {
        next(error);
    }
};

export const addApiOutputs = async (req, res, next) => {
    try {
        const { apiId, outputs } = req.body;
        for (const output of outputs) {
            await addAPIOutput(apiId, output);
        }
        res.send({ message: "Outputs added." });
    } catch (error) {
        next(error);
    }
};


export const deleteAPI = async (req, res, next) => {
    try {
        const apiId = req.params?.apiId;
        if (isNaN(apiId))
            return res.status(400).send({ message: "Invalid api id." });

        const api = await deleteAPIByID(apiId, req.user.userId);
        res.send({ message: "API deleted successfully." });
    } catch (error) {
        next(error);
    }
};
