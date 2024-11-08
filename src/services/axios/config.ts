import axios, { AxiosInstance } from "axios";

export const baseURL = process.env.API_BASE_URL1;

const axiosInstance: AxiosInstance = axios.create({
    baseURL,
    headers: {
        "Content-Type": 'multipart/form-data',
    },
});

export default axiosInstance;