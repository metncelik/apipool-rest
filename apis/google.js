import { CLIENT_URL, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } from "../config.js";
import axios from "axios";
import qs from 'querystring';

const getGoogleUserInfo = async (code, action) => {
    const atUrl = 'https://oauth2.googleapis.com/token';
    const values = {
        code: code,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: `${CLIENT_URL}/oauth/google/${action}`,
        grant_type: 'authorization_code'
    };
    const options = {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    }
    const accessToken = (await axios.post(atUrl, qs.stringify(values), options)).data.access_token;

    const uiUrl = `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${accessToken}`;
    const userData = (await axios.get(uiUrl)).data;
    return userData;
}

export {
    getGoogleUserInfo
}