import React from "react";
import { flow, groupBy, toPairs, sortBy, mapValues, values } from "lodash/fp";
import { connect } from "react-redux";

import Item from "src/components/SmallItem";
import { useDefinitions } from "src/definitionsContext";

import transferItem, { VAULT } from "src/lib/transferItem";
import { ARMOUR_CATEGORIES } from "src/lib/destinyEnums";

import s from "./styles.styl";

const ITEM_COUNT = 50;

const groupByItem = groupBy(itemWrapper => itemWrapper.instance.itemHash);

function ItemList({
  items,
  itemDefs,
  selectedItems,
  onTooltip,
  onItemDeselect,
  onItemSelect,
  selectedItemHashes
}) {
  const groupedItems = flow(
    groupBy(itemWrapper => {
      const itemDef = itemDefs[itemWrapper.instance.itemHash];
      return (
        ARMOUR_CATEGORIES.find(
          cat =>
            itemDef &&
            itemDef.itemCategoryHashes &&
            itemDef.itemCategoryHashes.includes(cat)
        ) || "other"
      );
    }),
    mapValues(items =>
      flow(
        sortBy(item => item.matchedPerks.length * -1),
        groupByItem,
        values,
        sortBy([l => l.length * -1, l => l[0].matchedPerks.length * -1])
      )(items)
    ),
    toPairs
  )(items);

  return (
    <div className={s.itemSection}>
      {groupedItems.map(([itemCategoryHash, dupes]) => {
        return (
          <div className={s.category}>
            <h3>{itemCategoryHash}</h3>

            <div className={s.items}>
              {dupes.map(itemList => (
                <div className={s.dupeGroup}>
                  {itemList.map(itemWrapper => {
                    const { itemInstanceId, itemHash } = itemWrapper.instance;
                    const itemDef = itemDefs[itemHash];
                    const isSelected = selectedItems.includes(itemInstanceId);
                    return (
                      itemDef && (
                        <Item
                          onTooltipEnter={ev => onTooltip(ev, itemWrapper)}
                          onTooltipLeave={() => onTooltip(null)}
                          onClick={() =>
                            isSelected
                              ? onItemDeselect(itemInstanceId)
                              : onItemSelect(itemInstanceId)
                          }
                          isSelected={isSelected}
                          isDupe={
                            !isSelected && selectedItemHashes.includes(itemHash)
                          }
                          key={itemInstanceId}
                          item={itemDef}
                          itemWrapper={itemWrapper}
                        />
                      )
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

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
      <button onClick={transferMultiple}>
        Transfer {ITEM_COUNT} random items
      </button>

      <div className={s.groups}>
        <div className={s.itemGroup}>
          <h2>keep items</h2>

          <ItemList
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

          <ItemList
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
