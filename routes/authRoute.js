import { Router } from 'express';
import validateUserDataFormat from '../middlewares/validateUserDataFormat.js';
import { validateRefreshToken } from '../middlewares/validateRefreshToken.js';
import authorization from '../middlewares/authorization.js';
import {
    addEmailAuthMethod,
    addGithubAuthMethod,
    addGoogleAuthMethod,
    changePassword,
    getAuthMethods,
    githubAuth,
    googleAuth,
    login,
    logout,
    refresh,
    resetPassword,
    sendResetPasswordMail,
    sendVerifyEmail,
    signUp,
    verifyEmail
} from '../controllers/authControllers.js';

const router = Router();

router.post('/sign-up', validateUserDataFormat, signUp);
router.post('/login', validateUserDataFormat, login);
router.post('/change-password', validateRefreshToken, changePassword);
router.get('/refresh', validateRefreshToken, refresh);
router.delete('/logout', authorization, logout);
router.post('/google/add', validateRefreshToken, addGoogleAuthMethod);
router.post('/github/add', validateRefreshToken, addGithubAuthMethod);
router.post('/google/:method', googleAuth);
router.post('/github/:method', githubAuth);
router.post('/email/add', validateRefreshToken, validateUserDataFormat, addEmailAuthMethod);
router.get('/email/verify', verifyEmail);
router.post('/email/send-verify', sendVerifyEmail);
router.post('/email/reset-password/send', sendResetPasswordMail);
router.post('/email/reset-password', resetPassword);
router.get('/auth-methods', authorization, getAuthMethods);

export default router;


