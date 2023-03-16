import axios from "axios"
import { CreateJobAdvertisement } from "../contracts/CreateJobAdvertisement"
import { JobAdvertisement } from "../contracts/JobAdvertisement"
import { ListResponseModel } from "../contracts/ListResponseModel"
import SingleResponseModel from "../contracts/SingleResponseModel"
import { UpdateJobAdvertisementDto } from "../contracts/UpdateJobAdvertisementDto"

let apiUrl = "https://webapi20230125044326.azurewebsites.net/api/"

export const addJobAdvertisement = async (jobAdvertisement:CreateJobAdvertisement) => {
    let newApiUrl = apiUrl + "jobadvertisements/add"
    return await axios.post<SingleResponseModel<JobAdvertisement>>(newApiUrl, jobAdvertisement)
}

export const updateJobAdvertisement = async (jobAdvertisement: UpdateJobAdvertisementDto) => {
    let newApiUrl = apiUrl + "jobadvertisements/update"
    return await axios.put<SingleResponseModel<JobAdvertisement>>(newApiUrl, jobAdvertisement)
}

export const addJobAdvertisementWithLocalhost = async (jobAdvertisement: CreateJobAdvertisement) => {
    let apiUrl  = "https://localhost:7129/api/jobadvertisements/add"
    return await axios.post<SingleResponseModel<JobAdvertisement>>(apiUrl, jobAdvertisement)
}

export const getAllJobAdvertisement = async () => {
    let newApiUrl = apiUrl + "jobadvertisements/getall"
    return await axios.get<ListResponseModel<JobAdvertisement>>(newApiUrl)
}

export const getAllJobAdvertisementsByStatus = async (status: string) => {
    let newApiUrl = apiUrl + "jobadvertisements/getallbystatus?status=" + status
    return await axios.get<ListResponseModel<JobAdvertisement>>(newApiUrl);
}

export const updateJobAdvertisementWithLocalHost = async(jobAdvertisement: UpdateJobAdvertisementDto) => {
    let apiUrl = "https://localhost:7129/api/jobadvertisements/update"
    return await axios.put<SingleResponseModel<JobAdvertisement>>(apiUrl, jobAdvertisement);
}