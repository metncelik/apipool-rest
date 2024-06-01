import { X_SERVICE_URL } from "../config.js";
import { addNewAPI, getPublicAPIs, getFullAPI, queryAPIs, getUserAPIsByID, deleteAPIByID, getAPIOutputs, getAPIInputs, addAPIInput, addAPIOutput, addAPIProvider, addRunpodAPI, getRunpodAccountByEmail, asignCategoryToAPI } from "../queries/apisQueries.js";
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

export const getAPIsByAliasQuery = async (req, res, next) => {
    try {
        const aliasQuery = req.query?.alias;
        if (!aliasQuery) {
            return res.status(400).send({ message: "Please provide a alias query." });
        }
        const apis = await queryAPIs('m.alias', aliasQuery);
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
        const apiOutputs = await getAPIOutputs(api.api_id);
        api.inputs = apiInputs;
        api.outputs = apiOutputs;
        if (!api)
            return res.status(404).send({ message: "API not found." });
        res.send({ api: api });
    } catch (error) {
        next(error);
    }
};

export const addAPI = async (req, res, next) => {
    try {
        const { api, image, inputs, outputs, providers } = req.body;

        const imagePath = `apis/images/${api.alias}`
        const imageExtension = ".jpeg";

        const userId = req.user.userId;
        api.imageURL = X_SERVICE_URL + "/storage/" + imagePath + imageExtension;
        const apiId = await addNewAPI(api, userId);

        await asignCategoryToAPI(apiId, api.categoryId);

        await uploadImage(image, imagePath + imageExtension);

        for (const input of inputs) {
            console.log(input);
            await addAPIInput(apiId, input);
        }

        for (const output of outputs) {
            await addAPIOutput(apiId, output);
        }

        for (const provider of providers) {
            console.log("huhuu",provider);
            const apiProviderId = await addAPIProvider(apiId, provider.title)
            if (provider.title === "runpod") {
                const rpAccounts = await getRunpodAccountByEmail(provider.email);
                const rpAccountId = rpAccounts[Math.floor(Math.random(0, 1) * rpAccounts.length)].account_id;
                await addRunpodAPI(apiProviderId, provider.apiId, rpAccountId);
            }
        }

        res.send({ message: "API added.", apiId });
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
