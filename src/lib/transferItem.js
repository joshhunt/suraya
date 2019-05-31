import * as destiny from "src/lib/destiny";
import { isFunction } from "lodash";

const profileStateMap = new WeakMap();

export const VAULT = "$$vault";

const SUBBUCKET_ITEMS = "items";
const SUBBUCKET_EQUIPPED = "equipped";
const VAULT_BUCKET_HASH = 138197802;

const EXOTIC = 2759499571;

const IS_PROFILE_STATE = Symbol("is profileState");

function buildProfileStateMap(profile) {
  const profileState = {
    [IS_PROFILE_STATE]: true,
    [VAULT]: {
      [VAULT_BUCKET_HASH]: { [SUBBUCKET_ITEMS]: [], [SUBBUCKET_EQUIPPED]: [] }
    }
  };

  function iterateItems(items, host, key) {
    items.forEach(item => {
      const bucketHash = item.bucketHash;

      if (!host[bucketHash]) {
        host[bucketHash] = { [SUBBUCKET_ITEMS]: [], [SUBBUCKET_EQUIPPED]: [] };
      }

      host[bucketHash][key].push(item);
    });
  }

  function iterareCharacterItems(data, key) {
    Object.entries(data).forEach(([characterId, { items }]) => {
      if (!profileState[characterId]) {
        profileState[characterId] = {};
      }

      const characterState = profileState[characterId];
      iterateItems(items, characterState, key);
    });
  }

  iterareCharacterItems(profile.characterInventories.data, SUBBUCKET_ITEMS);
  iterareCharacterItems(profile.characterEquipment.data, SUBBUCKET_EQUIPPED);

  iterateItems(
    profile.profileInventory.data.items,
    profileState[VAULT],
    SUBBUCKET_ITEMS
  );

  return profileState;
}

function findMap(arr, fn) {
  for (let index = 0; index < arr.length; index++) {
    const element = arr[index];
    const result = fn(element);
    if (result) {
      return result;
    }
  }
}

function findItemLocation(profileState, arg2) {
  const itemTest = isFunction(arg2)
    ? arg2
    : item => item.itemInstanceId === arg2;

  return findMap(Object.entries(profileState), ([character, buckets]) => {
    return findMap(Object.entries(buckets), ([bucketHash, bucket]) => {
      return findMap(Object.entries(bucket), ([subBucket, items]) => {
        const found = items.find(i =>
          itemTest(i, character, bucketHash, subBucket)
        );
        return found
          ? [character, bucketHash, subBucket, found.itemInstanceId]
          : null;
      });
    });
  });
}

function getProfileState(_profileish) {
  if (_profileish[IS_PROFILE_STATE]) {
    return _profileish;
  }

  if (!profileStateMap.has(_profileish)) {
    console.log("no profile state, building one");
    profileStateMap.set(_profileish, buildProfileStateMap(_profileish));
  }

  return profileStateMap.get(_profileish);
}

async function transferItem(
  item,
  destination,
  _profileish, // either profile, or profileState
  definitions,
  { membershipType },
  accessToken,
  keepItems = [] // array of itemInstanceIds of items that shouldnt be moved out of the way
) {
  console.group(
    `transfering [itemHash: ${item.itemHash} id: ${
      item.itemInstanceId
    }] to ${destination}`
  );

  const profileState = getProfileState(_profileish);

  const itemDef = definitions.DestinyInventoryItemDefinition[item.itemHash];

  if (!itemDef) {
    throw new Error(`No item def for item hash ${item.itemHash}`);
  }

  console.log("profileState:", profileState);

  const location = findItemLocation(profileState, item.itemInstanceId) || [];
  const [profileLocation, bucket, subBucket] = location;

  console.log("current item location:", location);

  function move(transferToVault, characterId) {
    return {
      itemReferenceHash: item.itemHash,
      transferToVault,
      itemId: item.itemInstanceId,
      membershipType,
      characterId
    };
  }

  if (subBucket === SUBBUCKET_EQUIPPED) {
    const itemComparitor = (rItem, r0, r1, r2) => {
      const rItemDef =
        definitions.DestinyInventoryItemDefinition[rItem.itemHash];

      return (
        r2 !== SUBBUCKET_EQUIPPED &&
        !keepItems.includes(rItem.itemInstanceId) &&
        rItemDef.classType === itemDef.classType &&
        rItemDef.itemSubType === itemDef.itemSubType &&
        rItemDef.inventory &&
        rItemDef.inventory.tierTypeHash !== EXOTIC
      );
    };

    const foundReplacementItem = profileState[profileLocation][bucket][
      SUBBUCKET_ITEMS
    ].find(itemComparitor);

    let rItemInstanceId;
    let replacementItemLocation;

    if (foundReplacementItem) {
      replacementItemLocation = [profileLocation, bucket, SUBBUCKET_ITEMS];
      console.log("found replacement item on current character");
      rItemInstanceId = foundReplacementItem.itemInstanceId;
    } else {
      // Needs transferring first.
      replacementItemLocation = findItemLocation(profileState, itemComparitor);
      const [l0, l1, l2] = replacementItemLocation;
      const rItem = profileState[l0][l1][l2].find(itemComparitor);

      rItemInstanceId = rItem.itemInstanceId;

      console.log(
        "needed to look elsewhere for replacement item",
        replacementItemLocation
      );

      await transferItem(
        rItem,
        profileLocation,
        profileState,
        definitions,
        { membershipType },
        accessToken,
        keepItems
      );
    }

    console.log("now we need to equip", rItemInstanceId);

    await destiny.equipItem(
      {
        itemId: rItemInstanceId,
        characterId: profileLocation,
        membershipType
      },
      accessToken
    );

    commitTransfer(profileState, rItemInstanceId, replacementItemLocation, [
      profileLocation,
      bucket,
      SUBBUCKET_EQUIPPED
    ]);

    await transferItem(
      item,
      destination,
      profileState,
      definitions,
      { membershipType },
      accessToken,
      keepItems
    );

    console.groupEnd();
    return;
  }

  if (destination === profileLocation) {
    console.log("Item is already in destination. No need to move");

    if (subBucket === SUBBUCKET_EQUIPPED) {
      console.log("except item is equipped. Probably want to unequip it.");
    }
    console.groupEnd();

    return;
  }

  let transferRequest;
  let newLocation = [];

  if (profileLocation !== VAULT) {
    console.log("Item is on another character, need to move it to the vault");

    transferRequest = move(true, profileLocation);
    newLocation = [VAULT, VAULT_BUCKET_HASH, SUBBUCKET_ITEMS];
  }

  if (profileLocation === VAULT) {
    console.log("Item is in the vault, just need to move it to the character");
    transferRequest = move(false, destination);

    newLocation = [
      destination,
      itemDef.inventory.bucketTypeHash,
      SUBBUCKET_ITEMS
    ];
  }

  if (transferRequest) {
    await makeRoom(profileState, newLocation, definitions, accessToken, [
      ...keepItems,
      item.itemInstanceId
    ]);

    console.log("Initiating transfer API", transferRequest);
    await destiny.transferItem(transferRequest, accessToken);

    // Now that the item has been transferred, we need to commit that into profileState
    console.log("Transfer was successful, now comitting");
    commitTransfer(profileState, item.itemInstanceId, location, newLocation);

    if (newLocation[0] !== destination) {
      console.log("item is not yet at it's destination, so moving again");
      await transferItem(
        item,
        destination,
        profileState,
        definitions,
        accessToken
      );
    } else {
      console.log("item is there. hurray!");
    }
  }

  console.groupEnd();
  return true;
}

export default transferItem;

function commitTransfer(
  profileState,
  itemInstanceId,
  oldLocation,
  newLocation
) {
  const [profileLocation, bucketHash, subBucket] = oldLocation;
  const [newProfileLocation, newBucketHash, newSubBucket] = newLocation;

  // First, get the item
  const item = profileState[profileLocation][bucketHash][subBucket].find(
    i => i.itemInstanceId === itemInstanceId
  );

  // Then remove it from the 'old' location
  profileState[profileLocation][bucketHash][subBucket] = profileState[
    profileLocation
  ][bucketHash][subBucket].filter(i => i !== item);

  // And move it to the new location ^_^
  profileState[newProfileLocation][newBucketHash][newSubBucket].push(item);
}

function makeRoom(
  profileState,
  [profileLocation, bucketHash], // the new location
  definitions, // defs
  accessToken,
  keepItems // array of items to leave where they are
) {
  const bucketDef = definitions.DestinyInventoryBucketDefinition[bucketHash];
  const itemLimit = bucketDef.itemCount - 1; // 1 for equipped;
  const destinationItems =
    profileState[profileLocation][bucketHash][SUBBUCKET_ITEMS];
  const destinationItemCount = destinationItems.length;

  console.log(`Destination bucket is at ${destinationItemCount}/${itemLimit}`);

  if (destinationItemCount >= itemLimit) {
    console.log(
      "%cdestination bucket is too full - will need to make space",
      "font-weight: bold"
    );

    if (profileLocation !== VAULT) {
      const itemToMoveOut = destinationItems.find(
        item => !keepItems.includes(item.itemInstanceId)
      );
      console.log("going to move item out of the way", itemToMoveOut);

      if (!itemToMoveOut) {
        const err = Error("Unable to find an item to move out of the way.");
        err.NO_ROOM = true;
        throw err;
      }

      return transferItem(
        itemToMoveOut,
        VAULT,
        profileState,
        definitions,
        accessToken
      );
    }
  }
}
