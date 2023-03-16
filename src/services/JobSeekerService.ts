import axios from "axios"
import { Cv } from "../contracts/Cv"
import { ListResponseModel } from "../contracts/ListResponseModel"
import SingleResponseModel from "../contracts/SingleResponseModel"

let apiUrl = "https://webapi20230125044326.azurewebsites.net/api/"

export const getAllCvs = async () => {
    let newApiUrl = apiUrl + "cvs/getall"
    return await axios.get<ListResponseModel<Cv>>(newApiUrl);
}

export const getByJobSeekerId = async (id:string) => {
    let newApiUrl = apiUrl + "cvs/getbyjobseekerid/" + id
    return await axios.get<SingleResponseModel<Cv>>(newApiUrl)
}