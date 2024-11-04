import { EventHubBufferedProducerClient, EventHubBufferedProducerClientOptions } from "@azure/event-hubs";
import { HttpError } from '../classes/error';
import { Success } from '../classes/success';

import { UldMeshPacket } from '../packets/mesh';
import { UldProxPacket } from '../packets/prox';

const trkEventHubConnectionString: any = process.env.EVENT_HUB_CONNECTION_STRING;
const trkEventHubName: any = process.env.EVENT_HUB_NAME;
if (!trkEventHubConnectionString) {
    console.error("Event Hub connection string is not provided.");
    throw new Error(`Invalid Event Hub Connection String.`);
}

const options: EventHubBufferedProducerClientOptions = {
    maxEventBufferLengthPerPartition: parseInt(process.env.MAX_EVENT_BUFFER_LENGTH_PER_PARTITION || "") || 1500,
    onSendEventsErrorHandler: (errorInfo) => {
        console.error("Failed to send events:", errorInfo.error);
        console.error("Events that failed to send:", errorInfo.events);
    },
    onSendEventsSuccessHandler: (successInfo) => {
        console.log("Successfully sent events:", successInfo.events);
    },
    maxWaitTimeInMs: parseInt(process.env.BUFFERED_PRODUCER_CLIENT_MAX_WAIT_TIME_MS || "") || 50,
    retryOptions: {
        maxRetries: 2,
        retryDelayInMs: 250
    },
};
const evBufferedProducerClient = new EventHubBufferedProducerClient(trkEventHubConnectionString, trkEventHubName, options);

export const bufferToEventHub = async (proxPackets: Array<UldMeshPacket | UldProxPacket>) => {

    const events = proxPackets.map(proxPacket => {
        return {
            id: proxPacket.id,
            data: proxPacket
        }
    });

    try {
        for (const event of events) {
            await evBufferedProducerClient.enqueueEvents([{ body: event.data }], { partitionKey: event.id });
            console.log(`Event for ${event.id} has been added to the buffer with partition key ${event.id}.`);
        }

    } catch (err) {
        console.error("Error buffering event to Event Hub:", err);
        throw new HttpError(`Error buffering packet.`, 500);
    }

    return new Success(`OK`, 200);

}