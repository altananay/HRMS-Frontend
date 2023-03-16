import axios from "axios"
import { JobPosition } from "../contracts/JobPosition"
import { ListResponseModel } from "../contracts/ListResponseModel"

export const getAllJobPositions = async () =>
{
    let newApiUrl = process.env.REACT_APP_BASE_ENDPOINT + "jobposition/getall"
    return await axios.get<ListResponseModel<JobPosition>>(newApiUrl)
}