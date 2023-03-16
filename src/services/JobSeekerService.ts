import axios from "axios"
import { Cv } from "../contracts/Cv"
import { ListResponseModel } from "../contracts/ListResponseModel"
import SingleResponseModel from "../contracts/SingleResponseModel"


export const getAllCvs = async () => {
    let newApiUrl = process.env.REACT_APP_BASE_ENDPOINT + "cvs/getall"
    return await axios.get<ListResponseModel<Cv>>(newApiUrl);
}

export const getByJobSeekerId = async (id:string) => {
    let newApiUrl = process.env.REACT_APP_BASE_ENDPOINT + "cvs/getbyjobseekerid/" + id
    return await axios.get<SingleResponseModel<Cv>>(newApiUrl)
}