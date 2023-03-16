import { Education } from "./Education"
import { JobExperience } from "./JobExperience"
import { Language } from "./Language"
import { ProgrammingLanguage } from "./ProgrammingLanguage"
import { Project } from "./Project"
import { SocialMedia } from "./SocialMedia"

export interface Cv
{
    id: string 
    jobSeekerId : string,
    firstName: string,
    lastName: string
    dateOfBirth?: string,
    email: string,
    hobbies: string,
    skills: string[],
    createdAt: Date,
    updatedAt: Date
    information : string,
    imageUrl: string,
    projects: Project[],
    programmingLanguages: ProgrammingLanguage[],
    languages: Language[],
    educations: Education[],
    jobExperiences: JobExperience[],
    socialMedias: SocialMedia
}