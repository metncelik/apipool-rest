import {
    insertAPIKey,
    getActiveApiKeys,
    revokeAPIKey,
    getRecentRequests,
    getRequestsCountByHour,
    getDelayAndExecutionTimeByHour,
    getLastAPIKey
} from "../queries/apiKeysQueries.js";
import { v4 as uuid } from "uuid";
import { validateApiTitle } from "../utils/apiKeysUtils.js";


export const getApiKeys = async (req, res, next) => {
    try {
        const apiKeys = await getActiveApiKeys(req.user.userId);
        res.send({ apiKeys });
    } catch (error) {
        next(error);
    }
};

export const getOneAPIKey = async (req, res, next) => {
    try {
        console.log("getOneAPIKey");
        let apiKey = await getLastAPIKey(req.user.userId);
        if (!apiKey) {
            const newAPIKey = "AP1-" + uuid();
            const apiTitle = "default";
            apiKey = (await insertAPIKey(apiTitle, newAPIKey, req.user.userId)).api_key;
        }
        res.send({ apiKey });
    } catch (error) {
        next(error);
    }
}


export const addAPIKey = async (req, res, next) => {
    try {
        const apiTitle = req.body?.apiTitle;
        if (!apiTitle) {
            return res.status(400).send({ message: "Please provide an API Name." });
        }

        const errorMessage = validateApiTitle(apiTitle);
        if (errorMessage) {
            return res.status(400).send({ message: errorMessage });
        }

        const newAPIKey = "AP1-" + uuid();
        const apiKey = await insertAPIKey(apiTitle, newAPIKey, req.user.userId);
        res.send({ apiKey, message: "API Key created." });
    } catch (error) {
        next(error);
    }
};

export const deleteAPIKey = async (req, res, next) => {
    try {
        const apiKey = req.params.apiKey;
        await revokeAPIKey(apiKey, req.user.userId);
        res.send({ message: "API Key deleted." });
    } catch (error) {
        next(error);
    }
};

export const getRequests = async (req, res, next) => {
    try {
        const recentRequests = await getRecentRequests(req.user.userId);
        const requestsByHour = await getRequestsCountByHour(req.user.userId);
        const delayAndExecutionTimes = await getDelayAndExecutionTimeByHour(req.user.userId);
        res.send({ requests: recentRequests, requestsByHour, delayAndExecutionTimes });
    } catch (error) {
        next(error);
    }
};