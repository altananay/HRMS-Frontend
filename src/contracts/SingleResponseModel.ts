import { ResponseModel } from "./ResponseModel";

export default interface SingleResponseModel<T> extends ResponseModel{
    data:T;
}