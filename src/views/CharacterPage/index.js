import React from "react";
import { flow, sortBy, filter, groupBy, uniq, map } from "lodash/fp";
import { connect } from "react-redux";

import * as perkActions from "src/store/perkTool";
import ItemPerkGrid from "src/components/ItemPerkGrid";
import Tooltip from "src/components/Tooltip";
import { HELMET, ARMS, CHEST, LEGS, CLASS_ITEM } from "src/lib/destinyEnums";
import getItemsFromProfile from "src/lib/getItemsFromProfile";

// import s from "./styles.styl";

const k = ({ membershipType, membershipId }) =>
  [membershipType, membershipId].join("/");

function CharacterPage({
  params,
  perksWithItems,
  addSelectedItemInstance,
  removeSelectedItemInstance,
  selectedItems,
  selectedItemHashes
}) {
  return (
    <div>
      <div>character {params.characterId}</div>

      <br />
      <br />
      <Tooltip itemInstanceId="6917529093332868792" />
      <br />
      <br />

      <ItemPerkGrid
        data={perksWithItems}
        onItemSelect={addSelectedItemInstance}
        onItemDeselect={removeSelectedItemInstance}
        selectedItems={selectedItems}
        selectedItemHashes={selectedItemHashes}
      />
    </div>
  );
}

const mapStateToProps = (state, ownProps) => {
  const pKey = k(ownProps.params);
  const { selectedPerks, selectedItems } = state.perkTool;
  const itemDefs = state.definitions.DestinyInventoryItemDefinition;
  const profile = state.profiles[pKey];

  const thisCharacter =
    profile && profile.characters.data[ownProps.params.characterId];

  const items = !profile
    ? []
    : getItemsFromProfile(profile)
        .filter(item => {
          const def = itemDefs && itemDefs[item.itemHash];
          return def && def.classType === thisCharacter.classType;
        })
        .map(item => {
          const socketData =
            profile.itemComponents.sockets.data[item.itemInstanceId];
          const sockets = socketData && socketData.sockets;

          let matches = false;
          const matchedPerks = [];
          const perks = [];
          sockets &&
            sockets.forEach(socket => {
              socket.reusablePlugHashes &&
                socket.reusablePlugHashes.forEach(plugHash => {
                  perks.push(plugHash);

                  if (selectedPerks.includes(plugHash)) {
                    matches = true;
                    matchedPerks.push(plugHash);
                  }
                });
            });

          return {
            instance: item,
            matches,
            matchedPerks,
            perks,
            sockets
          };
        })
        .filter(itemWrapper => itemWrapper.matches);

  const selectedItemHashes = flow(
    map(instanceId =>
      items.find(
        itemWrapper => itemWrapper.instance.itemInstanceId === instanceId
      )
    ),
    filter(Boolean),
    map(itemWrapper => itemWrapper.instance.itemHash),
    uniq()
  )(selectedItems);

  const groupItemByCategory = _groupItemByCategory(itemDefs);

  const perksWithItems = selectedPerks.map(perk => ({
    perkHash: perk,
    items: flow(
      filter(item => item.perks.includes(perk)),
      sortBy(item => item.matchedPerks.length * -1),
      groupItemByCategory
    )(items || [])
  }));

  const itemsByCategory = flow(groupItemByCategory)(items);

  return {
    selectedPerks,
    selectedItems,
    selectedItemHashes,
    items,
    perksWithItems,
    profile,
    itemsByCategory
  };
};

const _groupItemByCategory = itemDefs =>
  groupBy(item => {
    const itemDef = itemDefs[item.instance.itemHash];
    return (
      CATEGORIES.find(
        cat =>
          itemDef &&
          itemDef.itemCategoryHashes &&
          itemDef.itemCategoryHashes.includes(cat)
      ) || "other"
    );
  });

const CATEGORIES = [HELMET, ARMS, CHEST, LEGS, CLASS_ITEM];

const mapDispatchToActions = {
  ...perkActions
};

export default connect(
  mapStateToProps,
  mapDispatchToActions
)(CharacterPage);
