import axios from "axios"
import { JobPosition } from "../contracts/JobPosition"
import { ListResponseModel } from "../contracts/ListResponseModel"


let apiUrl = "https://webapi20230125044326.azurewebsites.net/api/"

export const getAllJobPositions = async () =>
{
    let newApiUrl = apiUrl + "jobposition/getall"
    return await axios.get<ListResponseModel<JobPosition>>(newApiUrl)
}