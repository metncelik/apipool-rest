import { GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET } from "../config.js";
import axios from "axios";

const getGithubUserInfo = async (code) => {
    const url = `https://github.com/login/oauth/access_token?code=${code}&client_id=${GITHUB_CLIENT_ID}&client_secret=${GITHUB_CLIENT_SECRET}`;
    const accessResponse = await axios.post(url);
    const encodedParams = accessResponse.data;
    const params = new URLSearchParams(encodedParams);
    const accessToken = params.get('access_token');

    const config = {
        headers: {
            Authorization: `Bearer ${accessToken}`
        }
    }

    const userResponse = await axios.get("https://api.github.com/user", config);
    const userData = userResponse.data;
    return { userData, config }
}

const getGithubEmails = async (config) => {
    const emailsResponse = await axios.get("https://api.github.com/user/emails", config);
    const emails = emailsResponse.data;
    return emails;
}

export {
    getGithubUserInfo,
    getGithubEmails
}