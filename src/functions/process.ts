import { productTypes, eventTypes } from '../utils/constants';
import { UldMeshPacket } from '../packets/mesh';
import { UldProxPacket } from '../packets/prox';
import { sanitizeMeshPacket, sanitizeProxPacket } from '../functions/sanitize';
import { HttpError } from '../classes/error';
import { bufferToEventHub } from '../utils/eventHub';
import { Success } from '../classes/success';
import { isValidValue, randomlyGenerateClatClon } from '../utils/utils';
import logger from '../logger';
import { getSettingsResponse } from '../utils/deviceData/fetchDeviceData';

export const processEvent = async (bodyObject: any): Promise<Success | HttpError> => {

    try {

        let packet: UldProxPacket | UldMeshPacket;
        const eventType: eventTypes | null = classifyEvent(bodyObject);

        switch (eventType) {
            case eventTypes.DIRECT:
            case eventTypes.INDIRECT:
                packet = sanitizeProxPacket(bodyObject);
                if (process.env.MASK_TS) {
                    packet.ts = Math.floor(Date.now() / 1000); // NEEDS TO BE REMOVED AS SOON AS FW IS FIXED
                }
                break;
            case eventTypes.MESH:
                packet = sanitizeMeshPacket(bodyObject);
                break;
            default:
                logger.error({ eventType }, `Error: processEvent: Failed to classify packet: eventType: ${eventType}`);
                throw new HttpError(`Bad Request.`, 400);
        }

        packet.eventType = eventType;
        const events: Array<UldMeshPacket | UldProxPacket> = [packet];
        logger.info({ events }, `EVENTS`);
        await bufferToEventHub(events);
        const success = new Success('OK', 200);
        const cellLocationInfo = randomlyGenerateClatClon();
        success.cellLocation = {
            ts: cellLocationInfo.ts,
            lat: cellLocationInfo.clat,
            lon: cellLocationInfo.clon
        };

        if ([eventTypes.DIRECT, eventTypes.INDIRECT].includes(eventType)) {
            try {
                const response = await getSettingsResponse(packet.id, Number(packet.ackTs));
                if (response) {
                    const { ackTs, settings } = response;
                    success.ackTs = ackTs;
                    success.settings = settings;
                }
            } catch (err) {
                if (err instanceof Error) {
                    logger.error({ message: err.message }, `Error getting settings for device.`);
                } else {
                    logger.error({ message: err }, `Error getting settings for device.`);
                }
            }
            
        }

        return success;

    } catch (err) {
        logger.error(err, `Error: processEvent: Failed to process packet.`);
        if (err instanceof HttpError) {
            throw err;
        }
        throw new HttpError(`Internal Server Error`, 500);
    }
}

export const classifyEvent = (event: any): eventTypes | null => {

    const { G1, pt } = event;
    if (event.hasOwnProperty("G1") &&
        isValidValue(G1) &&
        (G1.startsWith('5258') || G1.startsWith('0202') || G1.startsWith('4954'))
    ) {
        return eventTypes.MESH;
    }

    if (event.hasOwnProperty("pt") && isValidValue(pt)) {
        switch (pt) {
            case productTypes.TUG:
            case productTypes.TRAILER:
                return eventTypes.INDIRECT;
            case productTypes.ULD:
                return eventTypes.DIRECT
        }
    }

    logger.error(event, `Error: classifyEvent: Cannot classify event.`);
    return null;
};