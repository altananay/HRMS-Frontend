export const AddLocalStorage = async (key: string, value: string) =>
{
    await localStorage.setItem(key,value);
}

export const DeleteFromLocalStorage = (key: string) => {
    localStorage.removeItem(key)
}

export const GetFromLocalStorage = (key: string) => {
    return localStorage.getItem(key)?.toString();
}