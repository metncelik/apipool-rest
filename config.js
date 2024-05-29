export const COOKIE_DOMAIN = process.env.COOKIE_DOMAIN;
export const REST_API_URL = process.env.REST_API_URL;
export const CLIENT_URL = process.env.CLIENT_URL;
export const PORT = process.env.PORT || 5003;
export const ACCESS_SECRET = process.env.ACCESS_SECRET;
export const REFRESH_SECRET = process.env.REFRESH_SECRET;
export const EMAIL = process.env.EMAIL;
export const EMAIL_PASSWORD = process.env.EMAIL_PASSWORD;
export const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
export const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
export const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
export const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
export const PROJECT_ID = process.env.PROJECT_ID;
export const NODE_ENV = process.env.NODE_ENV;

export const cookieConfig = {
    httpOnly: true,
    domain: COOKIE_DOMAIN,
    expires: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
}

export const pgConfig = {
    user: process.env.PG_USER,
    password: process.env.PG_PASSWORD,
    host: process.env.PG_HOST,
    port: process.env.PG_PORT,
    database: process.env.PG_DATABASE,
    max: +process.env.PG_MAX_CONN,
    idleTimeoutMillis: +process.env.PG_IDLE,
    connectionTimeoutMillis: +process.env.PG_TIMEOUT
};

export const storageConfig = {
    projectId: process.env.GC_PROJECT_ID,
    credentials: {
        "type": "service_account",
        "project_id": process.env.GC_PROJECT_ID,
        "private_key_id": process.env.GS_PRIVATE_KEY_ID,
        "private_key": process.env.GS_PRIVATE_KEY.replace(/\\n/g, '\n'),
        "client_email": process.env.GS_CLIENT_EMAIL,
        "client_id": process.env.GS_CLIENT_ID,
        "auth_uri": "https://accounts.google.com/o/oauth2/auth",
        "token_uri": "https://oauth2.googleapis.com/token",
        "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
        "client_x509_cert_url": process.env.GS_CLIENT_CERT_URL,
        "universe_domain": "googleapis.com"
    }
};

export const mailTransporterConfig = {
    service: process.env.EMAIL_PROVIDER,
    auth: {
        user: EMAIL,
        pass: EMAIL_PASSWORD
    }
};

export const verifyEmailTemplate = (url) => {
    return {
        html: `
    <h1>Email Verification</h1>
    <p>Please click the link below to verify your email address.</p>
    <a href=${url}>Verify email</a>
    <p>If you did not request this, please ignore this email.</p>`,
        text: `
    Email Verification\n
    Please click the link below to verify your email address.\n
    ${url}\n
    If you did not request this, please ignore this email.`
    }
};

export const resetYourPasswordTemplate = (url) => {
    return {
        html: `
    <h1>Reset Your Password</h1>
    <p>Please click the link below to reset your password.</p>
    <a href=${url}>Reset password</a>
    <p>If you did not request this, please ignore this email.</p>`,
        text: `
    Reset Your Password\n
    Please click the link below to reset your password.\n
    ${url}\n
    If you did not request this, please ignore this email.`
    }
}