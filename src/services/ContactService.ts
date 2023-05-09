import axios from "axios";
import { Contact } from "../requests/ContactModel";
import SingleResponseModel from "../contracts/SingleResponseModel";

export const addContact = async (contact: Contact) => {
    let apiUrl = process.env.REACT_APP_BASE_ENDPOINT + "contacts"
    return await axios.post<SingleResponseModel<Contact>>(apiUrl, contact);
}