import React from "react";
import { groupBy, sortBy } from "lodash/fp";
import { connect } from "react-redux";

import transferItem, { VAULT } from "src/lib/transferItem";
import { useDefinitions } from "src/definitionsContext";

import DupeItemList from "src/components/DupeItemList";
import HeadingWithTransfers from "src/components/HeadingWithTransfers";

import s from "./styles.styl";

const ITEM_COUNT = 50;

function TransferThingy({
  keepItems,
  junkItems,
  selectedItems,
  profile,
  activeProfile,
  accessToken,
  onTooltip,
  selectedItemHashes,
  onItemDeselect,
  onItemSelect
}) {
  const allDefs = useDefinitions();
  const itemDefs = useDefinitions("InventoryItem");
  const classDefs = useDefinitions("Class");

  const items = []; // TODO: remove this when we update item transfering

  function transfer(item, destination) {
    transferItem(
      item,
      destination,
      profile,
      allDefs,
      activeProfile,
      accessToken
    ).catch(err => {
      console.error("Error transferring", err);
    });
  }

  async function transferMultiple() {
    const _itemsToTransfer = items;
    const itemsToTransfer = sortBy(_itemsToTransfer, i => i.itemInstanceId);
    const ids = itemsToTransfer.map(i => i.itemInstanceId);
    console.log("Going to transfer these items", itemsToTransfer);

    const TRANSFER_TO = "2305843009269703481";
    for (let index = 0; index < itemsToTransfer.length; index++) {
      const item = itemsToTransfer[index];
      console.log("%cgoing to transfer", "font-weight: bold;", item);
      try {
        await transferItem(
          item,
          TRANSFER_TO,
          profile,
          allDefs,
          accessToken,
          ids
        );
        console.log("%csuccess!", "font-weight: bold; color: green");
      } catch (err) {
        console.groupEnd();
        console.log("%cerror!", "font-weight: bold; color: red", err.message);
      }
    }
  }

  return (
    <div>
      <div className={s.groups}>
        <div className={s.itemGroup}>
          <HeadingWithTransfers profile={profile}>
            Keep Items
          </HeadingWithTransfers>

          <DupeItemList
            items={keepItems}
            itemDefs={itemDefs}
            selectedItems={selectedItems}
            onTooltip={onTooltip}
            onItemDeselect={onItemDeselect}
            onItemSelect={onItemSelect}
            selectedItemHashes={selectedItemHashes}
          />
        </div>

        <div className={s.itemGroup}>
          <h2>junk items</h2>

          <DupeItemList
            items={junkItems}
            itemDefs={itemDefs}
            selectedItems={selectedItems}
            onTooltip={onTooltip}
            onItemDeselect={onItemDeselect}
            onItemSelect={onItemSelect}
            selectedItemHashes={selectedItemHashes}
          />
        </div>
      </div>
    </div>
  );
}

function mapStateToProps(state, ownProps) {
  const { pKey, items } = ownProps;
  const profile = state.profiles[pKey];
  const { selectedItems } = state.perkTool;

  const { keepItems, junkItems } = groupBy(itemWrapper =>
    selectedItems.includes(itemWrapper.instance.itemInstanceId)
      ? "keepItems"
      : "junkItems"
  )(items);

  return {
    profile,
    activeProfile: state.profiles.$activeProfile,
    accessToken: state.auth.accessToken,
    keepItems: keepItems || [],
    junkItems: junkItems || []
  };
}

export default connect(mapStateToProps)(TransferThingy);
