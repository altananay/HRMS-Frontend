import { Department } from "./Department"

export interface Employer
{
    id: string
    companyName: string
    companyPhone: string
    webSite: string
    email: string
    sector: string[]
    departments: Department[]
    numberOfEmployees: string
    description: string
}