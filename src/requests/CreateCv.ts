import { Language } from "../contracts/Language";
import { SocialMedia } from "../contracts/SocialMedia";
import { Education } from "./Education";
import { JobExperience } from "./JobExperience";
import { Project } from "./Project";

export interface Cv {
    jobSeekerId: string;
    educations: Education[],
    jobExperiences : JobExperience[],
    skills: string[],
    languages: Language[],
    projects: Project[],
    imageUrl : string,
    socialMedias: SocialMedia,
    information: string,
    hobbies: string,
}