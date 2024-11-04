export interface UldMeshPacket {
    id: string;
    ts: number;
    C: number;
    st: string;
    G1: string;
    rid: string;
    type: string;
    clat?: number;
    clon?: number;
    rssi0: number;
    [key: string]: string | number | undefined;
}