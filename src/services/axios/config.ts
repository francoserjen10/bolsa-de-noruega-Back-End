import axios, { AxiosInstance } from "axios";

const baseURL = process.env.API_BASE_URL;

const axiosInstance: AxiosInstance = axios.create({
    baseURL,
    headers: {
        "Content-Type": 'multipart/form-data',
    },
});

export default axiosInstance;