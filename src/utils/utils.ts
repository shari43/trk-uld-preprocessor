export const isValidValue = (obj: any) => {
    return obj != null && obj != undefined && !Number.isNaN(obj);
};

export const randomlyGenerateClatClon = () => {
    return {
        ts: Math.floor(Date.now() / 1000),
        clat: parseFloat((Math.random() * 180 - 90).toFixed(6)),
        clon: parseFloat((Math.random() * 360 - 180).toFixed(6))
    };
};