import {
  getLatestPatches,
  removeOlderPatches
} from './redis/redisUtil';

function constructDiffResponse(patches: string[]) {
  const lastIndex : number = patches.length - 1;
  const maxTs : number = parseInt(patches[lastIndex]);
  let diff = {};

  for (let i = lastIndex - 1; i >= 0; i -= 2) {
      const patchObj = JSON.parse(patches[i]);
      // We are going present to past, so apply the patch first and then override with what is in the diff.
      diff = { ...patchObj, ...diff };
  }

  return {
      ackTs: maxTs,
      settings: diff
  };
}

export const getSettingsResponse = async (deviceId: string, ackTs: number | undefined) => {
  const zSetKey = `device_zsettings:${deviceId}`;
  const latestPatches : string[] = await getLatestPatches(zSetKey, ackTs);
  let response;

  if (latestPatches && latestPatches.length > 0) {
    response = constructDiffResponse(latestPatches);
  }

  if (ackTs != undefined) {
    await removeOlderPatches(zSetKey, ackTs);
  }

  return response;
}
