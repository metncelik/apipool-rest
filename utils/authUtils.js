import { REFRESH_SECRET, cookieConfig } from "../config.js";
import { updateLoginDate, updateRefreshToken } from "../queries/authQueries.js";
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

const isValidPassword = (password) => {
    if (!/(?=.*[A-Z])/.test(password)) {
        return 'Password must contain at least one uppercase letter.';
    }
    if (!/(?=.*[a-z])/.test(password)) {
        return 'Password must contain at least one lowercase letter.';
    }
    if (!/(?=.*[0-9])/.test(password)) {
        return 'Password must contain at least one number.';
    }
    if (!/(?=.*[!@#$%^&*])/.test(password)) {
        return 'Password must contain at least one special character (!@#$%^&*).';
    }
    if (password.length < 8) {
        return 'Password must be at least 8 characters long.';
    }
    return null;
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
    res.cookie('refresh_token', refreshToken, cookieConfig);
}

export {
    isValidEmail,
    isValidPassword,
    createRefreshToken,
    hashPassword,
    comparePasswords,
    setCookies
}