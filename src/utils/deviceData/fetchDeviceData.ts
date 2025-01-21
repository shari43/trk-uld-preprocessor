import { executeQuery, executeUpdate } from "./db/utils";
import sql from "mssql";


export const getDeviceSettings = async (deviceId: string) => {

    const params = [
        { name: `device_id`, type: sql.VarChar(16), value: deviceId }
    ];

    const { recordset } = await executeQuery(`SELECT device_id, settings FROM uld.DeviceSettings WHERE device_id = @device_id;`, params);
    if (!recordset || !recordset[0]) {
        return;
    }

    const { settings } = recordset[0];
    if (!settings) {
        return;
    }

    return settings;

};

export const syncDeviceSettings = (settings: string, ackTs: number | undefined) => {

    let { patches } = JSON.parse(settings);
    const update = (patches.length && ackTs) ? true : false;

    if (ackTs) {
        patches = patches.map((patchObj: any) => {
            const { ts } = patchObj;
            if (ts > ackTs) {
                return patchObj;
            }
        }).filter((patchObj: any) => patchObj);
    }
    
    const result = { newSettings: { patches }, update };
    return result;

};

export const constructDiffResponse = (settings: string) => {

    const { patches } = JSON.parse(settings);
    const sortedPatches = patches.sort((a: any, b: any) => b.ts - a.ts); // Largest ts first
    const maxTs = sortedPatches[0].ts;
    let diff = {};
    for (const patchObj of sortedPatches) {
        const { patch } = patchObj;
        diff = { ...patch, ...diff }; // We are going present to past, so apply the patch first and then override with what is in the diff.
    }

    return {
        ackTs: maxTs,
        settings: diff
    };

}

export const updateDeviceSettings = async (deviceId: string, newSettings: any) => {

    const params = [
        { name: `device_id`, type: sql.VarChar(16), value: deviceId },
        { name: `settings`, type: sql.VarChar(8000), value: newSettings }
    ];

    const rowsAffected = await executeUpdate(`UPDATE uld.DeviceSettings SET settings = @settings WHERE device_id = @device_id;`, params);
    if (!rowsAffected) {
        console.log(`Device ${deviceId} not found. No settings updated.`);
    }

    return;
};

export const getSettingsResponse = async (deviceId: string, ackTs: number | undefined) => {

    const settings = await getDeviceSettings(deviceId);
    const { newSettings, update } = syncDeviceSettings(settings, ackTs);
    const newSettingsStr = JSON.stringify(newSettings);
    let response;
    if (newSettings.patches.length) {
        response = constructDiffResponse(newSettingsStr);
    }
    if (update) {
        await updateDeviceSettings(deviceId, newSettingsStr);
    }
    return response;

}