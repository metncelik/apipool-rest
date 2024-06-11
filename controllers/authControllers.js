import jwt from 'jsonwebtoken';
import { v4 as uuid } from 'uuid';
import { ACCESS_SECRET, ACCESS_TOKEN_TTL, CLIENT_URL, COOKIE_DOMAIN, X_SERVICE_URL, resetYourPasswordTemplate, verifyEmailTemplate } from '../config.js';
import { createRefreshToken, hashPassword, isValidPassword, setCookies, comparePasswords } from '../utils/authUtils.js';
import { sendEmail } from '../utils/mailService.js';
import { getGoogleUserInfo } from '../apis/google.js';
import {
    addAuthMethodEmail,
    addAuthMethodGoogle,
    createUserWithEmailPassword,
    createUserWithGithubAuth,
    createUserWithGoogleAuth,
    getEmailVerificationBySecret,
    getEmailVerificationByEmail,
    getAllAuthMethods,
    getEmailAndPasswordByID,
    getUserByEmail,
    getUserByGoogleID,
    getuserByGithubID,
    githubAuthExists,
    googleAuthExists,
    updatePassword,
    updateRefreshToken,
    updateEmailSecretKey,
    verifyEmailAuth,
    changePasswordByEmailSecret,
    deleteEmailSecretKey,
    addAuthMethodGithub
} from '../queries/authQueries.js';
import { getGithubEmails, getGithubUserInfo } from '../apis/github.js';

const signUp = async (req, res, next) => {
    try {
        const hashedPassword = hashPassword(req.password);

        const verifySecret = "APV-" + uuid();
        await createUserWithEmailPassword(req.email, hashedPassword, verifySecret);

        const verifyURL = CLIENT_URL + `/verify-email?secretKey=${verifySecret}`;
        await sendEmail(req.email, "🎉 Welcome to API POOL!", verifyEmailTemplate(verifyURL));

        res.send({ message: "User Created! Check your email for verification." });
    } catch (error) {
        next(error);
    }
};

const login = async (req, res, next) => {
    try {
        const remoteUser = await getUserByEmail(req.email);
        if (!remoteUser)
            return res.status(404).send({ message: "User not found!" });

        const { user_id, hashed_password, role, verified } = remoteUser;
        if (!verified)
            return res.status(401).send({ message: "Email not verified!" });

        const isPasswordCorrect = comparePasswords(req.password, hashed_password);
        if (!isPasswordCorrect)
            return res.status(401).send({ message: "Invalid password!" });

        const payload = { userId: user_id, role };
        const refreshToken = await createRefreshToken(payload);

        setCookies(res, refreshToken);
        res.send({ message: "Logged in." });
    } catch (error) {
        next(error);
    }
};

const refresh = async (req, res, next) => {
    try {
        const accessTokenOptions = { expiresIn: ACCESS_TOKEN_TTL }
        const accessToken = jwt.sign(req.user, ACCESS_SECRET, accessTokenOptions);
        return res.send({ accessToken });
    } catch (error) {
        next(error);
    }
};

const googleAuth = async (req, res, next) => {
    try {
        const { code } = req.body;
        if (!code)
            return res.status(400).send({ message: "Please provide a code." });

        const { method } = req.params;

        const userData = await getGoogleUserInfo(code, method);
        const googleID = userData.id;

        let user;

        if (method === "login" || (method === "sign-up" && await googleAuthExists(googleID))) {
            user = await getUserByGoogleID(googleID);
            if (!user)
                return res.status(404).send({ message: "User not found." });
        } else if (method === "sign-up") {
            const user_id = await createUserWithGoogleAuth(userData);
            user = { user_id, role: "User" };
        } else
            return res.status(400).send({ message: "Invalid auth method." });

        const refreshToken = await createRefreshToken({ userId: user.user_id, role: user.role });
        setCookies(res, refreshToken);
        res.send({ message: "Logged in." });
    } catch (error) {
        next(error);
    }
}

const addGoogleAuthMethod = async (req, res, next) => {
    try {
        const { code } = req.body;
        if (!code)
            return res.status(400).send({ message: "Please provide a code." });

        const userData = await getGoogleUserInfo(code, "add");
        const googleID = userData.id;

        const googleAuthUserExists = await googleAuthExists(googleID);

        if (googleAuthUserExists)
            return res.status(409).send({ message: "Google Auth already exists." });

        const userId = req.user.userId;
        await addAuthMethodGoogle(userData, userId);

        res.send({ message: "Google Auth added." });
    } catch (error) {
        next(error);

    }
}

const githubAuth = async (req, res, next) => {
    try {
        const { code } = req.body;
        if (!code)
            return res.status(400).send({ message: "Please provide a code." });

        const { method } = req.params;

        const { userData, config } = await getGithubUserInfo(code);
        const githubID = userData.id;

        let user;

        if (method === "login" || (method === "sign-up" && await githubAuthExists(githubID))) {
            user = await getuserByGithubID(githubID);
            if (!user)
                return res.status(404).send({ message: "User not found." });
        }
        else if (method === "sign-up") {
            const emails = await getGithubEmails(config);
            const primaryEmail = emails.find(e => e.primary);
            const user_id = await createUserWithGithubAuth(userData, primaryEmail);
            user = { user_id, role: "User" };
        } else
            return res.status(400).send({ message: "Invalid auth method." });

        const refreshToken = await createRefreshToken({ userId: user.user_id, role: user.role });
        setCookies(res, refreshToken);
        res.send({ message: "Logged in." });
    } catch (error) {
        next(error);
    }
}

const addGithubAuthMethod = async (req, res, next) => {
    try {
        const { code } = req.body;
        if (!code)
            return res.status(400).send({ message: "Please provide a code." });

        const { userData, config } = await getGithubUserInfo(code);
        const githubID = userData.id;

        const githubAuthUserExists = await githubAuthExists(githubID);

        if (githubAuthUserExists)
            return res.status(409).send({ message: "This Github account already exists as an auth method." });

        const emails = await getGithubEmails(config);
        const primaryEmail = emails.find(e => e.primary);

        const userId = req.user.userId;
        await addAuthMethodGithub(userData, primaryEmail, userId);

        res.send({ message: "Github Auth added." });
    } catch (error) {
        next(error);
    }
}


const verifyEmail = async (req, res, next) => {
    try {
        const { authorization } = req.headers;
        if (!authorization)
            return res.status(400).send({ message: "Please provide a Secret Key." });

        const emailAuth = await getEmailVerificationBySecret(authorization);
        if (!emailAuth)
            return res.status(404).send({ message: "Secret Key not found or expired." });
        if (emailAuth.verified)
            return res.status(409).send({ message: "Email already verified." });
        if (emailAuth.email_sent_at < new Date(Date.now() - 1000 * 60 * 60))
            return res.status(409).send({ message: "Verification link expired." });

        await verifyEmailAuth(authorization);
        await deleteEmailSecretKey(authorization);

        res.status(200).send({ message: "Email verified." });
    } catch (error) {
        next(error);
    }
}

const sendVerifyEmail = async (req, res, next) => {
    try {
        const { email } = req.body;
        if (!email)
            return res.status(400).send({ message: "Please provide an email." });
        const { verified, email_sent_at } = await getEmailVerificationByEmail(email);
        if (verified)
            return res.status(409).send({ message: "Email already verified." });
        if (email_sent_at > new Date(Date.now() - 1000 * 60 * 1))
            return res.status(429).send({ message: "Too many requests! Try in 1 minitue." });

        const verifySecret = "APV-" + uuid();
        await updateEmailSecretKey(email, verifySecret);

        const verifyURL = CLIENT_URL + `/verify-email?secretKey=${verifySecret}`;
        await sendEmail(email, "🎉 Verify your email!", verifyEmailTemplate(verifyURL));

        res.send({ message: "Verification email sent." });
    } catch (error) {
        next(error);
    }
}


const sendResetPasswordMail = async (req, res, next) => {
    try {
        const { email } = req.body;
        if (!email)
            return res.status(400).send({ message: "Please provide an email." });

        const { verified, email_sent_at } = await getEmailVerificationByEmail(email);
        if (!verified)
            return res.status(409).send({ message: "Email not verified." });
        if (email_sent_at > new Date(Date.now() - 1000 * 60 * 1))
            return res.status(429).send({ message: "Too many Requests. Try in 1 minitue." });

        const resetSecret = "APR-" + uuid();
        await updateEmailSecretKey(email, resetSecret);
        const resetURL = CLIENT_URL + `/reset-password?secretKey=${resetSecret}`;
        await sendEmail(email, "🔑 Reset your password!", resetYourPasswordTemplate(resetURL));
        res.send({ message: "Reset password email sent." });
    }
    catch (error) {
        next(error);
    }
}

const resetPassword = async (req, res, next) => {
    try {
        const secretKey = req.headers.authorization;
        if (!secretKey)
            return res.status(400).send({ message: "Secret Key not found or expired." });

        const { password } = req.body;
        if (!password)
            return res.status(400).send({ message: "Please provide a new password." });

        const passwordErrorMessage = isValidPassword(password);
        if (passwordErrorMessage)
            return res.status(400).send({ message: passwordErrorMessage });

        const hashedPassword = hashPassword(password);

        const email = await changePasswordByEmailSecret(secretKey, hashedPassword);
        if (!email)
            return res.status(401).send({ message: "Secret Key not found or expired." });

        await deleteEmailSecretKey(secretKey);


        res.send({ message: "Password changed successfully." });
    } catch (error) {
        next(error)
    }
}


const addEmailAuthMethod = async (req, res, next) => {
    try {
        if (!req.email || !req.password)
            return res.status(400).send({ message: "Please provide email and password." });

        const hashedPassword = hashPassword(req.password);
        const userId = req.user.userId;
        const verifySecret = "APV-" + uuid();
        await addAuthMethodEmail(req.email, hashedPassword, verifySecret, userId);

        const verifyURL = CLIENT_URL + `/verify-email?secretKey=${verifySecret}`;
        await sendEmail(req.email, "🎉 Welcome to API POOL!", verifyEmailTemplate(verifyURL));

        res.send({ message: "Email Auth added. Please check your email for verification." });
    } catch (error) {
        next(error);
    }
}

const getAuthMethods = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const authMethods = await getAllAuthMethods(userId);
        res.send({ authMethods });
    } catch (error) {
        next(error);
    }
}

const changePassword = async (req, res, next) => {
    try {
        const newPassword = req.body?.newPassword;
        const currentPassword = req.body?.currentPassword;

        if (!newPassword || !currentPassword)
            return res.status(400).send({ message: "Please provide new and current password." });

        if (currentPassword == newPassword)
            return res.status(400).send({ message: "New password can not be the same as the current password." });

        const passwordErrorMessage = isValidPassword(password);
        if (passwordErrorMessage)
            return res.status(400).send({ message: passwordErrorMessage });

        const { email, hashed_password } = await getEmailAndPasswordByID(req.user.userId);
        const isPasswordCorrect = comparePasswords(currentPassword, hashed_password);
        if (!isPasswordCorrect) {
            return res.status(401).send({ message: "Invalid password!" });
        }

        const newHashedPassword = hashPassword(newPassword);

        await updatePassword(email, newHashedPassword);

        res.clearCookie('refresh_token', { domain: COOKIE_DOMAIN });
        await updateRefreshToken(req.user.userId, null);

        res.send({ message: "Password changed." });
    } catch (error) {
        next(error);
    }
}


const logout = async (req, res, next) => {
    try {
        res.clearCookie('refresh_token', { domain: COOKIE_DOMAIN, httpOnly: true, });
        await updateRefreshToken(req.user.userId, null);
        res.send({ message: "Logged out." });
    } catch (error) {
        next(error);
    }
}

export {
    signUp,
    login,
    refresh,
    googleAuth,
    githubAuth,
    changePassword,
    logout,
    addGoogleAuthMethod,
    addGithubAuthMethod,
    addEmailAuthMethod,
    getAuthMethods,
    verifyEmail,
    sendVerifyEmail,
    sendResetPasswordMail,
    resetPassword
}