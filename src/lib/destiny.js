import { has } from "lodash";
import { queue } from "async";
import Dexie from "dexie";

const log = require("src/lib/log")("http");

export const db = new Dexie("requestCache");

const componentProfiles = 100; // eslint-disable-line
const componentVendorReceipts = 101; // eslint-disable-line
const componentProfileInventories = 102; // eslint-disable-line
const componentProfileCurrencies = 103; // eslint-disable-line
const componentProfileProgressions = 104; // eslint-disable-line
const componentCharacters = 200; // eslint-disable-line
const componentCharacterInventories = 201; // eslint-disable-line
const componentCharacterProgressions = 202; // eslint-disable-line
const componentCharacterRenderData = 203; // eslint-disable-line
const componentCharacterActivities = 204; // eslint-disable-line
const componentCharacterEquipment = 205; // eslint-disable-line
const componentItemInstances = 300; // eslint-disable-line
const componentItemObjectives = 301; // eslint-disable-line
const componentItemPerks = 302; // eslint-disable-line
const componentItemRenderData = 303; // eslint-disable-line
const componentItemStats = 304; // eslint-disable-line
const componentItemSockets = 305; // eslint-disable-line
const componentItemTalentGrids = 306; // eslint-disable-line
const componentItemCommonData = 307; // eslint-disable-line
const componentItemPlugStates = 308; // eslint-disable-line
const componentVendors = 400; // eslint-disable-line
const componentVendorCategories = 401; // eslint-disable-line
const componentVendorSales = 402; // eslint-disable-line
const componentCollectibles = 800;
const componentRecords = 900;

const PROFILE_COMPONENTS = [
  componentProfiles,
  componentVendorReceipts,
  componentProfileInventories,
  componentProfileCurrencies,
  componentProfileProgressions,
  componentCharacters,
  componentCharacterInventories,
  componentCharacterProgressions,
  componentCharacterRenderData,
  componentCharacterActivities,
  componentCharacterEquipment,
  componentItemInstances,
  componentItemObjectives,
  componentItemPerks,
  componentItemRenderData,
  componentItemStats,
  componentItemSockets,
  componentItemTalentGrids,
  componentItemCommonData,
  componentItemPlugStates,
  componentVendors,
  componentVendorCategories,
  componentVendorSales,
  componentCollectibles,
  componentRecords
];

const CACHE_PROFILES = false;

const GET_CONCURRENCY = 50;
db.version(1).stores({
  requests: "&url, response, date"
});

function getWorker({ url, opts }, cb) {
  fetch(url, opts)
    .then(res => res.json())
    .then(result => {
      cb(null, result);
    })
    .catch(err => cb(err));
}

const getQueue = queue(getWorker, GET_CONCURRENCY);

export function get(url, opts) {
  return new Promise((resolve, reject) => {
    getQueue.push({ url, opts }, (err, result) => {
      err ? reject(err) : resolve(result);
    });
  });
}

export function getDestiny(_pathname, opts = {}, postBody) {
  let url = _pathname.includes("http")
    ? _pathname
    : `https://www.bungie.net/Platform${_pathname}`;

  url = url.replace("/Platform/Platform/", "/Platform/");

  const { pathname } = new URL(url);

  opts.headers = opts.headers || {};
  opts.headers["x-api-key"] = process.env.REACT_APP_API_KEY;

  if (opts.accessToken) {
    opts.headers["Authorization"] = `Bearer ${opts.accessToken}`;
    opts.credentials = "include";
  }

  if (postBody) {
    opts.method = "POST";
    if (typeof postBody === "string") {
      opts.headers["Content-Type"] = "application/x-www-form-urlencoded";
      opts.body = postBody;
    } else {
      opts.headers["Content-Type"] = "application/json";
      opts.body = JSON.stringify(postBody);
    }
  }

  log(`REQUEST: ${pathname}`, opts);

  return get(url, opts).then(resp => {
    log(`RESPONSE: ${pathname}`, resp);

    if (resp.ErrorStatus === "DestinyAccountNotFound") {
      return null;
    }

    if (has(resp, "ErrorCode") && resp.ErrorCode !== 1) {
      const cleanedUrl = url.replace(/\/\d+\//g, "/_/");
      const err = new Error(
        "Bungie API Error " +
          resp.ErrorStatus +
          " - " +
          resp.Message +
          "\nURL: " +
          cleanedUrl
      );

      err.data = resp;
      throw err;
    }

    const result = resp.Response || resp;

    return result;
  });
}

export function getCacheableDestiny(pathname, opts) {
  return db.requests.get(pathname).then(result => {
    if (result) {
      return result.response;
    }

    return getDestiny(pathname, opts).then(data => {
      db.requests.put({ url: pathname, response: data, date: new Date() });
      return data;
    });
  });
}

export function getCurrentMembership(accessToken) {
  return getDestiny("/User/GetMembershipsForCurrentUser/", { accessToken });
}

const GROUP_TYPE_CLAN = 1;
const GROUP_FILTER_ALL = 0;
export function getClansForUser({ membershipType, membershipId }, accessToken) {
  return getDestiny(
    `/GroupV2/User/${membershipType}/${membershipId}/${GROUP_FILTER_ALL}/${GROUP_TYPE_CLAN}/`,
    { accessToken }
  );
}

export function getClan(groupId, accessToken) {
  return getDestiny(`/GroupV2/${groupId}/`, { accessToken });
}

export function getClanMembers(groupId, accessToken) {
  return getDestiny(`/GroupV2/${groupId}/Members/`, { accessToken });
}

// https://www.bungie.net/Platform/Destiny2/2/Profile/4611686018469271298/
export function getProfile({ membershipType, membershipId }, accessToken) {
  const getFn = CACHE_PROFILES ? getCacheableDestiny : getDestiny;

  return getFn(
    `/Destiny2/${membershipType}/Profile/${membershipId}/?components=${PROFILE_COMPONENTS.join(
      ","
    )}`,
    {
      accessToken
    }
  );
}

const ACTIVITY_LIMIT = 1;
export function getRecentActivities(
  { membershipType, membershipId, characterId },
  accessToken
) {
  return getDestiny(
    `/Destiny2/${membershipType}/Account/${membershipId}/Character/${characterId}/Stats/Activities/?mode=0&count=${ACTIVITY_LIMIT}`,
    {
      accessToken
    }
  );
}

export function getCharacterPGCRHistory({
  membershipType,
  membershipId,
  characterId
}) {
  return getDestiny(
    `/Destiny2/${membershipType}/Account/${membershipId}/Character/${characterId}/Stats/Activities/?mode=None&count=250&page=0`
  );
}

export function getCacheablePGCRDetails(pgcrId) {
  return getCacheableDestiny(
    `https://stats.bungie.net/Platform/Destiny2/Stats/PostGameCarnageReport/${pgcrId}/`
  );
}

export function getCacheableSearch(searchTerm) {
  return getDestiny(
    `/Destiny2/SearchDestinyPlayer/-1/${encodeURIComponent(searchTerm)}/`
  );
}

export function transferItem(transferRequest, accessToken) {
  console.log("transfer item accessToken:", accessToken);
  return getDestiny(
    "/Destiny2/Actions/Items/TransferItem/",
    { accessToken },
    transferRequest
  );
}

export function equipItem(equipRequest, accessToken) {
  return getDestiny(
    "/Destiny2/Actions/Items/EquipItem/",
    { accessToken },
    equipRequest
  );
}

window.getCacheablePGCRDetails = getCacheablePGCRDetails;
