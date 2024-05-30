import { REST_API_URL } from "../config.js";
import { addNewEndpoint, getPublicEndpoints, getFullEndpoint, queryEndpoints, getUserEndpointsByID, deleteEndpointByID, getEndpointOutputs, getEndpointInputs, addEndpointInput, addEndpointOutput, addEndpointProvider, addRunpodEndpoint, getRunpodAccountByEmail } from "../queries/endpointsQueries.js";
import { uploadImage } from "../utils/cloudStorage.js";

export const getEndpoints = async (req, res, next) => {
    try {
        const offset = req.query?.offset;
        if (!offset || isNaN(offset)) {
            return res.status(400).send({ message: "Invalid offset." });
        };

        const limit = req.query.limit;
        if (!limit || limit < 0 || limit > 21) {
            return res.status(400).send({ message: "Invalid limit." });
        };

        const endpoints = await getPublicEndpoints(offset, limit);
        let lastOffset = 0;
        if (endpoints.length > 0) {
            lastOffset = endpoints[endpoints.length - 1].endpoint_id;
        };
        res.send({ endpoints: endpoints, lastOffset: lastOffset });
    } catch (error) {
        next(error);
    }
};

export const getMyEndpoints = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const endpoints = await getUserEndpointsByID(userId);
        res.send({ endpoints: endpoints });
    } catch (error) {
        next(error);
    }
}

export const getEndpointsByAliasQuery = async (req, res, next) => {
    try {
        const aliasQuery = req.query?.alias;
        if (!aliasQuery) {
            return res.status(400).send({ message: "Please provide a alias query." });
        }
        const endpoints = await queryEndpoints('m.alias', aliasQuery);
        res.send({ endpoints: endpoints });
    } catch (error) {
        next(error);
    }
};

export const getEndpoint = async (req, res, next) => {
    try {
        const alias = req.params?.alias;
        if (!alias)
            return res.status(400).send({ message: "Invalid endpoint alias." });

        const endpoint = await getFullEndpoint(alias);
        console.log(endpoint, alias);
        const endpointInputs = await getEndpointInputs(endpoint.endpoint_id);
        const endpointOutputs = await getEndpointOutputs(endpoint.endpoint_id);
        endpoint.inputs = endpointInputs;
        endpoint.outputs = endpointOutputs;
        if (!endpoint)
            return res.status(404).send({ message: "Endpoint not found." });
        res.send({ endpoint: endpoint });
    } catch (error) {
        next(error);
    }
};

export const addEndpoint = async (req, res, next) => {
    try {
        const { endpoint, image, inputs, outputs, providers } = req.body;

        const imagePath = `endpoints/images/${endpoint.alias}`
        const imageExtension = ".jpeg";

        const userId = req.user.userId;
        endpoint.imageURL = REST_API_URL + "/storage/" + imagePath;
        const endpointId = await addNewEndpoint(endpoint, userId);

        await uploadImage(image, imagePath + imageExtension);

        for (const input of inputs) {
            console.log(input);
            await addEndpointInput(endpointId, input);
        }

        for (const output of outputs) {
            await addEndpointOutput(endpointId, output);
        }

        for (const provider of providers) {
            console.log("huhuu",provider);
            const endpointProviderId = await addEndpointProvider(endpointId, provider.title)
            if (provider.title === "runpod") {
                const rpAccounts = await getRunpodAccountByEmail(provider.email);
                const rpAccountId = rpAccounts[Math.floor(Math.random(0, 1) * rpAccounts.length)].account_id;
                await addRunpodEndpoint(endpointProviderId, provider.endpointId, rpAccountId);
            }
        }

        res.send({ message: "Endpoint added.", endpointId });
    } catch (error) {
        next(error);
    }
};

export const deleteEndpoint = async (req, res, next) => {
    try {
        const endpointId = req.params?.endpointId;
        if (isNaN(endpointId))
            return res.status(400).send({ message: "Invalid endpoint id." });

        const endpoint = await deleteEndpointByID(endpointId, req.user.userId);
        res.send({ message: "Endpoint deleted successfully." });
    } catch (error) {
        next(error);
    }
};
