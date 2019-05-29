import React from "react";
import { shuffle, sortBy } from "lodash";
import { connect } from "react-redux";

import getItemsFromProfile from "src/lib/getItemsFromProfile";
import Item from "src/components/SmallItem";
import { useDefinitions } from "src/definitionsContext";

import transferItem, { VAULT } from "src/lib/transferItem";

import s from "./styles.styl";

const ITEM_COUNT = 50;

function TransferThingy({ items, profile, activeProfile, accessToken }) {
  const allDefs = useDefinitions();
  const itemDefs = useDefinitions("InventoryItem");
  const classDefs = useDefinitions("Class");

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
      <div className={s.itemList}>
        {items.map(item => (
          <div className={s.item}>
            <Item item={itemDefs[item.itemHash]} />
            <div>
              transfer to:
              <br />
              <button onClick={() => transfer(item, VAULT)}>vault</button>
              {Object.values(profile.characters.data).map(character => (
                <button onClick={() => transfer(item, character.characterId)}>
                  {classDefs[character.classHash] &&
                    classDefs[character.classHash].displayProperties.name}
                </button>
              ))}
            </div>
            <div>
              hash: {item.itemHash}
              <br />
              id: {item.itemInstanceId}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function mapStateToProps(state, ownProps) {
  const { pKey } = ownProps;
  const profile = state.profiles[pKey];
  const { selectedItems } = state.perkTool;

  const items =
    profile &&
    getItemsFromProfile(profile).filter(item => {
      return selectedItems.includes(item.itemInstanceId);
    });

  return {
    profile,
    activeProfile: state.profiles.$activeProfile,
    accessToken: state.auth.accessToken,
    items: items || []
  };
}

export default connect(mapStateToProps)(TransferThingy);
