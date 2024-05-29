import { insertAPIKey, getActiveAPIKeys, revokeAPIKey } from "../queries/apiKeysQueries.js";
import { v4 as uuid } from "uuid";


export const getAPIKeys = async (req, res, next) => {
    try {
        const apiKeys = await getActiveAPIKeys(req.user.userId);
        res.send({ apiKeys });
    } catch (error) {
        next(error);
    }
};

export const addAPIKey = async (req, res, next) => {
    try {
        const apiTitle = req.body?.apiTitle;
        if (!apiTitle) {
            return res.status(400).send({ message: "Please provide an API Name." });
        }

        if (apiTitle.length < 3 || apiTitle.length > 15) {
            return res.status(400).send({ message: "API Name must be between 3 and 20 characters." });
        }

        const apiTitleRegex = /^[a-z][a-z0-9_-]*$/;
        if (!apiTitleRegex.test(apiTitle)) {
            return res.status(400).send("Invalid API Name. It should start with a lowercase letter or a number, and can contain lowercase letters, numbers, underscores, and hyphens.");
        }

        const newAPIKey = "AP1-" + uuid();
        const apiKey = await insertAPIKey(apiTitle, newAPIKey, req.user.userId);
        res.send({ apiKey });
    } catch (error) {
        next(error);
    }
};

export const deleteAPIKey = async (req, res, next) => {
    try {
        const apiKey = req.params.apiKey;
        await revokeAPIKey(apiKey, req.user.userId);
        res.send({ message: "API Key revoked." });
    } catch (error) {
        next(error);
    }
};
