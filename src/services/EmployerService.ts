import axios from "axios"
import SingleResponseModel from "../contracts/SingleResponseModel"
import { Employer } from "../contracts/Employer"

export const getById = async (id: string) => {
    let apiUrl = process.env.REACT_APP_BASE_ENDPOINT + "employers/getbyemployerid/" + id
    return await axios.get<SingleResponseModel<Employer>>(apiUrl);
}