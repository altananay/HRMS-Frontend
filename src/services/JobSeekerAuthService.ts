import axios from "axios"
import { LoginModel } from "../contracts/loginModel"
import SingleResponseModel from "../contracts/SingleResponseModel"
import { TokenModel } from "../contracts/tokenModel"
import { JobSeekerSignUpModel } from "../requests/JobSeekerSignUp"

export const login = async (loginModel: LoginModel) => {
    let newApiUrl = process.env.REACT_APP_BASE_ENDPOINT + "auth/login"
    return await axios.post<SingleResponseModel<TokenModel>>(newApiUrl, loginModel)
}

export const signup = async (signupModel: JobSeekerSignUpModel) => {
    let newApiUrl = "https://localhost:7129/api/" + "auth/register"
    return await axios.post<SingleResponseModel<JobSeekerSignUpModel>>(newApiUrl, signupModel);
}