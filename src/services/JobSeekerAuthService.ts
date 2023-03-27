import axios from "axios"
import { LoginModel } from "../contracts/loginModel"
import SingleResponseModel from "../contracts/SingleResponseModel"
import { TokenModel } from "../contracts/tokenModel"

export const login = async (loginModel: LoginModel) => {
    let newApiUrl = process.env.REACT_APP_BASE_ENDPOINT + "auth/login"
    return axios.post<SingleResponseModel<TokenModel>>(newApiUrl, loginModel)
}