export interface CreateJobAdvertisement
{
    employerId: string,
    title: string,
    jobPositionName: string,
    description: string,
    experience: string,
    city: string,
    skills: string[],
    minSalary: Number,
    maxSalary: Number,
    currency: string,
    openPosition: Number,
    jobType: string,
    deadline: string,
}