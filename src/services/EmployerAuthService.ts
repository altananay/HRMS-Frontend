import axios from "axios"
import { LoginModel } from "../contracts/loginModel"
import SingleResponseModel from "../contracts/SingleResponseModel"
import { TokenModel } from "../contracts/tokenModel"
import { EmployerSignUp } from "../requests/EmployerSignUp"

export const companyLogin = async (login : LoginModel) => {
    let apiUrl = process.env.REACT_APP_BASE_ENDPOINT + "employerauth/login"
    return await axios.post<SingleResponseModel<TokenModel>>(apiUrl, login);
}

export const signUp = async (signUp : EmployerSignUp) => {
    let apiUrl = process.env.REACT_APP_BASE_ENDPOINT + "employerauth/register"
    return await axios.post<SingleResponseModel<EmployerSignUp>>(apiUrl, signUp);
}