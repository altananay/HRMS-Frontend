export interface UpdateJobAdvertisementDto
{
    id: string,
    title: string,
    jobPositionId: string,
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
    status: Boolean
}