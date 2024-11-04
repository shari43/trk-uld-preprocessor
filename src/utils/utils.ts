export const isValidValue = (obj: any) => {
    return obj != null && obj != undefined && !Number.isNaN(obj);
}