import axios from "axios"
import { JobAdvertisement } from "../contracts/JobAdvertisement"
import { ListResponseModel } from "../contracts/ListResponseModel"
import SingleResponseModel from "../contracts/SingleResponseModel"
import { UpdateJobAdvertisementDto } from "../requests/UpdateJobAdvertisementDto"
import { CreateJobAdvertisement } from "../requests/CreateJobAdvertisement"

export const addJobAdvertisement = async (jobAdvertisement:CreateJobAdvertisement) => {
    let newApiUrl = process.env.REACT_APP_BASE_ENDPOINT + "jobadvertisements/add"
    return await axios.post<SingleResponseModel<JobAdvertisement>>(newApiUrl, jobAdvertisement)
}

export const updateJobAdvertisement = async (jobAdvertisement: UpdateJobAdvertisementDto) => {
    let newApiUrl = process.env.REACT_APP_BASE_ENDPOINT + "jobadvertisements/update"
    return await axios.put<SingleResponseModel<JobAdvertisement>>(newApiUrl, jobAdvertisement)
}

export const addJobAdvertisementWithLocalhost = async (jobAdvertisement: CreateJobAdvertisement) => {
    let apiUrl  = "https://localhost:7129/api/jobadvertisements/add"
    return await axios.post<SingleResponseModel<JobAdvertisement>>(apiUrl, jobAdvertisement)
}

export const getAllJobAdvertisement = async () => {
    let newApiUrl = process.env.REACT_APP_BASE_ENDPOINT + "jobadvertisements/getall"
    return await axios.get<ListResponseModel<JobAdvertisement>>(newApiUrl)
}

export const getAllJobAdvertisementsByStatus = async (status: string) => {
    let newApiUrl = process.env.REACT_APP_BASE_ENDPOINT + "jobadvertisements/getallbystatus?status=" + status
    return await axios.get<ListResponseModel<JobAdvertisement>>(newApiUrl);
}

export const updateJobAdvertisementWithLocalHost = async(jobAdvertisement: UpdateJobAdvertisementDto) => {
    let newApiUrl = "https://localhost:7129/api/jobadvertisements/update"
    return await axios.put<SingleResponseModel<JobAdvertisement>>(newApiUrl, jobAdvertisement);
}

export const getJobAdvertisementByEmployerIdWithStatus = async(id: string, status: boolean) => {
    let newApiUrl = process.env.REACT_APP_BASE_ENDPOINT + "jobadvertisements/getbyemployerid/" + id + "/" + status;
    return await axios.get<ListResponseModel<JobAdvertisement>>(newApiUrl);
}