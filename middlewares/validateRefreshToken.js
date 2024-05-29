import jwt from "jsonwebtoken";
import { getRefreshToken } from "../queries/authQueries.js";
import { REFRESH_SECRET } from "../config.js";

//for logout and refresh
export const validateRefreshToken = async (req, res, next) => {
    try {
        const refreshToken = req.cookies?.refresh_token;
        if (!refreshToken)
            return res.status(400).send({
                message: "Please provide a Refresh Token.",
            });

        const { userId, role } = jwt.verify(refreshToken, REFRESH_SECRET);

        const remoteRefreshToken = await getRefreshToken(userId);
        if (remoteRefreshToken !== refreshToken)
            return res.status(401).send({
                message: "Refresh token is invalid.",
            });
        req.user = { userId, role };
        next();
    } catch (error) {
        next(error);
    }
}