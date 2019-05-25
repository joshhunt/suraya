import React, { useState } from "react";
import { flow, sortBy, filter, groupBy, uniq, map } from "lodash/fp";
import { connect } from "react-redux";

import { HELMET, ARMS, CHEST, LEGS, CLASS_ITEM } from "src/lib/destinyEnums";
import getItemsFromProfile from "src/lib/getItemsFromProfile";
import { useDefinitions } from "src/definitionsContext";

import * as perkActions from "src/store/perkTool";
import ItemPerkGrid from "src/components/ItemPerkGrid";
import ItemComparison from "src/components/ItemComparison";
import Tooltip from "src/components/Tooltip";

// import s from "./styles.styl";

const k = ({ membershipType, membershipId }) =>
  [membershipType, membershipId].join("/");

function CharacterPage({
  params,
  itemsByCategory,
  perksWithItems,
  addSelectedItemInstance,
  removeSelectedItemInstance,
  selectedItems,
  selectedItemHashes
}) {
  const itemDefs = useDefinitions("InventoryItem");
  const [activeTooltip, setActiveTooltip] = useState();

  const tooltipItemDef =
    activeTooltip &&
    activeTooltip.itemWrapper &&
    itemDefs[activeTooltip.itemWrapper.instance.itemHash];

  function onTooltip(ev, itemWrapper) {
    const x = ev && ev.clientX + 5;
    const y = ev && ev.clientY + 5;
    ev && itemWrapper
      ? setActiveTooltip({ itemWrapper, x, y })
      : setActiveTooltip(null);
  }

  return (
    <div>
      {tooltipItemDef && (
        <Tooltip
          top={activeTooltip.y}
          left={activeTooltip.x}
          itemInstanceId={activeTooltip.itemWrapper.instance.itemInstanceId}
          itemHash={tooltipItemDef.hash}
        />
      )}
      <ItemPerkGrid
        onTooltip={onTooltip}
        data={perksWithItems}
        onItemSelect={addSelectedItemInstance}
        onItemDeselect={removeSelectedItemInstance}
        selectedItems={selectedItems}
        selectedItemHashes={selectedItemHashes}
      />
      <br />
      <br />
      <ItemComparison
        onTooltip={onTooltip}
        data={itemsByCategory}
        onItemSelect={addSelectedItemInstance}
        onItemDeselect={removeSelectedItemInstance}
        selectedItems={selectedItems}
        selectedItemHashes={selectedItemHashes}
      />
      <br />
      <br />
      selected items:
      <input value={selectedItems.map(id => `id:${id}`).join(" or ")} />
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

  window.__HACKY_CURRENT_CLASS_TYPE = thisCharacter && thisCharacter.classType;

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
          const sockets = (socketData && socketData.sockets) || [];

          const perks = sockets.reduce((acc, socket) => {
            return uniq([
              socket.plugHash,
              ...acc,
              ...(socket.reusablePlugHashes || [])
            ]);
          }, []);

          const matchedPerks = perks.filter(perk =>
            selectedPerks.includes(perk)
          );

          return {
            instance: item,
            matches: matchedPerks.length > 0,
            matchedPerks,
            perks,
            sockets
          };
        });

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
