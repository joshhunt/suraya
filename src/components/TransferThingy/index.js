import React from "react";
import { groupBy, sortBy } from "lodash/fp";
import { connect } from "react-redux";

import transferItem, { VAULT } from "src/lib/transferItem";
import { useDefinitions } from "src/definitionsContext";

import DupeItemList from "src/components/DupeItemList";
import HeadingWithTransfers from "src/components/HeadingWithTransfers";

import s from "./styles.styl";

function TransferThingy({
  keepItems,
  junkItems,
  selectedItems,
  profile,
  accessToken,
  activeProfile,
  onTooltip,
  selectedItemHashes,
  onItemDeselect,
  onItemSelect
}) {
  const itemDefs = useDefinitions("InventoryItem");

  return (
    <div>
      <div className={s.groups}>
        <div className={s.itemGroup}>
          <HeadingWithTransfers
            profile={profile}
            items={keepItems}
            accessToken={accessToken}
            activeProfile={activeProfile}
          >
            Tagged items
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

          {keepItems.length === 0 && (
            <p className={s.helpText}>
              <em>Nothing yet. Click items to tag them.</em>
            </p>
          )}

          {keepItems.length !== 0 && (
            <div className={s.searchFilter}>
              DIM filter:{" "}
              <input
                value={keepItems
                  .map(item => `id:${item.instance.itemInstanceId}`)
                  .join(" or ")}
                readOnly
              />
            </div>
          )}
        </div>

        <div className={s.itemGroup}>
          <HeadingWithTransfers
            profile={profile}
            items={junkItems}
            accessToken={accessToken}
            activeProfile={activeProfile}
          >
            Everything else
          </HeadingWithTransfers>

          <DupeItemList
            items={junkItems}
            itemDefs={itemDefs}
            selectedItems={selectedItems}
            onTooltip={onTooltip}
            onItemDeselect={onItemDeselect}
            onItemSelect={onItemSelect}
            selectedItemHashes={selectedItemHashes}
          />

          {junkItems.length !== 0 && (
            <div className={s.searchFilter}>
              DIM filter:{" "}
              <input
                value={junkItems
                  .map(item => `id:${item.instance.itemInstanceId}`)
                  .join(" or ")}
                readOnly
              />
            </div>
          )}
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
