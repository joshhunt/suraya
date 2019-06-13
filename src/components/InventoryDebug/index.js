import React, { useMemo, useRef } from "react";
import { get } from "lodash";
import { connect } from "react-redux";

import Character from "src/components/Character";
import BungieImage from "src/components/BungieImage";
import { useDefinitions } from "src/definitionsContext";

import { buildProfileStateMap, VAULT } from "src/lib/transferItem";

import s from "./styles.styl";

function InventoryDebug({ profile, onTooltip }) {
  const profileState = useMemo(() => profile && buildProfileStateMap(profile), [
    profile
  ]);

  const bucketDefs = useDefinitions("InventoryBucket");

  return (
    <div>
      <h1>Inventory debug</h1>

      {Object.entries(profileState).map(([characterId, buckets]) => {
        const character =
          characterId !== VAULT && profile.characters.data[characterId];
        return (
          <div className={s.inventory}>
            {character ? (
              <Character character={character} />
            ) : (
              <h3>Profile inventory</h3>
            )}

            {Object.entries(buckets).map(([bucketHash, bucketContent]) => {
              const bucket = bucketDefs[bucketHash];

              return (
                <div>
                  <h4>
                    {get(
                      bucket,
                      "displayProperties.name",
                      <em>No name - {bucketHash}</em>
                    )}
                  </h4>

                  <div className={s.itemList}>
                    {bucketContent.items &&
                      bucketContent.items.map(itemInstance => {
                        return (
                          <MinimalItem
                            instance={itemInstance}
                            onTooltip={onTooltip}
                          />
                        );
                      })}
                  </div>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

function MinimalItem({
  onTooltip,
  instance: { itemHash, quantity, itemInstanceId }
}) {
  const itemDef = useDefinitions("InventoryItem", itemHash);
  const tooltipActiveRef = useRef(false);

  // function onClick(ev) {
  //   ev.preventDefault();
  //   if (tooltipActiveRef.current) {
  //     onTooltip(ev, null);
  //   } else {
  //     onTooltip(ev, { instance: { itemInstanceId, itemHash } });
  //   }

  //   tooltipActiveRef.current = !tooltipActiveRef.current;
  // }

  function onMouseMove(ev) {
    onTooltip && onTooltip(ev, { instance: { itemInstanceId, itemHash } });
  }

  function onMouseLeave(ev) {
    onTooltip && onTooltip(ev);
  }

  return (
    <a
      className={s.item}
      href={`https://data.destinysets.com/i/InventoryItem:${itemHash}`}
      // onClick={onClick}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
    >
      {/* {get(itemDef, "displayProperties.name", itemHash)} */}
      {itemDef && itemDef.displayProperties.icon ? (
        <BungieImage className={s.icon} src={itemDef.displayProperties.icon} />
      ) : (
        <div className={s.noIcon} />
      )}

      {quantity > 1 && <div className={s.quantity}>{quantity}</div>}
    </a>
  );
}

function mapStateToProps(state, ownProps) {
  const { pKey } = ownProps;
  const profile = state.profiles[pKey];

  return {
    profile
  };
}

export default connect(mapStateToProps)(InventoryDebug);
