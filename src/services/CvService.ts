import axios from "axios";
import { Cv } from "../requests/CreateCv";
import SingleResponseModel from "../contracts/SingleResponseModel";

export const addCv  = async (cv: Cv) => {
    let newApiUrl = process.env.REACT_APP_BASE_ENDPOINT + "cvs/add"
    return await axios.post<SingleResponseModel<Cv>>(newApiUrl, cv);
}