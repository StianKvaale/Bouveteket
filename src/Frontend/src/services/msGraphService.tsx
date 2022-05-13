import axios from "axios";
import { getAccessTokenForGraphApi } from "store/authContext";
import { IMsGraphUser } from "store/types";

const restAPI = axios.create({
    baseURL: "https://graph.microsoft.com/v1.0",
    headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
    }
});

restAPI.interceptors.request.use(
    async config => {
        const accessToken = await getAccessTokenForGraphApi();
        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config;
    },
    error => {
        return Promise.reject(error);
    }
);

export const getUserInformation = async (): Promise<IMsGraphUser> => {
    return await restAPI.get('me?$select=department')
        .then(response => {
            return response.data;
        })
        .catch(error => null);
};

export const getProfilePicture = async (): Promise<string> => {
    return await restAPI.get('me/photo/$value', {
        responseType: "blob"
    })
        .then(response => {
            const url = URL.createObjectURL(response.data);
            return url;
        })
        .catch(error => "ugyldig");
};