import { getEmail, getUser } from "../queries/userQueries.js";

const getMe = async (req, res, next) => {
    try {
        const user = await getUser(req.user.userId);
        const email = await getEmail(req.user.userId);
        res.send({ user: { ...user, email } });
    } catch (error) {
        next(error);
    }
}

export {
    getMe
};