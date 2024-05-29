import { CLIENT_URL, DOMAIN, REFRESH_SECRET } from "../config.js";
import { updateLoginDate, updateRefreshToken } from "../queries/authQueries.js";
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

const isValidPassword = (password) => {
    return typeof password === 'string' && /^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[!@#$%^&*])/.test(password) && password.length >= 8;
}

const hashPassword = (password) => {
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);
    return hashedPassword;
}

const comparePasswords = (password, hashedPassword) => {
    return bcrypt.compareSync(password, hashedPassword);
}

const createRefreshToken = async (payload) => {
    const refreshTokenOptions = { expiresIn: '2d' };
    const refreshToken = jwt.sign(payload, REFRESH_SECRET, refreshTokenOptions);
    const { userId } = payload;

    await updateRefreshToken(userId, refreshToken);
    await updateLoginDate(userId);

    return refreshToken;
}

const setCookies = (res, refreshToken) => {
    res.header('Access-Control-Allow-Credentials', true);
    res.cookie('refresh_token', refreshToken, {
        httpOnly: true,
        domain: DOMAIN,
        expires: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
    }
);
}

export {
    isValidEmail,
    isValidPassword,
    createRefreshToken,
    hashPassword,
    comparePasswords,
    setCookies
}