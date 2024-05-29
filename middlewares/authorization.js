import jwt from 'jsonwebtoken';
import { ACCESS_SECRET } from '../config.js';

const authorization = (req, res, next) => {
    const token = req.headers?.authorization?.split(" ")[1];
    if (!token) {
        return res.status(401).send({ message: "Please provide an Access Token." });
    }
    const tokenData = jwt.verify(token, ACCESS_SECRET);
    if (!tokenData) {
        return res.status(401).send({ message: "Invalid Access Token." });
    }
    req.user = tokenData;
    next();
}

export const isAdmin = (req, res, next) => {
    if (req.user?.role !== 'Admin') {
        return res.status(403).send({ message: "Forbidden: You are not an Admin." });
    }
    next();
}

export default authorization;