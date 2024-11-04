import { UldMeshPacket } from '../packets/mesh';
import { UldProxPacket } from '../packets/prox';
import { HttpError } from '../classes/error';


export const sanitizeProxPacket = (body: any): UldProxPacket => {

    const requiredFields: Array<keyof UldProxPacket> = [
        'id', 'ts', 'bat', 'C', 'st',
        'e0', 'pt'
    ];

    for (const field of requiredFields) {
        if (!body.hasOwnProperty(field)) {
            throw new HttpError(`Bad Request`, 400);
        }
    }

    const validatedPacket: UldProxPacket = {
        id: body.id,
        pt: body.pt,
        ts: Number(body.ts),
        bat: Number(body.bat),
        C: Number(body.C),
        st: body.st,
        e0: Number(body.e0)
    };

    const expectedFields: Array<any> = [
        { field: 'hdp', type: 'number' },
        { field: 'rssi0', type: 'number' },
        { field: 'A0', type: 'string' },
        { field: 'A1', type: 'string' },
        { field: 'A2', type: 'string' },
        { field: 'mmc', type: 'number' },
        { field: 'mnc', type: 'number' },
        { field: 'tac', type: 'number' },
        { field: 'cti', type: 'number' },
        { field: 'celltowers', type: 'string' },
        { field: 'glat', type: 'number' },
        { field: 'glon', type: 'number' },
        { field: 'T0', type: 'number' },
        { field: 'H0', type: 'number' },
        { field: 'P0', type: 'number' },
        { field: 'L0', type: 'number' },
        { field: 'TP', type: 'number' },
        { field: 'G1', type: 'string' },
        { field: 'G2', type: 'string' },
        { field: 'G3', type: 'string' },
        { field: 'G4', type: 'string' },
        { field: 'G5', type: 'string' },
        { field: 'G6', type: 'string' },
        { field: 'morepids', type: 'string' },
        { field: 'VersionInfo', type: 'string' },
    ];

    for (const { field, type } of expectedFields) {

        if (field in body) {
            if (type === 'number') {
                validatedPacket[field] = Number(body[field]);
            } else {
                validatedPacket[field] = body[field];
            }
        }
    }
    
    return validatedPacket;
};


export const sanitizeMeshPacket = (body: any): UldMeshPacket => {

    const requiredFields: Array<keyof UldMeshPacket> = [
        'id', 'ts', 'C', 'st',
        'G1', 'rid', 'type',
        'rssi0'
    ];

    for (const field of requiredFields) {
        if (!body.hasOwnProperty(field)) {
            throw new HttpError(`Bad Request`, 400);
        }
    }

    const validatedPacket: UldMeshPacket = {
        id: body.id,
        ts: Number(body.ts),
        C: Number(body.C),
        st: body.st,
        G1: body.G1,
        rid: body.rid,
        type: body.type,
        rssi0: Number(body.rssi0),
        clat: Number(body.clat),
        clon: Number(body.clon)
    };

    return validatedPacket;

};

module.exports = {
    sanitizeMeshPacket,
    sanitizeProxPacket
};